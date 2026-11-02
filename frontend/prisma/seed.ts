import { PrismaClient } from "@prisma/client";
import * as crypto from "crypto";

const prisma = new PrismaClient();

function sha256(content: string): string {
  return crypto.createHash("sha256").update(content).digest("hex");
}

async function main() {
  console.log("🌱 Cleaning existing data...");
  await prisma.evidenceItem.deleteMany({});
  await prisma.dispute.deleteMany({});
  await prisma.trustPassport.deleteMany({});
  await prisma.purchase.deleteMany({});
  await prisma.purchaseProposal.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.webhookEvent.deleteMany({});
  await prisma.mandate.deleteMany({});

  console.log("✨ Seeding hackathon scenario...");

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const disputeDueDate = new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000);

  // 1. Create Hackathon Mandate
  const mandate = await prisma.mandate.create({
    data: {
      id: "mandate-gift-card-demo",
      title: "Client Appreciation Gift",
      purpose: "Client appreciation gift",
      maxAmount: 80.0,
      currency: "USD",
      allowedCategories: JSON.stringify(["digital gift cards"]),
      expiryHours: 24,
      expiresAt: expiresAt,
      refundPolicy: "Refund allowed if purchase is incorrect or unauthorized",
      status: "ACTIVE",
      rawPrompt: "Authorize my AI agent to buy a digital gift card for a client, up to $80, valid for 24 hours.",
    },
  });

  const log1Hash = sha256(`MANDATE_CREATED:${mandate.id}:${now.toISOString()}`);
  await prisma.auditLog.create({
    data: {
      mandateId: mandate.id,
      action: "MANDATE_CREATED",
      actor: "HUMAN_ADMIN",
      actorModel: "user-session",
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

  // 2. Demo BLOCKED Attempt ($120 Physical Product)
  const blockedProposal = await prisma.purchaseProposal.create({
    data: {
      id: "prop-blocked-chair",
      mandateId: mandate.id,
      agentModel: "gemini-1.5-pro",
      itemName: "Ergonomic Office Headset & Stand",
      itemCategory: "physical equipment",
      amount: 120.0,
      currency: "USD",
      recipient: "VIP Client Office (HQ-Room 402)",
      reasoning: "Selected premium physical headset for upcoming video conferences to demonstrate gratitude.",
      validationStatus: "BLOCKED",
      violationReason:
        "Proposal violates Mandate constraints: Amount ($120.00) exceeds $80.00 maximum budget constraint, and category 'physical equipment' is not within authorized categories ['digital gift cards'].",
      validationChecks: JSON.stringify({
        amountCheck: { passed: false, requested: 120.0, maxAllowed: 80.0 },
        categoryCheck: { passed: false, requested: "physical equipment", allowed: ["digital gift cards"] },
        expiryCheck: { passed: true, expiresAt: expiresAt.toISOString() },
      }),
      createdAt: new Date(now.getTime() - 3600000 * 1.8),
    },
  });

  const logBlockedHash = sha256(`VALIDATION_BLOCKED:${blockedProposal.id}`);
  await prisma.auditLog.create({
    data: {
      mandateId: mandate.id,
      action: "VALIDATION_BLOCKED",
      actor: "SYSTEM_VALIDATOR",
      actorModel: "passport-guard-v1",
      details: JSON.stringify({
        proposalId: blockedProposal.id,
        item: blockedProposal.itemName,
        amount: blockedProposal.amount,
        rejectionReason: blockedProposal.violationReason,
      }),
      eventHash: logBlockedHash,
      parentHash: log1Hash,
      timestamp: new Date(now.getTime() - 3600000 * 1.8),
    },
  });

  // 3. Demo APPROVED Proposal ($75 Digital Gift Card)
  const approvedProposal = await prisma.purchaseProposal.create({
    data: {
      id: "prop-approved-gift-card",
      mandateId: mandate.id,
      agentModel: "gemini-1.5-pro",
      itemName: "Starbucks Digital e-Gift Card ($75)",
      itemCategory: "digital gift cards",
      amount: 75.0,
      currency: "USD",
      recipient: "vip-client@partnercorp.io",
      reasoning:
        "Proposing a $75 Starbucks Digital e-Gift Card. This directly fulfills the 'Client appreciation gift' purpose, stays below the $80 max limit ($5 buffer), and strictly adheres to 'digital gift cards' category.",
      validationStatus: "APPROVED",
      validationChecks: JSON.stringify({
        amountCheck: { passed: true, requested: 75.0, maxAllowed: 80.0 },
        categoryCheck: { passed: true, requested: "digital gift cards", allowed: ["digital gift cards"] },
        expiryCheck: { passed: true, expiresAt: expiresAt.toISOString() },
      }),
      createdAt: new Date(now.getTime() - 3600000 * 1.5),
    },
  });

  const logApprovedHash = sha256(`VALIDATION_PASSED:${approvedProposal.id}`);
  await prisma.auditLog.create({
    data: {
      mandateId: mandate.id,
      action: "VALIDATION_PASSED",
      actor: "SYSTEM_VALIDATOR",
      actorModel: "passport-guard-v1",
      details: JSON.stringify({
        proposalId: approvedProposal.id,
        amount: 75.0,
        category: "digital gift cards",
        status: "APPROVED_FOR_PAYPAL_EXECUTION",
      }),
      eventHash: logApprovedHash,
      parentHash: logBlockedHash,
      timestamp: new Date(now.getTime() - 3600000 * 1.5),
    },
  });

  // 4. Completed PayPal Sandbox Purchase
  const purchase = await prisma.purchase.create({
    data: {
      id: "purch-starbucks-75",
      mandateId: mandate.id,
      proposalId: approvedProposal.id,
      paypalOrderId: "PAYPAL-ORD-8X92104M-SB",
      paypalCaptureId: "CAPTURE-7TY90123L-SB",
      status: "DISPUTED",
      amount: 75.0,
      currency: "USD",
      merchantName: "Starbucks Rewards Digital Network",
      payerEmail: "agent-treasury@passport-ai.internal",
      paymentMethod: "PayPal Sandbox Wallet (Instant Settlement)",
      mcpSessionId: "mcp-session-paypal-78a3f",
      rawPaypalResponse: JSON.stringify({
        id: "PAYPAL-ORD-8X92104M-SB",
        status: "COMPLETED",
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: "default",
            amount: { currency_code: "USD", value: "75.00" },
            payee: { email_address: "merchant-sandbox@starbucks-partner.com" },
            payments: {
              captures: [
                {
                  id: "CAPTURE-7TY90123L-SB",
                  status: "COMPLETED",
                  amount: { currency_code: "USD", value: "75.00" },
                  seller_protection: { status: "ELIGIBLE" },
                },
              ],
            },
          },
        ],
      }),
      createdAt: new Date(now.getTime() - 3600000 * 1.4),
      completedAt: new Date(now.getTime() - 3600000 * 1.35),
    },
  });

  const logPaypalHash = sha256(`PAYPAL_ORDER_CAPTURED:${purchase.paypalOrderId}`);
  await prisma.auditLog.create({
    data: {
      mandateId: mandate.id,
      action: "PAYPAL_ORDER_CAPTURED",
      actor: "PAYPAL_API",
      actorModel: "paypal-sandbox-orders-v2",
      details: JSON.stringify({
        orderId: purchase.paypalOrderId,
        captureId: purchase.paypalCaptureId,
        amount: purchase.amount,
        currency: purchase.currency,
        mcpSessionId: purchase.mcpSessionId,
      }),
      eventHash: logPaypalHash,
      parentHash: logApprovedHash,
      timestamp: new Date(now.getTime() - 3600000 * 1.35),
    },
  });

  // 5. Generate Trust Passport
  const passportHash = sha256(
    JSON.stringify({
      mandateId: mandate.id,
      purchaseId: purchase.id,
      orderId: purchase.paypalOrderId,
      amount: purchase.amount,
      agentProposal: approvedProposal.id,
      timestamp: purchase.createdAt.toISOString(),
    })
  );

  const passport = await prisma.trustPassport.create({
    data: {
      id: "pass-giftcard-75",
      passportNumber: "PASS-2026-8942-US",
      purchaseId: purchase.id,
      mandateId: mandate.id,
      passportHash: passportHash,
      previousPassportHash: logPaypalHash,
      signature: `SIG-ECDSA-SECP256K1:${sha256(passportHash + ":SECRET_KEY").slice(0, 64)}`,
      status: "DISPUTED",
      authorizationData: JSON.stringify({
        mandateTitle: mandate.title,
        mandatePurpose: mandate.purpose,
        budgetLimit: "$80.00 USD",
        authorizedCategories: ["digital gift cards"],
        authorizedAt: mandate.createdAt.toISOString(),
        expiresAt: mandate.expiresAt.toISOString(),
        authorizer: "Small Business Owner (Human Co-Signer)",
      }),
      transactionData: JSON.stringify({
        paypalOrderId: purchase.paypalOrderId,
        captureId: purchase.paypalCaptureId,
        amount: "$75.00 USD",
        merchant: purchase.merchantName,
        paymentGateway: "PayPal Sandbox API v2",
        settlementTime: purchase.completedAt?.toISOString(),
        sellerProtectionStatus: "ELIGIBLE",
      }),
      agentTrailData: JSON.stringify({
        agentModel: approvedProposal.agentModel,
        prompt: mandate.rawPrompt,
        chainOfThought: approvedProposal.reasoning,
        validationScore: "100% PASSED",
        mcpSessionId: purchase.mcpSessionId,
      }),
      refundEligibility: JSON.stringify({
        allowed: true,
        policy: mandate.refundPolicy,
        requiresHumanApproval: true,
        eligibilityWindowHours: 72,
      }),
      disputeReadinessScore: 98,
      evidencePack: JSON.stringify([
        "MANDATE_AUTHORIZATION_RECORD",
        "PAYPAL_CAPTURE_RECEIPT_V2",
        "AGENT_REASONING_AND_PROMPT_CHAIN",
        "DIGITAL_CARD_DELIVERY_CONFIRMATION",
        "CRYPTOGRAPHIC_AUDIT_HASH_CHAIN",
      ]),
      qrCodePayload: `https://passport.ai/verify/PASS-2026-8942-US?hash=${passportHash}`,
      issuedAt: new Date(now.getTime() - 3600000 * 1.3),
    },
  });

  const logPassportHash = sha256(`PASSPORT_ISSUED:${passport.passportNumber}`);
  await prisma.auditLog.create({
    data: {
      mandateId: mandate.id,
      action: "PASSPORT_ISSUED",
      actor: "SYSTEM_VALIDATOR",
      actorModel: "passport-core-engine",
      details: JSON.stringify({
        passportNumber: passport.passportNumber,
        hash: passport.passportHash,
        disputeReadinessScore: passport.disputeReadinessScore,
      }),
      eventHash: logPassportHash,
      parentHash: logPaypalHash,
      timestamp: new Date(now.getTime() - 3600000 * 1.3),
    },
  });

  // 6. Arrived Dispute (Chargeback Autopsy Vertical)
  const disputeClassification = {
    category: "UNAUTHORIZED_TRANSACTION",
    confidence: 0.96,
    recommendedStrategy: "COMPELLING_EVIDENCE_DIGITAL_DELIVERY",
    riskAssessment: "LOW_RISK_MERCHANT_FAVOR",
    summary:
      "Cardholder claims unauthorized transaction. However, the purchase was strictly authorized by an explicit business spend mandate, paid through an authenticated corporate PayPal sandbox wallet, and the digital gift card was delivered directly to the designated client recipient email.",
  };

  const evidenceChecklist = [
    {
      id: "ev-1",
      key: "MANDATE_AUTHORIZATION",
      title: "Owner Spend Mandate & Purpose Authorization",
      status: "VERIFIED",
      description: "Signed human mandate authorizing digital gift card spend up to $80.",
      confidence: 100,
    },
    {
      id: "ev-2",
      key: "PAYPAL_CAPTURE_RECEIPT",
      title: "PayPal Capture & Seller Protection Receipt",
      status: "VERIFIED",
      description: "PayPal Sandbox Order PAYPAL-ORD-8X92104M-SB capture record showing completed settlement.",
      confidence: 100,
    },
    {
      id: "ev-3",
      key: "AGENT_REASONING_LOG",
      title: "AI Agent Reasoning & Boundary Verification Log",
      status: "VERIFIED",
      description: "Gemini 1.5 Pro inference transcript confirming strictly bounded selection matching client purpose.",
      confidence: 98,
    },
    {
      id: "ev-4",
      key: "DELIVERY_CONFIRMATION",
      title: "Digital Gift Card Electronic Delivery Proof",
      status: "VERIFIED",
      description: "Merchant delivery log confirming redemption link delivered to vip-client@partnercorp.io.",
      confidence: 95,
    },
    {
      id: "ev-5",
      key: "TERMS_AND_REFUND_POLICY",
      title: "Mandate Terms of Service & Dispute Clause",
      status: "VERIFIED",
      description: "Clear refund clause stipulating conditions for return.",
      confidence: 100,
    },
  ];

  const evidenceGaps = [
    {
      id: "gap-1",
      item: "Recipient Direct Acknowledgment Receipt",
      status: "OPTIONAL_RECOMMENDED",
      actionNeeded: "Optional email acknowledgment from client receipt to reinforce case beyond electronic delivery log.",
      mitigation: "Existing SMTP delivery headers and PayPal seller protection eligibility are sufficient for merchant favor ruling.",
    },
  ];

  const draftResponse = `Dear PayPal Disputes Team,

This response is submitted on behalf of the merchant regarding Dispute ID PP-D-849201 for Order ID PAYPAL-ORD-8X92104M-SB ($75.00 USD).

We respectfully contest the cardholder's claim of an unauthorized transaction based on the attached verifiable cryptographic evidence bundle (Trust Passport PASS-2026-8942-US):

1. Prior Explicit Authorization:
The transaction was executed pursuant to a cryptographic business spend mandate established by the verified account owner ("Client Appreciation Gift", Mandate ID mandate-gift-card-demo) explicitly authorizing up to $80.00 for digital gift cards.

2. Strict AI Bounded Execution:
The automated purchasing agent operated strictly within mandate boundaries. An earlier unauthorized proposal ($120.00 physical equipment) was systematically rejected by the Passport compliance engine, proving robust boundary controls. The approved $75.00 transaction was logged, hashed, and committed to an immutable audit chain.

3. Verified Delivery of Digital Goods:
The $75.00 Starbucks Digital e-Gift Card was electronically generated and dispatched to the designated recipient email (vip-client@partnercorp.io) on ${purchase.completedAt?.toISOString()}. The PayPal transaction was flagged as Seller Protection ELIGIBLE.

4. Non-Repudiation & Audit Trail:
The complete decision trail, model prompt, validation checks, and transaction hashes are available via cryptographic hash: ${passportHash}.

Under PayPal Seller Protection guidelines for intangible/digital goods and valid pre-authorization, we request that this dispute be resolved in the merchant's favor and the $75.00 credit hold released.

Respectfully submitted,
Compliance & Treasury Operations (Co-signed)`;

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
      buyerNotes:
        "Cardholder claims they do not recognize this digital transaction for $75.00 and suspect their payment method was compromised.",
      classification: JSON.stringify(disputeClassification),
      evidenceChecklist: JSON.stringify(evidenceChecklist),
      evidenceGaps: JSON.stringify(evidenceGaps),
      draftResponse: draftResponse,
      createdAt: new Date(now.getTime() - 1800000),
    },
  });

  // Create Evidence Items in DB
  for (const ev of evidenceChecklist) {
    await prisma.evidenceItem.create({
      data: {
        disputeId: dispute.id,
        type: ev.key,
        title: ev.title,
        description: ev.description,
        status: "VERIFIED",
        source: ev.key.includes("PAYPAL") ? "PAYPAL_API" : ev.key.includes("AGENT") ? "GEMINI_AGENT" : "SYSTEM",
        hash: sha256(ev.title + ev.description),
        metadata: JSON.stringify(ev),
      },
    });
  }

  // Webhook event received
  await prisma.webhookEvent.create({
    data: {
      paypalEventId: "WH-EV-98214-CHARGEBACK",
      eventType: "CUSTOMER.DISPUTE.CREATED",
      summary: "A new dispute was filed by buyer on transaction PAYPAL-ORD-8X92104M-SB",
      payload: JSON.stringify({
        id: "WH-EV-98214-CHARGEBACK",
        event_type: "CUSTOMER.DISPUTE.CREATED",
        resource: {
          dispute_id: "PP-D-849201",
          disputed_transactions: [{ seller_transaction_id: "CAPTURE-7TY90123L-SB", buyer_transaction_id: "BT-9901" }],
          dispute_amount: { currency_code: "USD", value: "75.00" },
          reason: "UNAUTHORIZED_TRANSACTION",
          status: "UNDER_REVIEW",
        },
      }),
      signatureValid: true,
      simulated: true,
      processed: true,
    },
  });

  const logDisputeHash = sha256(`DISPUTE_RECEIVED:${dispute.paypalDisputeId}`);
  await prisma.auditLog.create({
    data: {
      mandateId: mandate.id,
      action: "DISPUTE_RECEIVED",
      actor: "PAYPAL_WEBHOOK",
      actorModel: "paypal-webhook-listener",
      details: JSON.stringify({
        disputeId: dispute.paypalDisputeId,
        reason: dispute.disputeReason,
        amount: dispute.disputeAmount,
        dueDate: dispute.dueDate.toISOString(),
      }),
      eventHash: logDisputeHash,
      parentHash: logPassportHash,
      timestamp: new Date(now.getTime() - 1800000),
    },
  });

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

