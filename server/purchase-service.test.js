import assert from "node:assert/strict";
import { once } from "node:events";
import test from "node:test";
import { createApp } from "./create-app.js";
import { createPurchaseService } from "./purchase-service.js";

const accessTokenSecret = "test-only-random-secret-with-at-least-32-bytes";
const subject = {
  id: "computer-1-starter-0-0",
  title: "Engineering Mathematics I",
  bnTitle: "ইঞ্জিনিয়ারিং গণিত ১",
  overview: "An overview of engineering mathematics.",
  bnOverview: "ইঞ্জিনিয়ারিং গণিতের পরিচিতি।",
  department: "computer",
  semester: 1,
  price: 85,
  driveUrl: "https://drive.google.com/file/d/subject-pdf/view",
};
const course = {
  id: "computer-semester-1",
  title: "Computer · 1st Semester Study Pack",
  bnTitle: "কম্পিউটার · ১ম পর্ব",
  description: "Semester package.",
  bnDescription: "সেমিস্টার প্যাকেজ।",
  department: "computer",
  semester: 1,
  price: 400,
  subjects: [subject],
};

function createMemoryRepository() {
  const products = new Map([
    [`subject:${subject.id}`, subject],
    [`course:${course.id}`, course],
  ]);
  const purchases = new Map();
  return {
    products,
    purchases,
    async findProduct(type, id) { return products.get(`${type}:${id}`) || null; },
    async createPurchase(data) {
      if ([...purchases.values()].some((purchase) => purchase.invoiceNumber === data.invoiceNumber)) {
        throw new Error("Invoice must be unique.");
      }
      purchases.set(data.id, { ...data });
      return purchases.get(data.id);
    },
    async updatePurchase(id, data) {
      const current = purchases.get(id);
      if (!current) throw Object.assign(new Error("Purchase not found."), { statusCode: 404 });
      Object.assign(current, data);
      return current;
    },
    async findPurchase(id) { return purchases.get(id) || null; },
    async markPurchasePaid(id, bkashPaymentId, bkashTransactionId) {
      const purchase = purchases.get(id);
      if (purchase.status === "PAID") return purchase;
      if (purchase.status !== "PENDING" || purchase.bkashPaymentId !== bkashPaymentId) {
        throw Object.assign(new Error("Purchase changed during verification."), { statusCode: 409 });
      }
      Object.assign(purchase, { status: "PAID", bkashTransactionId, paidAt: new Date() });
      return purchase;
    },
    async getPublicCatalog() {
      return {
        subjects: [{ ...subject, driveUrl: "" }],
        courses: [{ ...course, subjects: [{ ...subject, driveUrl: "" }] }],
      };
    },
    async createSubject(data) { products.set(`subject:${data.id}`, data); return data; },
    async updateSubject(id, data) {
      const current = products.get(`subject:${id}`);
      if (!current) throw Object.assign(new Error("Subject not found."), { statusCode: 404 });
      Object.assign(current, data);
      return current;
    },
    async deleteSubject(id) {
      const current = products.get(`subject:${id}`);
      if (!current) throw Object.assign(new Error("Subject not found."), { statusCode: 404 });
      products.delete(`subject:${id}`);
      return current;
    },
    async updateCourse(id, data) {
      const current = products.get(`course:${id}`);
      if (!current) throw Object.assign(new Error("Course not found."), { statusCode: 404 });
      Object.assign(current, data);
      return current;
    },
  };
}

function createFakeBkash({ amount = subject.price, invoiceNumber, available = true } = {}) {
  const state = { amount, invoiceNumber, created: [], executes: 0, queries: 0 };
  return {
    state,
    async createPayment(input) {
      state.created.push(input);
      state.invoiceNumber = input.invoiceNumber;
      if (!available) throw Object.assign(new Error("No merchant configuration."), { statusCode: 503 });
      return { paymentId: "test-bkash-payment-1", checkoutUrl: "https://tokenized.sandbox.bka.sh/checkout/123" };
    },
    async executePayment() {
      state.executes += 1;
      return {
        paymentID: "test-bkash-payment-1",
        transactionStatus: "Completed",
        amount: String(state.amount),
        currency: "BDT",
        merchantInvoiceNumber: state.invoiceNumber,
        trxID: "DTH-TEST-TRX",
      };
    },
    async queryPayment() {
      state.queries += 1;
      return {
        paymentID: "test-bkash-payment-1",
        transactionStatus: "Completed",
        amount: String(state.amount),
        currency: "BDT",
        merchantInvoiceNumber: state.invoiceNumber,
        trxID: "DTH-TEST-TRX",
      };
    },
  };
}

