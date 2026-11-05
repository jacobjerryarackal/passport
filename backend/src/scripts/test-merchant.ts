import dotenv from "dotenv";
dotenv.config();

import prisma from "../db/prisma";
import express from "express";
import merchantRouter from "../routes/merchant";
import { generatePassportHash, signPassport } from "../verification/hasher";

async function runAcceptanceVerification() {
  console.log("=============================================================");
  console.log("   PASSPORT AI - MERCHANT SIDE ACCEPTANCE VERIFICATION       ");
  console.log("=============================================================");

  const app = express();
  app.use(express.json());
  app.use("/api/merchant", merchantRouter);

  // Setup simulated caller helper
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

  // 1. Verify Catalog Products
  console.log("\n[Test 1] Verifying GiftCardCo Catalog Products...");
  const prodRes = await callMerchant("GET", "/api/merchant/products");
  if (prodRes.status !== 200 || !prodRes.body.products || prodRes.body.products.length !== 4) {
    throw new Error(`Catalog products test failed: Expected 4 products, got ${prodRes.body.products?.length}`);
  }
  const products = prodRes.body.products;
  const amounts = products.map((p: any) => p.amount).sort((a: number, b: number) => a - b);
  console.log(`✓ Catalog verified: 4 products found with amounts: [${amounts.join(", ")}]`);
  const p75 = products.find((p: any) => p.amount === 75);
  const p120 = products.find((p: any) => p.amount === 120);

  // 2. Test Missing Passport
  console.log("\n[Test 2] Testing Missing Passport Requisition...");
  const missingPassRes = await callMerchant("POST", "/api/merchant/checkout", {
    productId: p75.id,
  });
  if (missingPassRes.status !== 400 || missingPassRes.body.reasonCode !== "PASSPORT_MISSING") {
    throw new Error(`Missing passport test failed: ${JSON.stringify(missingPassRes.body)}`);
  }
  console.log("✓ Correctly rejected with reasonCode: PASSPORT_MISSING");

  // Prepare a valid Mandate and Passport for tests
  let mandate = await prisma.mandate.findFirst({ where: { status: "ACTIVE" } });
  if (!mandate) {
    mandate = await prisma.mandate.create({
      data: {
        title: "Client Relations Mandate (Acceptance Test)",
        purpose: "Testing merchant verification and dispute defense",
        maxAmount: 80.0,
        currency: "USD",
        allowedCategories: JSON.stringify(["digital gift cards"]),
        refundPolicy: "Standard commercial 30-day refund policy",
        status: "ACTIVE",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  }

  const validPassportNumber = `PASS-TEST-${Date.now()}`;
  const validPassportHash = generatePassportHash({
    mandateId: mandate.id,
    purchaseId: "test-purchase-init",
    paypalOrderId: "TEST-ORDER-001",
    amount: 75.0,
    currency: "USD",
    recipient: "client@test.com",
    agentModel: "gemini-2.5-pro",
    timestamp: new Date().toISOString(),
  });
  const validSignature = signPassport(validPassportHash);

  const validPassport = {
    id: `pass-id-${Date.now()}`,
    passportNumber: validPassportNumber,
    passportHash: validPassportHash,
    signature: validSignature,
    mandateId: mandate.id,
    maxAmount: 80.0,
    allowedCategories: ["digital gift cards"],
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    status: "VALID",
  };

  // 3. Test Compliant In-Limit Requisition ($75 on $80 Mandate)
  console.log("\n[Test 3] Testing Compliant Requisition ($75 against $80 cap)...");
  const testIdempotencyKey = `idemp-${Date.now()}`;
  const compRes = await callMerchant("POST", "/api/merchant/checkout", {
    productId: p75.id,
    passport: validPassport,
    idempotencyKey: testIdempotencyKey,
  });
  if (compRes.status !== 200 || !compRes.body.success || compRes.body.merchantOrder?.status !== "CAPTURED") {
    throw new Error(`Compliant checkout failed: ${JSON.stringify(compRes.body)}`);
  }
  console.log(`✓ Compliant requisition accepted! Order: ${compRes.body.merchantOrder.orderNumber}, Capture ID: ${compRes.body.merchantOrder.paypalCaptureId}`);

  // 4. Test Idempotency (Repeat checkout with same idempotencyKey)
  console.log("\n[Test 4] Testing Checkout Idempotency (replay attack prevention)...");
  const idempRes = await callMerchant("POST", "/api/merchant/checkout", {
    productId: p75.id,
    passport: validPassport,
    idempotencyKey: testIdempotencyKey,
  });
  if (idempRes.status !== 200 || !idempRes.body.idempotent) {
    throw new Error(`Idempotency check failed: ${JSON.stringify(idempRes.body)}`);
  }
  console.log("✓ Idempotency confirmed: Existing order returned without duplicate PayPal capture");

  // 5. Test Over-Limit Requisition ($120 on $80 Mandate)
  console.log("\n[Test 5] Testing Over-Limit Requisition ($120 against $80 cap)...");
  const overLimitRes = await callMerchant("POST", "/api/merchant/checkout", {
    productId: p120.id,
    passport: validPassport,
    idempotencyKey: `overlimit-${Date.now()}`,
  });
  if (overLimitRes.status !== 400 || overLimitRes.body.reasonCode !== "OVER_LIMIT") {
    throw new Error(`Over-limit check failed: ${JSON.stringify(overLimitRes.body)}`);
  }
  console.log(`✓ Correctly rejected with reasonCode: OVER_LIMIT (${overLimitRes.body.error})`);

  // 6. Test Tampered / Forged Passport Signature
  console.log("\n[Test 6] Testing Tampered Attestation Signature...");
  const tamperedPassport = {
    ...validPassport,
    signature: "corrupted_or_forged_ed25519_signature_payload",
  };
  const tamperedRes = await callMerchant("POST", "/api/merchant/checkout", {
    productId: p75.id,
    passport: tamperedPassport,
    idempotencyKey: `tampered-${Date.now()}`,
  });
  if (tamperedRes.status !== 400 || tamperedRes.body.reasonCode !== "PASSPORT_SIGNATURE_INVALID") {
    throw new Error(`Tampered signature check failed: ${JSON.stringify(tamperedRes.body)}`);
  }
  console.log(`✓ Correctly rejected with reasonCode: PASSPORT_SIGNATURE_INVALID`);

  // 7. Test Expired Passport
  console.log("\n[Test 7] Testing Expired Passport...");
  const expiredPassport = {
    ...validPassport,
    expiresAt: new Date(Date.now() - 100000).toISOString(),
  };
  const expiredRes = await callMerchant("POST", "/api/merchant/checkout", {
    productId: p75.id,
    passport: expiredPassport,
    idempotencyKey: `expired-${Date.now()}`,
  });
  if (expiredRes.status !== 400 || expiredRes.body.reasonCode !== "PASSPORT_EXPIRED") {
    throw new Error(`Expired passport check failed: ${JSON.stringify(expiredRes.body)}`);
  }
  console.log(`✓ Correctly rejected with reasonCode: PASSPORT_EXPIRED`);

  // 8. Test Revoked Mandate / Kill Switch
  console.log("\n[Test 8] Testing Revoked Mandate (Account Owner Kill Switch)...");
  const revokedPassport = {
    ...validPassport,
    mandate: {
      ...mandate,
      status: "REVOKED",
      revoked: true,
    },
  };
  const revokedRes = await callMerchant("POST", "/api/merchant/checkout", {
    productId: p75.id,
    passport: revokedPassport,
    idempotencyKey: `revoked-${Date.now()}`,
  });
  if (revokedRes.status !== 400 || revokedRes.body.reasonCode !== "MANDATE_REVOKED") {
    throw new Error(`Revoked mandate check failed: ${JSON.stringify(revokedRes.body)}`);
  }
  console.log(`✓ Correctly rejected with reasonCode: MANDATE_REVOKED`);

  // 9. Verify Merchant Orders and Stats API
  console.log("\n[Test 9] Verifying GET /api/merchant/orders...");
  const ordersRes = await callMerchant("GET", "/api/merchant/orders");
  if (ordersRes.status !== 200 || !ordersRes.body.orders || !ordersRes.body.stats) {
    throw new Error(`Orders fetch failed: ${JSON.stringify(ordersRes.body)}`);
  }
  const { orders, stats } = ordersRes.body;
  console.log(`✓ Ledger retrieved: ${orders.length} total orders recorded.`);
  console.log(`  - Verified & Captured: ${stats.verifiedSettled} ($${stats.grossSettledVolume.toFixed(2)})`);
  console.log(`  - Rejections Intercepted: ${stats.rejectedCount}`);

  // 10. Verify Audit Log Integration
  console.log("\n[Test 10] Verifying Audit Trail Logging...");
  const auditLogs = await prisma.auditLog.findMany({
    where: { actor: "MERCHANT_PORTAL" },
    orderBy: { timestamp: "desc" },
    take: 5,
  });
  if (auditLogs.length === 0) {
    throw new Error("No merchant audit logs found in Merkle audit chain");
  }
  console.log(`✓ Found ${auditLogs.length} recent merchant audit entries with tamper-evident event hashes.`);
  const latestAudit = auditLogs[0];
  console.log(`  - Action: ${latestAudit.action}, Hash: ${latestAudit.eventHash.slice(0, 16)}...`);

  console.log("\n=============================================================");
  console.log("   ALL MERCHANT ACCEPTANCE CHECKS PASSED PERFECTLY (10/10)   ");
  console.log("=============================================================\n");
}

runAcceptanceVerification()
  .catch((err) => {
    console.error("ACCEPTANCE VERIFICATION FAILED:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
