const timeoutMs = 12_000;

export class BkashProviderError extends Error {
  constructor(message, statusCode = 502) {
    super(message);
    this.name = "BkashProviderError";
    this.statusCode = statusCode;
  }
}

export function createBkashClient({
  appKey = process.env.BKASH_APP_KEY,
  appSecret = process.env.BKASH_APP_SECRET,
  username = process.env.BKASH_USERNAME,
  password = process.env.BKASH_PASSWORD,
  baseUrl = process.env.BKASH_BASE_URL || "https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout",
  fetchImpl = globalThis.fetch,
} = {}) {
  const base = new URL(baseUrl);
  if (
    base.protocol !== "https:" ||
    !["tokenized.sandbox.bka.sh", "tokenized.pay.bka.sh"].includes(base.hostname)
  ) {
    throw new Error("BKASH_BASE_URL must use an official HTTPS bKash checkout host.");
  }
  if (process.env.NODE_ENV === "production" && base.hostname !== "tokenized.pay.bka.sh") {
    throw new Error("Production bKash checkouts must use the official live payment host.");
  }

  let token = "";
  let tokenExpiresAt = 0;
  let tokenPromise;

  function requireCredentials() {
    if (![appKey, appSecret, username, password].every((item) => typeof item === "string" && item.length > 0)) {
      throw new BkashProviderError("bKash merchant credentials are not configured.", 503);
    }
  }

  async function request(path, { method = "POST", body, idToken, authorization } = {}) {
    requireCredentials();
    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-APP-Key": appKey,
      username,
      password,
    };
    if (idToken) headers.Authorization = idToken;
    if (authorization) headers.Authorization = authorization;
    const response = await fetchImpl(new URL(path, `${base.href.replace(/\/+$/, "")}/`), {
      method,
      headers,
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      signal: AbortSignal.timeout(timeoutMs),
    });
    let data;
    try {
      data = await response.json();
    } catch (error) {
      throw new BkashProviderError(`bKash returned invalid JSON (HTTP ${response.status}).`);
    }
    if (!response.ok || data.statusCode && !["0000", "000"].includes(String(data.statusCode))) {
      throw new BkashProviderError(`bKash rejected the request (HTTP ${response.status}).`);
    }
    return data;
  }

  async function getIdToken() {
    if (token && tokenExpiresAt > Date.now() + 60_000) return token;
    if (!tokenPromise) {
      tokenPromise = request("token/grant", {
        authorization: `Basic ${Buffer.from(`${appKey}:${appSecret}`).toString("base64")}`,
        body: { app_key: appKey, app_secret: appSecret },
      }).then((data) => {
        if (typeof data.id_token !== "string" || !data.id_token) {
          throw new BkashProviderError("bKash did not return an identity token.");
        }
        token = data.id_token;
        tokenExpiresAt = Date.now() + Math.max(60, Number(data.expires_in) || 3600) * 1000;
        return token;
      }).finally(() => {
        tokenPromise = undefined;
      });
    }
    return tokenPromise;
  }

  return {
    async createPayment({ amount, invoiceNumber, callbackUrl, payerReference }) {
      const idToken = await getIdToken();
      const result = await request("create", {
        idToken,
        body: {
          mode: "0011",
          payerReference: payerReference || "DTH-STUDENT",
          callbackURL: callbackUrl,
          amount: String(amount),
          currency: "BDT",
          intent: "sale",
          merchantInvoiceNumber: invoiceNumber,
        },
      });
      if (typeof result.paymentID !== "string" || typeof result.bkashURL !== "string") {
        throw new BkashProviderError("bKash did not return a usable checkout session.");
      }
      const checkoutUrl = new URL(result.bkashURL);
      if (
        checkoutUrl.protocol !== "https:" ||
        !["tokenized.sandbox.bka.sh", "tokenized.pay.bka.sh"].includes(checkoutUrl.hostname)
      ) {
        throw new BkashProviderError("bKash returned an invalid checkout URL.");
      }
      return { paymentId: result.paymentID, checkoutUrl: checkoutUrl.href };
    },

    async executePayment(paymentId) {
      const idToken = await getIdToken();
      return request(`execute/${encodeURIComponent(paymentId)}`, { idToken });
    },

    async queryPayment(paymentId) {
      const idToken = await getIdToken();
      return request(`query/${encodeURIComponent(paymentId)}`, { idToken });
    },
  };
}