test("purchase service rejects PDFs without a Google Drive link before creating a payment", async () => {
  const repository = createMemoryRepository();
  const bkash = createFakeBkash();
  const service = createPurchaseService({
    repository,
    bkash,
    publicApiUrl: "http://localhost:3001",
    frontendUrl: "http://localhost:5173",
    accessTokenSecret,
  });
  repository.products.set(`subject:${subject.id}`, { ...subject, driveUrl: "" });

  await assert.rejects(
    service.startCheckout({ productId: subject.id, productType: "subject" }),
    (error) => error.statusCode === 409,
  );
  assert.equal(repository.purchases.size, 0);
  assert.equal(bkash.state.created.length, 0);
});

test("semester pack checkout requires every included subject PDF to have a Drive link", async () => {
  const repository = createMemoryRepository();
  const bkash = createFakeBkash();
  const service = createPurchaseService({
    repository,
    bkash,
    publicApiUrl: "http://localhost:3001",
    frontendUrl: "http://localhost:5173",
    accessTokenSecret,
  });
  repository.products.set(`course:${course.id}`, {
    ...course,
    subjects: [{ ...subject, driveUrl: null }],
  });

  await assert.rejects(
    service.startCheckout({ productId: course.id, productType: "course" }),
    (error) => error.statusCode === 409,
  );
  assert.equal(repository.purchases.size, 0);
  assert.equal(bkash.state.created.length, 0);
});

test("bKash callback verifies amount and invoice before granting a Drive link", async () => {
  const repository = createMemoryRepository();
  const bkash = createFakeBkash();
  const service = createPurchaseService({
    repository,
    bkash,
    publicApiUrl: "http://localhost:3001",
    frontendUrl: "http://localhost:5173",
    accessTokenSecret,
  });

  const checkout = await service.startCheckout({ productId: subject.id, productType: "subject" });
  assert.equal(bkash.state.created[0].amount, subject.price, "amount comes from the database product, not client input");
  assert.equal(repository.purchases.size, 1);
  const pendingPurchase = [...repository.purchases.values()][0];
  assert.equal(pendingPurchase.status, "PENDING");
  await assert.rejects(
    service.getPurchaseDetails({ purchaseId: pendingPurchase.id, accessKey: "invalid-token-value-that-is-long-enough" }),
    (error) => error.statusCode === 404,
  );

  const callback = await service.handleCallback({
    purchaseId: pendingPurchase.id,
    paymentId: "test-bkash-payment-1",
    status: "success",
  });
  const redirect = new URL(callback);
  const accessKey = redirect.searchParams.get("accessKey");
  assert.equal(redirect.pathname, "/payment/details");
  assert.ok(accessKey);
  assert.equal(repository.purchases.get(pendingPurchase.id).status, "PAID");
  assert.equal(bkash.state.executes, 1);
  assert.equal(bkash.state.queries, 1);

  const details = await service.getPurchaseDetails({ purchaseId: pendingPurchase.id, accessKey });
  assert.equal(details.title, subject.title);
  assert.equal(details.amount, subject.price);
  assert.equal(details.transactionId, "DTH-TEST-TRX");
  assert.equal(details.files[0].driveUrl, subject.driveUrl);

  const publicCatalog = await repository.getPublicCatalog();
  assert.equal(publicCatalog.subjects[0].driveUrl, "");
  const replay = await service.handleCallback({
    purchaseId: pendingPurchase.id,
    paymentId: "test-bkash-payment-1",
    status: "cancel",
  });
  assert.equal(new URL(replay).searchParams.get("accessKey"), accessKey);
  assert.equal(repository.purchases.get(pendingPurchase.id).status, "PAID");
  assert.ok(checkout.checkoutUrl.includes("sandbox.bka.sh"));
});

