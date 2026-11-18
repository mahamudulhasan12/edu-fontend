import { randomUUID, timingSafeEqual } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createBkashClient } from "./bkash-client.js";
import { createPurchaseService } from "./purchase-service.js";
import { departments } from "../src/data/catalog.js";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function isGoogleDriveUrl(value) {
  if (value === null || value === "") return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" &&
      (url.hostname === "drive.google.com" || url.hostname === "docs.google.com");
  } catch {
    return false;
  }
}

function validateProductUpdate(data, type) {
  const allowedFields = type === "subject"
    ? ["title", "bnTitle", "overview", "bnOverview", "price", "driveUrl"]
    : ["title", "bnTitle", "description", "bnDescription", "price"];
  const update = {};
  for (const [field, value] of Object.entries(data)) {
    if (!allowedFields.includes(field)) continue;
    if (["price"].includes(field)) {
      if (!Number.isSafeInteger(value) || value < (type === "subject" ? 0 : 1) || value > 100_000) {
        return null;
      }
      update[field] = value;
      continue;
    }
    if (field === "driveUrl") {
      if (typeof value !== "string" || !isGoogleDriveUrl(value)) return null;
      update[field] = value || null;
      continue;
    }
    const maxLength = field.toLowerCase().includes("overview") || field.toLowerCase().includes("description")
      ? 1_500
      : 160;
    if (typeof value !== "string" || !value.trim() || value.length > maxLength) return null;
    update[field] = value.trim();
  }
  return Object.keys(update).length ? update : null;
}

function createPurchaseIdLimiter() {
  return rateLimit({
    windowMs: 60_000,
    limit: 20,
    standardHeaders: "draft-7",
    legacyHeaders: false,
  });
}

