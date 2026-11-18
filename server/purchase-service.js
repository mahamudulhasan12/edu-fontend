import { createHash, createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { BkashProviderError } from "./bkash-client.js";

const accessKeyLifetimeMs = 7 * 24 * 60 * 60 * 1000;

function hashAccessKey(value) {
  return createHash("sha256").update(value).digest("hex");
}

function matchesAccessKey(value, expectedHash) {
  if (typeof value !== "string" || value.length < 32 || typeof expectedHash !== "string") return false;
  const candidate = Buffer.from(hashAccessKey(value), "hex");
  const expected = Buffer.from(expectedHash, "hex");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

function safePaymentDetails(payment) {
  return Boolean(
    payment &&
    String(payment.transactionStatus).toLowerCase() === "completed" &&
    payment.paymentID === payment.expectedPaymentId &&
    Number(payment.amount) === Number(payment.expectedAmount) &&
    String(payment.currency || "BDT").toUpperCase() === "BDT" &&
    payment.merchantInvoiceNumber === payment.expectedInvoice,
  );
}

export function createPurchaseService({
  repository,
  bkash,
  publicApiUrl,
  frontendUrl,
  accessTokenSecret = process.env.ACCESS_TOKEN_SECRET,
  now = Date.now,
}) {
  if (typeof accessTokenSecret !== "string" || Buffer.byteLength(accessTokenSecret) < 32) {
    throw new Error("ACCESS_TOKEN_SECRET must contain at least 32 bytes.");
  }
  const apiBase = new URL(publicApiUrl);
  const frontendBase = new URL(frontendUrl);

  function accessKeyFor(purchaseId) {
    return createHmac("sha256", accessTokenSecret).update(purchaseId).digest("base64url");
  }

  async function startCheckout({ productId, productType }) {
    if (!["subject", "course"].includes(productType) || typeof productId !== "string") {
      const error = new Error("Choose a valid subject or semester course.");
      error.statusCode = 400;
      throw error;
    }
    const product = await repository.findProduct(productType, productId);
    if (!product) {
      const error = new Error("This subject or course is no longer available.");
      error.statusCode = 404;
      throw error;
    }
    if (!Number.isSafeInteger(product.price) || product.price < 1) {
      const error = new Error("Only paid subjects and courses can use bKash checkout.");
      error.statusCode = 400;
      throw error;
    }
    const deliveryLinks = productType === "subject"
      ? [product.driveUrl]
      : product.subjects.map(({ driveUrl }) => driveUrl);
    if (deliveryLinks.length === 0 || deliveryLinks.some((url) => !isGoogleDriveUrl(url))) {
      const error = new Error("PDF delivery is not configured for this item yet.");
      error.statusCode = 409;
      throw error;
    }

    const id = randomUUID();
    const accessKey = accessKeyFor(id);
    const invoiceNumber = `DTH-${id.replaceAll("-", "").slice(0, 20).toUpperCase()}`;
    const expiresAt = new Date(now() + accessKeyLifetimeMs);
    await repository.createPurchase({
      id,
      productType,
      productId,
      amount: product.price,
      currency: "BDT",
      invoiceNumber,
      accessKeyHash: hashAccessKey(accessKey),
      status: "PENDING",
      expiresAt,
    });

    const callbackUrl = new URL("/api/payments/bkash/callback", `${apiBase.origin}/`);
    callbackUrl.searchParams.set("purchaseId", id);
    let payment;
    try {
      payment = await bkash.createPayment({
        amount: product.price,
        invoiceNumber,
        callbackUrl: callbackUrl.href,
        payerReference: `DTH-${productId.slice(0, 20)}`,
      });
    } catch (error) {
      await repository.updatePurchase(id, { status: "FAILED" });
      throw error;
    }
    await repository.updatePurchase(id, { bkashPaymentId: payment.paymentId });
    return { checkoutUrl: payment.checkoutUrl };
  }

  async function startFreeAccess({ productId }) {
    const product = await repository.findProduct("subject", productId);
    if (!product || product.price !== 0 || !isGoogleDriveUrl(product.driveUrl)) {
      const error = new Error("This free PDF is not configured for delivery.");
      error.statusCode = product ? 409 : 404;
      throw error;
    }

    const id = randomUUID();
    const accessKey = accessKeyFor(id);
    const invoiceNumber = `DTH-${id.replaceAll("-", "").slice(0, 20).toUpperCase()}`;
    await repository.createPurchase({
      id,
      productType: "subject",
      productId,
      amount: 0,
      currency: "BDT",
      invoiceNumber,
      accessKeyHash: hashAccessKey(accessKey),
      status: "PAID",
      paidAt: new Date(now()),
      expiresAt: new Date(now() + accessKeyLifetimeMs),
    });
    const redirect = new URL("/payment/details", `${frontendBase.origin}/`);
    redirect.searchParams.set("purchase", id);
    redirect.searchParams.set("accessKey", accessKey);
    return { checkoutUrl: redirect.href };
  }

  async function verifyPendingPayment(purchase) {
    if (purchase.status === "PAID") return "PAID";
    if (purchase.status !== "PENDING" || !purchase.bkashPaymentId) return purchase.status;

    let execution;
    let verification;
    try {
      execution = await bkash.executePayment(purchase.bkashPaymentId);
      verification = await bkash.queryPayment(purchase.bkashPaymentId);
    } catch (error) {
      if (!(error instanceof BkashProviderError) && error.name !== "AbortError" && error.name !== "TimeoutError") {
        console.error("Could not verify the bKash payment; purchase remains pending.", error);
      }
      return "PENDING";
    }

    const executed = safePaymentDetails({
      ...execution,
      expectedPaymentId: purchase.bkashPaymentId,
      expectedAmount: purchase.amount,
      expectedInvoice: purchase.invoiceNumber,
    });
    const queried = safePaymentDetails({
      ...verification,
      expectedPaymentId: purchase.bkashPaymentId,
      expectedAmount: purchase.amount,
      expectedInvoice: purchase.invoiceNumber,
    });
    const transactionId = execution.trxID || verification.trxID;
    if (!executed || !queried || !transactionId || (execution.trxID && verification.trxID && execution.trxID !== verification.trxID)) {
      await repository.updatePurchase(purchase.id, { status: "FAILED" });
      return "FAILED";
    }

    await repository.markPurchasePaid(purchase.id, purchase.bkashPaymentId, transactionId);
    return "PAID";
  }

  async function handleCallback({ purchaseId, paymentId, status }) {
    const failureRedirect = new URL("/payment/details", `${frontendBase.origin}/`);
    const purchase = await repository.findPurchase(purchaseId);
    if (!purchase) {
      failureRedirect.searchParams.set("status", "not-found");
      return failureRedirect.href;
    }
    if (purchase.status === "PAID") {
      return successRedirect(purchase);
    }
    if (String(status).toLowerCase() !== "success" || !paymentId) {
      failureRedirect.searchParams.set("status", "cancelled");
      return failureRedirect.href;
    }

    if (purchase.expiresAt <= new Date(now()) || !purchase.bkashPaymentId || purchase.bkashPaymentId !== paymentId) {
      failureRedirect.searchParams.set("status", "invalid");
      return failureRedirect.href;
    }

    const verifiedStatus = await verifyPendingPayment(purchase);
    if (verifiedStatus !== "PAID") {
      failureRedirect.searchParams.set("status", verifiedStatus === "FAILED" ? "failed" : "pending");
      failureRedirect.searchParams.set("purchase", purchase.id);
      failureRedirect.searchParams.set("accessKey", accessKeyFor(purchase.id));
      return failureRedirect.href;
    }

    const paidPurchase = await repository.findPurchase(purchase.id);
    return successRedirect(paidPurchase);
  }

  function successRedirect(purchase) {
    const redirect = new URL("/payment/details", `${frontendBase.origin}/`);
    redirect.searchParams.set("purchase", purchase.id);
    redirect.searchParams.set("accessKey", accessKeyFor(purchase.id));
    return redirect.href;
  }

  async function getPurchaseDetails({ purchaseId, accessKey }) {
    const purchase = await repository.findPurchase(purchaseId);
    if (
      !purchase ||
      purchase.expiresAt <= new Date(now()) ||
      !matchesAccessKey(accessKey, purchase.accessKeyHash)
    ) {
      const error = new Error("This purchase receipt is invalid or has expired.");
      error.statusCode = 404;
      throw error;
    }
    if (purchase.status !== "PAID") {
      return { id: purchase.id, status: purchase.status };
    }
    const product = await repository.findProduct(purchase.productType, purchase.productId);
    if (!product) {
      const error = new Error("The purchased item is no longer available.");
      error.statusCode = 404;
      throw error;
    }
    const files = purchase.productType === "subject"
      ? [{ title: product.title, bnTitle: product.bnTitle, driveUrl: product.driveUrl }]
      : product.subjects.map((subject) => ({
          title: subject.title,
          bnTitle: subject.bnTitle,
          driveUrl: subject.driveUrl,
        }));
    return {
      id: purchase.id,
      status: purchase.status,
      amount: purchase.amount,
      currency: purchase.currency,
      invoiceNumber: purchase.invoiceNumber,
      transactionId: purchase.bkashTransactionId,
      paidAt: purchase.paidAt,
      productType: purchase.productType,
      title: product.title,
      bnTitle: product.bnTitle,
      description: product.description || product.overview,
      bnDescription: product.bnDescription || product.bnOverview,
      department: product.department,
      semester: product.semester,
      files,
    };
  }

  async function verifyPurchaseAccess({ purchaseId, accessKey }) {
    const purchase = await repository.findPurchase(purchaseId);
    if (
      !purchase ||
      purchase.expiresAt <= new Date(now()) ||
      !matchesAccessKey(accessKey, purchase.accessKeyHash)
    ) {
      const error = new Error("This purchase receipt is invalid or has expired.");
      error.statusCode = 404;
      throw error;
    }
    await verifyPendingPayment(purchase);
    return getPurchaseDetails({ purchaseId, accessKey });
  }

  function isGoogleDriveUrl(value) {
    try {
      const url = new URL(value);
      return url.protocol === "https:" &&
        (url.hostname === "drive.google.com" || url.hostname === "docs.google.com");
    } catch {
      return false;
    }
  }

  return {
    startCheckout,
    startFreeAccess,
    handleCallback,
    getPurchaseDetails,
    verifyPurchaseAccess,
  };
}