test("mismatched provider amount never grants the paid subject PDF", async () => {
  const repository = createMemoryRepository();
  const bkash = createFakeBkash({ amount: subject.price + 1 });
  const service = createPurchaseService({
    repository,
    bkash,
    publicApiUrl: "http://localhost:3001",
    frontendUrl: "http://localhost:5173",
    accessTokenSecret,
  });
  await service.startCheckout({ productId: subject.id, productType: "subject" });
  const purchase = [...repository.purchases.values()][0];
  const callback = await service.handleCallback({
    purchaseId: purchase.id,
    paymentId: purchase.bkashPaymentId,
    status: "success",
  });
  assert.equal(new URL(callback).searchParams.get("status"), "failed");
  assert.equal(repository.purchases.get(purchase.id).status, "FAILED");
  assert.equal(bkash.state.queries, 1);
});

test("checkout API returns paid item detail page only after verified bKash confirmation", async (t) => {
  const repository = createMemoryRepository();
  const bkash = createFakeBkash();
  const app = createApp({
    repository,
    bkash,
    env: {
      NODE_ENV: "test",
      ACCESS_TOKEN_SECRET: accessTokenSecret,
      ADMIN_API_KEY: "test-admin-api-key-with-at-least-32-bytes",
      FRONTEND_URL: "http://localhost:5173",
      PUBLIC_API_URL: "http://localhost:3001",
    },
  });
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  const catalogueResponse = await fetch(`${baseUrl}/api/catalog`);
  assert.equal(catalogueResponse.status, 200);
  const catalog = await catalogueResponse.json();
  assert.equal(catalog.subjects[0].driveUrl, "");

  const checkoutResponse = await fetch(`${baseUrl}/api/payments/bkash/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId: subject.id, productType: "subject", price: 1, driveUrl: "https://attacker.example/file" }),
  });
  assert.equal(checkoutResponse.status, 201);
  const { checkoutUrl } = await checkoutResponse.json();
  assert.ok(checkoutUrl.includes("sandbox.bka.sh"));
  const purchase = [...repository.purchases.values()][0];

  const callback = await fetch(
    `${baseUrl}/api/payments/bkash/callback?purchaseId=${purchase.id}&paymentID=${purchase.bkashPaymentId}&status=success`,
    { redirect: "manual" },
  );
  assert.equal(callback.status, 303);
  const destination = new URL(callback.headers.get("location"));
  assert.equal(destination.pathname, "/payment/details");
  assert.ok(destination.searchParams.get("accessKey"));

  const denied = await fetch(`${baseUrl}/api/purchases/${purchase.id}`);
  assert.equal(denied.status, 404);
  const authorized = await fetch(`${baseUrl}/api/purchases/${purchase.id}`, {
    headers: { Authorization: `Bearer ${destination.searchParams.get("accessKey")}` },
  });
  assert.equal(authorized.status, 200);
  const receipt = await authorized.json();
  assert.equal(receipt.files[0].driveUrl, subject.driveUrl);

  const unauthorizedAdmin = await fetch(`${baseUrl}/api/admin/subjects/${subject.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ driveUrl: "https://drive.google.com/file/d/new/view" }),
  });
  assert.equal(unauthorizedAdmin.status, 401);
  const authorizedAdmin = await fetch(`${baseUrl}/api/admin/subjects/${subject.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "X-Admin-Key": "test-admin-api-key-with-at-least-32-bytes",
    },
    body: JSON.stringify({ driveUrl: "https://drive.google.com/file/d/new/view" }),
  });
  assert.equal(authorizedAdmin.status, 200);
  assert.equal((await authorizedAdmin.json()).driveUrl, "https://drive.google.com/file/d/new/view");
});

test("bKash credentials are not required until a paid checkout is requested", async () => {
  const repository = createMemoryRepository();
  const unavailableBkash = createFakeBkash({ available: false });
  const service = createPurchaseService({
    repository,
    bkash: unavailableBkash,
    publicApiUrl: "http://localhost:3001",
    frontendUrl: "http://localhost:5173",
    accessTokenSecret,
  });

  await assert.rejects(
    service.startCheckout({ productId: subject.id, productType: "subject" }),
    (error) => error.statusCode === 503,
  );
  assert.equal([...repository.purchases.values()][0].status, "FAILED");
});