export function createApp({ repository, bkash = createBkashClient(), env = process.env }) {
  const app = express();
  app.disable("x-powered-by");
  app.use(helmet({
    contentSecurityPolicy: env.NODE_ENV === "production" ? {
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
        imgSrc: ["'self'", "data:"],
        objectSrc: ["'none'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        connectSrc: ["'self'"],
        upgradeInsecureRequests: [],
      },
    } : false,
    referrerPolicy: { policy: "no-referrer" },
  }));
  app.use(express.json({ limit: "24kb" }));

  const publicApiUrl = env.PUBLIC_API_URL || `http://localhost:${env.PORT || 3001}`;
  const frontendUrl = env.FRONTEND_URL || "http://localhost:5173";
  if (env.NODE_ENV === "production") {
    const apiUrl = new URL(publicApiUrl);
    const siteUrl = new URL(frontendUrl);
    if (apiUrl.protocol !== "https:" || siteUrl.protocol !== "https:") {
      throw new Error("Production PUBLIC_API_URL and FRONTEND_URL must use HTTPS.");
    }
  }
  const purchases = createPurchaseService({
    repository,
    bkash,
    publicApiUrl,
    frontendUrl,
    accessTokenSecret: env.ACCESS_TOKEN_SECRET,
  });

  app.get("/api/health", (_request, response) => response.json({ status: "ok" }));

  app.get("/api/catalog", async (_request, response, next) => {
    try {
      response.set("Cache-Control", "no-store");
      response.json(await repository.getPublicCatalog());
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/catalog/:type/:id", async (request, response, next) => {
    try {
      if (!["subject", "course"].includes(request.params.type)) {
        return response.status(404).json({ error: "Catalogue item not found." });
      }
      const product = await repository.findProduct(request.params.type, request.params.id);
      if (!product) return response.status(404).json({ error: "Catalogue item not found." });
      const { driveUrl: _privateDriveUrl, subjects, ...publicProduct } = product;
      if (subjects) {
        publicProduct.subjects = subjects.map(({ driveUrl: _subjectDriveUrl, ...subject }) => subject);
      }
      response.set("Cache-Control", "no-store");
      response.json(publicProduct);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/payments/bkash/checkout", createPurchaseIdLimiter(), async (request, response, next) => {
    try {
      const { productId, productType } = request.body || {};
      if (
        typeof productId !== "string" ||
        productId.length > 100 ||
        !["subject", "course"].includes(productType)
      ) {
        return response.status(400).json({ error: "Choose a valid subject or semester course." });
      }
      response.set("Cache-Control", "no-store");
      response.status(201).json(await purchases.startCheckout({ productId, productType }));
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/resources/free-access", createPurchaseIdLimiter(), async (request, response, next) => {
    try {
      const { productId } = request.body || {};
      if (typeof productId !== "string" || productId.length > 100) {
        return response.status(400).json({ error: "Choose a valid free PDF." });
      }
      response.set("Cache-Control", "no-store");
      response.status(201).json(await purchases.startFreeAccess({ productId }));
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/payments/bkash/callback", async (request, response, next) => {
    try {
      const { purchaseId, paymentID, status } = request.query;
      if (
        typeof purchaseId !== "string" ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(purchaseId) ||
        typeof paymentID !== "string" ||
        paymentID.length > 200 ||
        typeof status !== "string"
      ) {
        return response.redirect(303, `${frontendUrl.replace(/\/+$/, "")}/payment/details?status=invalid`);
      }
      const destination = await purchases.handleCallback({ purchaseId, paymentId: paymentID, status });
      response.set("Cache-Control", "no-store");
      response.redirect(303, destination);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/purchases/:id", createPurchaseIdLimiter(), async (request, response, next) => {
    try {
      const accessKey = request.get("Authorization")?.match(/^Bearer ([A-Za-z0-9_-]{43})$/)?.[1];
      response.set("Cache-Control", "no-store");
      response.set("Referrer-Policy", "no-referrer");
      response.json(await purchases.getPurchaseDetails({
        purchaseId: request.params.id,
        accessKey,
      }));
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/purchases/:id/verify", createPurchaseIdLimiter(), async (request, response, next) => {
    try {
      const accessKey = request.get("Authorization")?.match(/^Bearer ([A-Za-z0-9_-]{43})$/)?.[1];
      response.set("Cache-Control", "no-store");
      response.set("Referrer-Policy", "no-referrer");
      response.json(await purchases.verifyPurchaseAccess({
        purchaseId: request.params.id,
        accessKey,
      }));
    } catch (error) {
      next(error);
    }
  });

  app.use("/api/admin", (request, response, next) => {
    const configuredKey = env.ADMIN_API_KEY;
    const suppliedKey = request.get("X-Admin-Key") || "";
    if (
      typeof configuredKey !== "string" ||
      configuredKey.length < 32 ||
      suppliedKey.length !== configuredKey.length ||
      !timingSafeEqual(Buffer.from(suppliedKey), Buffer.from(configuredKey))
    ) {
      return response.status(401).json({ error: "Admin authentication failed." });
    }
    next();
  });

  app.post("/api/admin/subjects", async (request, response, next) => {
    try {
      const subject = request.body || {};
      const data = validateProductUpdate(subject, "subject");
      if (
        !data ||
        typeof subject.department !== "string" ||
        !departments.some((department) => department.id === subject.department) ||
        !Number.isInteger(subject.semester) ||
        subject.semester < 1 ||
        subject.semester > 8
      ) {
        return response.status(400).json({ error: "A valid subject, department, semester, and price are required." });
      }
      const id = typeof subject.id === "string" && /^[a-z0-9-]{1,100}$/.test(subject.id)
        ? subject.id
        : `admin-${randomUUID()}`;
      const saved = await repository.createSubject({
        id,
        department: subject.department,
        semester: subject.semester,
        ...data,
      });
      response.status(201).json(saved);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/admin/subjects/:id", async (request, response, next) => {
    try {
      const update = validateProductUpdate(request.body || {}, "subject");
      if (!update) return response.status(400).json({ error: "Provide valid subject fields to update." });
      response.json(await repository.updateSubject(request.params.id, update));
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/admin/subjects/:id", async (request, response, next) => {
    try {
      response.json(await repository.deleteSubject(request.params.id));
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/admin/courses/:id", async (request, response, next) => {
    try {
      const update = validateProductUpdate(request.body || {}, "course");
      if (!update) return response.status(400).json({ error: "Provide valid course fields to update." });
      response.json(await repository.updateCourse(request.params.id, update));
    } catch (error) {
      next(error);
    }
  });

  if (env.NODE_ENV === "production") {
    app.use(express.static(path.join(root, "dist"), {
      index: false,
      setHeaders(response) {
        response.setHeader("Referrer-Policy", "no-referrer");
      },
    }));
    app.use(async (request, response, next) => {
      if (request.method !== "GET") return next();
      if (request.path.startsWith("/api/")) return next();
      try {
        response.set("Cache-Control", "no-store");
        response.send(await readFile(path.join(root, "dist", "index.html")));
      } catch (error) {
        next(error);
      }
    });
  }

  app.use((error, _request, response, _next) => {
    if (response.headersSent) return;
    const statusCode = Number.isInteger(error.statusCode) && error.statusCode >= 400 && error.statusCode < 600
      ? error.statusCode
      : 500;
    if (statusCode >= 500) {
      console.error("DTH request failed.", error);
    } else {
      console.warn("DTH request was rejected.", error.message);
    }
    response.status(statusCode).json({
      error: statusCode >= 500 ? "The request could not be completed. Please try again later." : error.message,
    });
  });

  return app;
}
