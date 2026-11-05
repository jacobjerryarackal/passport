import { PrismaClient } from "@prisma/client";
import * as crypto from "crypto";

const prisma = new PrismaClient();

function sha256(content: string): string {
  return crypto.createHash("sha256").update(content).digest("hex");
}

async function main() {
  console.log("Seeding Passport AI database...");

  // Clean existing tables
  await prisma.evidenceItem.deleteMany({});
  await prisma.dispute.deleteMany({});
  await prisma.trustPassport.deleteMany({});
  await prisma.purchase.deleteMany({});
  await prisma.purchaseProposal.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.webhookEvent.deleteMany({});
  await prisma.mandate.deleteMany({});

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const disputeDueDate = new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000);

  // 1. Primary Spend Mandate: Client Appreciation Procurement
  const mandate = await prisma.mandate.create({
    data: {
      id: "mnd-client-gift-80",
      title: "Client Appreciation Procurement",
      purpose: "Authorized procurement of digital reward gift cards for quarterly VIP clients",
      maxAmount: 80.0,
      currency: "USD",
      allowedCategories: JSON.stringify(["digital gift cards"]),
      expiryHours: 24,
      expiresAt: expiresAt,
      refundPolicy: "Full refund within 24 hours if unused",
      status: "ACTIVE",
      rawPrompt: "Authorize my AI agent to buy a digital gift card for a client, up to $80, valid for 24 hours.",
    },
  });

  // Secondary Mandates
  await prisma.mandate.create({
    data: {
      id: "mnd-gpu-cluster-150",
      title: "AI Inference Cluster Provisioning",
      purpose: "Elastic GPU compute node allocation for batch document dispute parsing",
      maxAmount: 150.0,
      currency: "USD",
      allowedCategories: JSON.stringify(["cloud compute", "gpu instances"]),
      expiryHours: 48,
      expiresAt: new Date(now.getTime() + 48 * 3600000),
      refundPolicy: "Pay-as-you-go per minute allocation",
      status: "ACTIVE",
    },
  });

  await prisma.mandate.create({
    data: {
      id: "mnd-saas-tools-50",
      title: "Developer API Subscriptions",
      purpose: "Monthly recurring sandbox test keys and vector index querying",
      maxAmount: 50.0,
      currency: "USD",
      allowedCategories: JSON.stringify(["api subscriptions", "software"]),
      expiryHours: 72,
      expiresAt: new Date(now.getTime() + 72 * 3600000),
      refundPolicy: "Merchant terms apply",
      status: "ACTIVE",
    },
  });

  // 2. Chained Audit Log 1: Mandate Created
  const log1Hash = sha256(`MANDATE_CREATED:${mandate.id}:${now.toISOString()}`);
  await prisma.auditLog.create({
    data: {
      mandateId: mandate.id,
      action: "MANDATE_CREATED",
      actor: "ACCOUNT_OWNER",
      actorModel: "dashboard-session",
      details: JSON.stringify({
        title: mandate.title,
        maxAmount: mandate.maxAmount,
        allowedCategories: ["digital gift cards"],
        expiresAt: expiresAt.toISOString(),
      }),
      eventHash: log1Hash,
      parentHash: "0000000000000000000000000000000000000000000000000000000000000000",
      timestamp: new Date(now.getTime() - 3600000 * 2),
    },
  });

  // 3. Purchase Proposal: $75 Starbucks Digital Gift Card
  const proposal = await prisma.purchaseProposal.create({
    data: {
      id: "prop-starbucks-75",
      mandateId: mandate.id,
      agentModel: "gemini-2.5-pro",
      itemName: "Starbucks Digital e-Gift Card ($75)",
      itemCategory: "digital gift cards",
      amount: 75.0,
      currency: "USD",
      recipient: "client-vip@acme.corp",
      reasoning: "Selected a $75 Starbucks e-Gift Card as client appreciation gift within budget.",
      validationStatus: "APPROVED",
      validationChecks: JSON.stringify({
        amountCheck: { passed: true, requested: 75.0, maxAllowed: 80.0 },
        categoryCheck: { passed: true, requested: "digital gift cards", allowed: ["digital gift cards"] },
        expiryCheck: { passed: true, expiresAt: expiresAt.toISOString() },
      }),
      createdAt: new Date(now.getTime() - 3600000 * 1.5),
    },
  });

  const log2Hash = sha256(`VALIDATION_PASSED:${proposal.id}:${log1Hash}`);
  await prisma.auditLog.create({
    data: {
      mandateId: mandate.id,
      action: "VALIDATION_PASSED",
      actor: "SYSTEM_VALIDATOR",
      actorModel: "passport-guard-engine",
      details: JSON.stringify({
        proposalId: proposal.id,
        item: proposal.itemName,
        amount: proposal.amount,
        status: "APPROVED",
      }),
      eventHash: log2Hash,
      parentHash: log1Hash,
      timestamp: new Date(now.getTime() - 3600000 * 1.4),
    },
  });

  // 4. Completed Purchase: PayPal Orders v2 Captured
  const purchase = await prisma.purchase.create({
    data: {
      id: "purch-sbux-75",
      mandateId: mandate.id,
      proposalId: proposal.id,
      paypalOrderId: "ORD-PP-772910-US",
      paypalCaptureId: "CAP-PP-882190-US",
      status: "COMPLETED",
      amount: 75.0,
      currency: "USD",
      merchantName: "Starbucks Digital Card Network",
      payerEmail: "autonomous-ops@passport.internal",
      paymentMethod: "PayPal Sandbox Wallet",
      mcpSessionId: "mcp-session-7f89b1",
      completedAt: new Date(now.getTime() - 3600000 * 1.2),
    },
  });

  const log3Hash = sha256(`PAYPAL_ORDER_CAPTURED:${purchase.id}:${log2Hash}`);
  await prisma.auditLog.create({
    data: {
      mandateId: mandate.id,
      action: "PAYPAL_ORDER_CAPTURED",
      actor: "PAYPAL_API",
      actorModel: "paypal-orders-v2-capture",
      details: JSON.stringify({
        purchaseId: purchase.id,
        orderId: purchase.paypalOrderId,
        captureId: purchase.paypalCaptureId,
        amount: purchase.amount,
        sellerProtection: "ELIGIBLE",
      }),
      eventHash: log3Hash,
      parentHash: log2Hash,
      timestamp: new Date(now.getTime() - 3600000 * 1.2),
    },
  });

  // 5. Trust Passport: PASS-2026-US
  const passportHash = sha256(`${mandate.id}:${purchase.id}:${purchase.paypalOrderId}:75.0:USD`);
  const passport = await prisma.trustPassport.create({
    data: {
      id: "pass-giftcard-75",
      passportNumber: "PASS-2026-US",
      purchaseId: purchase.id,
      mandateId: mandate.id,
      passportHash: passportHash,
      previousPassportHash: purchase.paypalCaptureId,
      signature: `SIG-${crypto.randomBytes(16).toString("hex")}`,
      status: "VALID",
      authorizationData: JSON.stringify({
        mandateTitle: mandate.title,
        mandatePurpose: mandate.purpose,
        budgetCap: `$${mandate.maxAmount.toFixed(2)} USD`,
        allowedCategories: ["digital gift cards"],
      }),
      transactionData: JSON.stringify({
        orderId: purchase.paypalOrderId,
        captureId: purchase.paypalCaptureId,
        amount: `$${purchase.amount.toFixed(2)} USD`,
        merchant: purchase.merchantName,
        paymentStatus: "COMPLETED",
        sellerProtection: "ELIGIBLE",
      }),
      agentTrailData: JSON.stringify({
        agentModel: "gemini-2.5-pro",
        reasoning: proposal.reasoning,
        boundaryChecks: "3 of 3 Passed",
      }),
      refundEligibility: JSON.stringify({
        eligible: true,
        policyTerms: mandate.refundPolicy,
      }),
      disputeReadinessScore: 98,
      evidencePack: JSON.stringify([
        { type: "MANDATE_AUTHORIZATION", status: "VERIFIED" },
        { type: "PAYPAL_CAPTURE_RECEIPT", status: "VERIFIED" },
        { type: "AGENT_REASONING_LOG", status: "VERIFIED" },
        { type: "DELIVERY_CONFIRMATION", status: "VERIFIED" },
        { type: "TERMS_AND_REFUND_POLICY", status: "VERIFIED" },
      ]),
      qrCodePayload: `https://passport.internal/verify/PASS-2026-US`,
      issuedAt: new Date(now.getTime() - 3600000),
    },
  });

  // 6. Dispute Incident & Evidence Pack
  const dispute = await prisma.dispute.create({
    data: {
      id: "disp-chargeback-demo",
      paypalDisputeId: "PP-D-849201",
      purchaseId: purchase.id,
      passportId: passport.id,
      status: "ACTION_REQUIRED",
      disputeReason: "UNAUTHORIZED_TRANSACTION",
      disputeAmount: 75.0,
      currency: "USD",
      disputeLifeCycleStage: "CHARGEBACK",
      dueDate: disputeDueDate,
      buyerNotes: "Cardholder reported unrecognized digital charge; claims card was charged without consent.",
      classification: JSON.stringify({
        category: "UNAUTHORIZED_TRANSACTION",
        confidence: 0.98,
        recommendedStrategy: "COMPELLING_EVIDENCE_DIGITAL_DELIVERY",
        riskAssessment: "LOW_RISK_MERCHANT_FAVOR",
        summary: "Cardholder claims unauthorized charge, but purchase was pre-authorized by spend mandate.",
      }),
      createdAt: new Date(now.getTime() - 1800000),
    },
  });

  const evidenceRecords = [
    {
      type: "MANDATE_AUTHORIZATION",
      title: "Human Spend Mandate & Purpose Authorization",
      description: `Cryptographic mandate "${mandate.title}" authorizing spend up to $80.00.`,
      status: "VERIFIED",
      source: "SYSTEM",
      hash: sha256(`MANDATE:${mandate.id}`),
    },
    {
      type: "PAYPAL_CAPTURE_RECEIPT",
      title: "PayPal Capture & Settlement Receipt",
      description: `Order ${purchase.paypalOrderId} captured with Seller Protection ELIGIBLE.`,
      status: "VERIFIED",
      source: "PAYPAL_API",
      hash: sha256(`PAYPAL_CAPTURE:${purchase.paypalCaptureId}`),
    },
    {
      type: "AGENT_REASONING_LOG",
      title: "AI Agent Reasoning & Boundary Enforcement Transcript",
      description: "Gemini inference transcript showing bounded proposal within mandate constraints.",
      status: "VERIFIED",
      source: "GEMINI_AGENT",
      hash: sha256(`AGENT_TRACE:${proposal.id}`),
    },
    {
      type: "DELIVERY_CONFIRMATION",
      title: "Digital Fulfillment & Dispatch Record",
      description: `Electronic gift card dispatched directly to ${proposal.recipient}.`,
      status: "VERIFIED",
      source: "SYSTEM",
      hash: sha256(`DELIVERY:${proposal.recipient}`),
    },
    {
      type: "TERMS_AND_REFUND_POLICY",
      title: "Mandate Terms & Non-Repudiation Policy",
      description: "Established merchant terms and conditions regarding digital fulfillment.",
      status: "VERIFIED",
      source: "SYSTEM",
      hash: sha256("TERMS_NON_REPUDIATION"),
    },
  ];

  for (const item of evidenceRecords) {
    await prisma.evidenceItem.create({
      data: {
        disputeId: dispute.id,
        type: item.type,
        title: item.title,
        description: item.description,
        status: item.status,
        source: item.source,
        hash: item.hash,
      },
    });
  }

  // 7. Webhook Event
  await prisma.webhookEvent.create({
    data: {
      paypalEventId: "WH-SIM-982104",
      eventType: "CUSTOMER.DISPUTE.CREATED",
      summary: `PayPal Dispute Webhook: CUSTOMER.DISPUTE.CREATED on Order ${purchase.paypalOrderId}`,
      payload: JSON.stringify({
        id: "WH-SIM-982104",
        event_type: "CUSTOMER.DISPUTE.CREATED",
        resource: {
          dispute_id: dispute.paypalDisputeId,
          seller_transaction_id: purchase.paypalCaptureId,
          dispute_amount: { currency_code: "USD", value: "75.00" },
          reason: "UNAUTHORIZED_TRANSACTION",
        },
      }),
      signatureValid: true,
      simulated: true,
      processed: true,
    },
  });

  console.log("Database seeded successfully with Mandates, Purchases, Passports, and Disputes.");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

