import assert from "node:assert/strict";
import test from "node:test";
import { createBkashClient } from "./bkash-client.js";

test("bKash client uses the tokenized sandbox and keeps merchant credentials server-side", async () => {
  const requests = [];
  const fetchImpl = async (url, options) => {
    requests.push({ url: new URL(url), options });
    const path = new URL(url).pathname;
    const data = path.endsWith("/token/grant")
      ? { id_token: "mock-id-token", expires_in: 3600 }
      : path.endsWith("/create")
        ? { paymentID: "payment-1", bkashURL: "https://tokenized.sandbox.bka.sh/checkout/123" }
        : { paymentID: "payment-1", trxID: "trx-1", transactionStatus: "Completed" };
    return { ok: true, status: 200, json: async () => data };
  };
  const client = createBkashClient({
    appKey: "sandbox-app-key",
    appSecret: "sandbox-app-secret",
    username: "sandbox-username",
    password: "sandbox-password",
    fetchImpl,
  });

  const payment = await client.createPayment({
    amount: 85,
    invoiceNumber: "DTH-TEST-INVOICE",
    callbackUrl: "https://dth.example/api/payments/bkash/callback?purchaseId=receipt",
  });
  assert.equal(payment.paymentId, "payment-1");
  assert.equal(payment.checkoutUrl, "https://tokenized.sandbox.bka.sh/checkout/123");
  assert.equal(requests.length, 2);
  assert.equal(requests[0].url.pathname.endsWith("/token/grant"), true);
  assert.equal(requests[0].options.headers.Authorization, `Basic ${Buffer.from("sandbox-app-key:sandbox-app-secret").toString("base64")}`);
  assert.equal(requests[1].options.headers.Authorization, "mock-id-token");
  assert.equal(requests[1].options.headers["X-APP-Key"], "sandbox-app-key");
  assert.equal(JSON.parse(requests[1].options.body).amount, "85");
  assert.equal(JSON.parse(requests[1].options.body).currency, "BDT");
  assert.equal(requests[1].options.headers.password, "sandbox-password");

  await client.executePayment("payment-1");
  await client.queryPayment("payment-1");
  assert.equal(requests.length, 4, "valid cached identity token avoids repeated token grants");
  assert.ok(requests[2].url.pathname.endsWith("/execute/payment-1"));
  assert.ok(requests[3].url.pathname.endsWith("/query/payment-1"));
});

test("bKash client rejects non-provider checkout hosts and missing merchant credentials", async () => {
  assert.throws(
    () => createBkashClient({ baseUrl: "http://attacker.example/checkout" }),
    /official HTTPS bKash checkout host/,
  );
  const client = createBkashClient({
    appKey: "",
    appSecret: "",
    username: "",
    password: "",
    fetchImpl: async () => { throw new Error("Must not call unconfigured provider."); },
  });
  await assert.rejects(
    client.createPayment({ amount: 85, invoiceNumber: "DTH-TEST", callbackUrl: "https://dth.example/callback" }),
    (error) => error.statusCode === 503,
  );
});
