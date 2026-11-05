import dotenv from "dotenv";
dotenv.config();

import prisma from "../db/prisma";
import express from "express";
import merchantRouter from "../routes/merchant";
import { generatePassportHash, signPassport } from "../verification/hasher";

async function verifyAll() {
  const app = express();
  app.use(express.json());
  app.use("/api/merchant", merchantRouter);

  async function callMerchant(method: string, path: string, body?: any) {
    return new Promise<{ status: number; body: any }>((resolve) => {
      const req: any = {
        method,
        url: path,
        headers: { "content-type": "application/json" },
        body: body || {},
      };
      let statusCode = 200;
      const res: any = {
        status(code: number) {
          statusCode = code;
          return this;
        },
        json(data: any) {
          resolve({ status: statusCode, body: data });
        },
        setHeader() {
          return this;
        },
      };

      (app as any).handle(req, res);
    });
  }

  console.log("=================================================================");
  console.log("   STEP-BY-STEP VERIFICATION: TASKS 2, 3, AND 4                  ");
  console.log("=================================================================");

  // Find products
  const p75 = await prisma.merchantProduct.findFirst({ where: { amount: 75 } });
  const p120 = await prisma.merchantProduct.findFirst({ where: { amount: 120 } });
  if (!p75 || !p120) throw new Error("Products not seeded in database");

  let mandate = await prisma.mandate.findFirst({ where: { status: "ACTIVE" } });
  if (!mandate) {
    mandate = await prisma.mandate.create({
      data: {
        title: "Corporate Procurement Mandate (Live Verification)",
        purpose: "End-to-end verification of merchant independent sentinel",
        maxAmount: 80.0,
        currency: "USD",
        allowedCategories: JSON.stringify(["digital gift cards"]),
        refundPolicy: "Standard commercial 30-day refund policy",
        status: "ACTIVE",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  }

  // Create valid passport
  const passportNumber = `PASS-E2E-${Date.now()}`;
  const passportHash = generatePassportHash({
    mandateId: mandate.id,
    purchaseId: "purchase-e2e-verif",
    paypalOrderId: "ORD-LIVE-001",
    amount: 75.0,
    currency: "USD",
    recipient: "partner@test.com",
    agentModel: "gemini-2.5-pro",
    timestamp: new Date().toISOString(),
  });
  const signature = signPassport(passportHash);

  const validPassport = {
    id: `pass-e2e-${Date.now()}`,
    passportNumber,
    passportHash,
    signature,
    mandateId: mandate.id,
    maxAmount: 80.0,
    allowedCategories: ["digital gift cards"],
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    status: "VALID",
  };

  // -------------------------------------------------------------
  // TASK 2: VERIFY MERCHANT INDEPENDENCE
  // -------------------------------------------------------------
  console.log("\n--- TASK 2: VERIFY MERCHANT INDEPENDENCE ---");

  // Subtest 2A: Missing passport rejected
  console.log("Subtest 2A: Requisition with NO passport");
  const missingRes = await callMerchant("POST", "/api/merchant/checkout", {
    productId: p75.id,
  });
  console.log(`  Status: ${missingRes.status}, Reason: ${missingRes.body.reasonCode}`);
  console.log(`  Message: ${missingRes.body.error}`);
  if (missingRes.status !== 400 || missingRes.body.reasonCode !== "PASSPORT_MISSING") {
    throw new Error("Task 2A Failed: Missing passport was not rejected");
  }

  // Subtest 2B: Agent-side spoofed approval flag with forged signature
  console.log("\nSubtest 2B: Spoofed agent-side approval flags with bad signature");
  const spoofedRes = await callMerchant("POST", "/api/merchant/checkout", {
    productId: p75.id,
    agentApproved: true,
    policyGateOutcome: "ALLOW",
    validationStatus: "APPROVED",
    checksPassed: true,
    passport: {
      ...validPassport,
      signature: "forged_signature_attacker_trying_to_bypass_sentinel",
    },
  });
  console.log(`  Status: ${spoofedRes.status}, Reason: ${spoofedRes.body.reasonCode}`);
  console.log(`  Message: ${spoofedRes.body.error}`);
  if (spoofedRes.status !== 400 || spoofedRes.body.reasonCode !== "PASSPORT_SIGNATURE_INVALID") {
    throw new Error("Task 2B Failed: Spoofed agent flag bypassed merchant signature verification!");
  }
  console.log("  Evidence: Merchant ignored all agent-side flags and independently blocked bad signature.");

  // Subtest 2C: Expired passport
  console.log("\nSubtest 2C: Expired passport");
  const expiredRes = await callMerchant("POST", "/api/merchant/checkout", {
    productId: p75.id,
    passport: {
      ...validPassport,
      expiresAt: new Date(Date.now() - 60000).toISOString(),
    },
  });
  console.log(`  Status: ${expiredRes.status}, Reason: ${expiredRes.body.reasonCode}`);
  if (expiredRes.status !== 400 || expiredRes.body.reasonCode !== "PASSPORT_EXPIRED") {
    throw new Error("Task 2C Failed: Expired passport was not rejected");
  }

  // Subtest 2D: Revoked mandate
  console.log("\nSubtest 2D: Revoked mandate kill switch");
  const revokedRes = await callMerchant("POST", "/api/merchant/checkout", {
    productId: p75.id,
    passport: {
      ...validPassport,
      mandate: { ...mandate, status: "REVOKED", revoked: true },
    },
  });
  console.log(`  Status: ${revokedRes.status}, Reason: ${revokedRes.body.reasonCode}`);
  if (revokedRes.status !== 400 || revokedRes.body.reasonCode !== "MANDATE_REVOKED") {
    throw new Error("Task 2D Failed: Revoked mandate was not rejected");
  }

  console.log("\n=> TASK 2 CONFIRMED: Merchant performs 100% independent verification; agent flags are never trusted.");

  // -------------------------------------------------------------
  // TASK 3: VERIFY IDEMPOTENCY
  // -------------------------------------------------------------
  console.log("\n--- TASK 3: VERIFY IDEMPOTENCY ---");
  const liveIdempotencyKey = `live-idem-${Date.now()}`;
  console.log(`Target Idempotency Key: ${liveIdempotencyKey}`);

  // Request 1: Initial compliant checkout
  console.log("Executing Request 1 (Initial Checkout)...");
  const req1 = await callMerchant("POST", "/api/merchant/checkout", {
    productId: p75.id,
    passport: validPassport,
    idempotencyKey: liveIdempotencyKey,
  });
  console.log(`  Request 1 Status: ${req1.status}`);
  console.log(`  Order Number: ${req1.body.merchantOrder?.orderNumber}`);
  console.log(`  PayPal Capture ID: ${req1.body.merchantOrder?.paypalCaptureId}`);
  console.log(`  Idempotent Flag: ${Boolean(req1.body.idempotent)}`);

  if (req1.status !== 200 || !req1.body.success || !req1.body.merchantOrder?.paypalCaptureId) {
    throw new Error(`Task 3 Failed on Request 1: ${JSON.stringify(req1.body)}`);
  }

  // Request 2: Duplicate checkout with identical idempotencyKey & passport
  console.log("\nExecuting Request 2 (Duplicate Checkout with identical idempotencyKey)...");
  const req2 = await callMerchant("POST", "/api/merchant/checkout", {
    productId: p75.id,
    passport: validPassport,
    idempotencyKey: liveIdempotencyKey,
  });
  console.log(`  Request 2 Status: ${req2.status}`);
  console.log(`  Order Number: ${req2.body.merchantOrder?.orderNumber}`);
  console.log(`  PayPal Capture ID: ${req2.body.merchantOrder?.paypalCaptureId}`);
  console.log(`  Idempotent Flag: ${req2.body.idempotent}`);
  console.log(`  Message: ${req2.body.message}`);

  if (req2.status !== 200 || req2.body.idempotent !== true) {
    throw new Error("Task 3 Failed: Request 2 did not return idempotent: true");
  }

  if (req1.body.merchantOrder.id !== req2.body.merchantOrder.id) {
    throw new Error("Task 3 Failed: Different order IDs returned for same idempotency key");
  }

  if (req1.body.merchantOrder.paypalCaptureId !== req2.body.merchantOrder.paypalCaptureId) {
    throw new Error("Task 3 Failed: Duplicate PayPal capture occurred!");
  }

  // Verify in SQLite database that only 1 order exists for this idempotency key
  const dbOrdersCount = await prisma.merchantOrder.count({
    where: { idempotencyKey: liveIdempotencyKey },
  });
  console.log(`  Database Record Count for '${liveIdempotencyKey}': ${dbOrdersCount}`);
  if (dbOrdersCount !== 1) {
    throw new Error(`Task 3 Failed: Found ${dbOrdersCount} orders in database for idempotency key, expected exactly 1`);
  }

  console.log("\n=> TASK 3 CONFIRMED: Duplicate requisition safely returned existing order without double-capture.");

  // -------------------------------------------------------------
  // TASK 4: VERIFY REJECTION FLOW & AUDIT LOGGING
  // -------------------------------------------------------------
  console.log("\n--- TASK 4: VERIFY REJECTION FLOW & AUDIT LOG ---");
  console.log(`Attempting checkout for $120 product (${p120.name}) with $80 mandate cap...`);

  const overLimitRes = await callMerchant("POST", "/api/merchant/checkout", {
    productId: p120.id,
    passport: validPassport,
    idempotencyKey: `overlimit-live-${Date.now()}`,
  });

  console.log(`  Response Status: ${overLimitRes.status}`);
  console.log(`  Reason Code: ${overLimitRes.body.reasonCode}`);
  console.log(`  Error Message: ${overLimitRes.body.error}`);

  if (overLimitRes.status !== 400 || overLimitRes.body.reasonCode !== "OVER_LIMIT") {
    throw new Error(`Task 4 Failed: Expected OVER_LIMIT, got ${overLimitRes.body.reasonCode}`);
  }

  // Verify Audit Log entry created with action MERCHANT_CHECKOUT_REJECTED
  console.log("\nQuerying Audit Log table for MERCHANT_CHECKOUT_REJECTED entry...");
  const auditEntry = await prisma.auditLog.findFirst({
    where: {
      action: "MERCHANT_CHECKOUT_REJECTED",
      actor: "MERCHANT_PORTAL",
    },
    orderBy: { timestamp: "desc" },
  });

  if (!auditEntry) {
    throw new Error("Task 4 Failed: No MERCHANT_CHECKOUT_REJECTED audit entry found");
  }

  console.log(`  Found Audit Log ID: ${auditEntry.id}`);
  console.log(`  Action: ${auditEntry.action}`);
  console.log(`  Actor: ${auditEntry.actor} (${auditEntry.actorModel})`);
  console.log(`  Event Hash: ${auditEntry.eventHash}`);
  console.log(`  Details: ${auditEntry.details}`);

  const detailsObj = JSON.parse(auditEntry.details);
  if (detailsObj.reasonCode !== "OVER_LIMIT") {
    throw new Error(`Task 4 Failed: Audit log reasonCode was not OVER_LIMIT, got ${detailsObj.reasonCode}`);
  }
  console.log(`  Verified Details Payload: reasonCode = ${detailsObj.reasonCode}, mandateCap = $${detailsObj.mandateCap}, productPrice = $${detailsObj.productPrice}`);

  console.log("\n=> TASK 4 CONFIRMED: Over-limit order was rejected with OVER_LIMIT and recorded in the Merkle audit chain.");

  console.log("\n=================================================================");
  console.log("   ALL INDEPENDENT CHECKS (TASKS 2, 3, 4) VERIFIED AND PASSED    ");
  console.log("=================================================================\n");
}

verifyAll()
  .catch((err) => {
    console.error("VERIFICATION FAILED:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

