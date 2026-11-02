/**
 * Milestone 1 Proof of Concept Test Script
 * Tests the entire vertical slice:
 * 1. Create a mandate.
 * 2. Validate an agent purchase proposal against it.
 * 3. Create a PayPal sandbox order.
 * 4. Capture the order after approval.
 * 5. Store the transaction.
 * 6. Generate a basic Trust Passport.
 * 7. Receive or simulate a dispute event.
 * 8. Retrieve dispute details.
 * 9. Generate an evidence checklist and response draft.
 */

import { PrismaClient } from "@prisma/client";
import { validateProposalAgainstMandate } from "../../frontend/src/server/mandates/validator";
import { createPayPalOrder, capturePayPalOrder } from "../../frontend/src/server/paypal/orders";
import { generatePassportHash, signPassport, verifyPassportSignature } from "../../frontend/src/server/verification/hasher";
import { runDisputeAutopsy } from "../../frontend/src/server/agents/dispute-agent";
import { logAuditEvent } from "../../frontend/src/server/audit/logger";

const prisma = new PrismaClient();

async function runMilestone1ProofOfConcept() {
  console.log("=================================================");
  console.log("🚀 STARTING MILESTONE 1 PROOF OF CONCEPT TEST");
  console.log("=================================================\n");

  // Step 1: Create Mandate
  console.log("👉 Step 1: Creating human spend mandate...");
  const mandate = await prisma.mandate.create({
    data: {
      title: "Client Appreciation Gift (POC Test)",
      purpose: "Client appreciation gift",
      maxAmount: 80.0,
      currency: "USD",
      allowedCategories: JSON.stringify(["digital gift cards"]),
      expiryHours: 24,
      expiresAt: new Date(Date.now() + 24 * 3600000),
      refundPolicy: "Refund allowed if purchase is incorrect or unauthorized",
      status: "ACTIVE",
    },
  });
  console.log(`✅ Mandate Created: ID=${mandate.id}, Limit=$${mandate.maxAmount}, Purpose="${mandate.purpose}"`);

  // Step 2: Validate Agent Proposal
  console.log("\n👉 Step 2a: Testing Blocked Proposal ($120 Physical Product)...");
  const blockedValidation = validateProposalAgainstMandate({
    mandate: {
      id: mandate.id,
      title: mandate.title,
      maxAmount: mandate.maxAmount,
      currency: mandate.currency,
      allowedCategories: mandate.allowedCategories,
      expiresAt: mandate.expiresAt,
      status: mandate.status,
    },
    proposal: {
      itemName: "Ergonomic Office Chair",
      itemCategory: "physical equipment",
      amount: 120.0,
      currency: "USD",
      recipient: "VIP Office",
    },
  });
  console.log(`🛡️ Blocked Test Result: Status=${blockedValidation.status}`);
  console.log(`   Violation Reason: ${blockedValidation.violationReason}`);
  if (blockedValidation.isApproved) throw new Error("Expected $120 physical proposal to be blocked!");

  console.log("\n👉 Step 2b: Testing Approved Proposal ($75 Digital Gift Card)...");
  const approvedValidation = validateProposalAgainstMandate({
    mandate: {
      id: mandate.id,
      title: mandate.title,
      maxAmount: mandate.maxAmount,
      currency: mandate.currency,
      allowedCategories: mandate.allowedCategories,
      expiresAt: mandate.expiresAt,
      status: mandate.status,
    },
    proposal: {
      itemName: "Starbucks Digital e-Gift Card",
      itemCategory: "digital gift cards",
      amount: 75.0,
      currency: "USD",
      recipient: "client@acme.com",
    },
  });
  console.log(`✨ Approved Test Result: Status=${approvedValidation.status}`);
  if (!approvedValidation.isApproved) throw new Error("Expected $75 digital gift card to be approved!");

  const proposalRecord = await prisma.purchaseProposal.create({
    data: {
      mandateId: mandate.id,
      agentModel: "gemini-1.5-pro",
      itemName: "Starbucks Digital e-Gift Card",
      itemCategory: "digital gift cards",
      amount: 75.0,
      currency: "USD",
      recipient: "client@acme.com",
      reasoning: "Selected $75 digital gift card for client appreciation, strictly adhering to $80 mandate limit.",
      validationStatus: approvedValidation.status,
      validationChecks: JSON.stringify(approvedValidation.checks),
    },
  });

  // Step 3: Create PayPal sandbox order
  console.log("\n👉 Step 3: Creating PayPal sandbox order...");
  const order = await createPayPalOrder({
    mandateId: mandate.id,
    amount: proposalRecord.amount,
    currency: proposalRecord.currency,
    itemName: proposalRecord.itemName,
    category: proposalRecord.itemCategory,
    recipient: proposalRecord.recipient,
  });
  console.log(`💳 PayPal Order Created: ID=${order.id}, Status=${order.status}`);

  // Step 4: Capture PayPal order
  console.log("\n👉 Step 4: Capturing PayPal order...");
  const capture = await capturePayPalOrder(order.id);
  console.log(`💰 PayPal Capture Success: CaptureID=${capture.captureId}, Status=${capture.status}, SellerProtection=${capture.sellerProtectionStatus}`);

  // Step 5: Store transaction in DB
  console.log("\n👉 Step 5: Storing purchase transaction...");
  const purchase = await prisma.purchase.create({
    data: {
      mandateId: mandate.id,
      proposalId: proposalRecord.id,
      paypalOrderId: order.id,
      paypalCaptureId: capture.captureId,
      status: "COMPLETED",
      amount: capture.amount,
      currency: capture.currency,
      merchantName: "Starbucks Digital Rewards Network",
      payerEmail: "agent-treasury@passport-ai.internal",
      paymentMethod: "PayPal Sandbox Wallet",
      rawPaypalResponse: JSON.stringify(capture.raw),
      completedAt: new Date(),
    },
  });
  console.log(`📦 Purchase Saved: ID=${purchase.id}, OrderID=${purchase.paypalOrderId}`);

  // Step 6: Generate Trust Passport
  console.log("\n👉 Step 6: Generating Trust Passport...");
  const passportNumber = `PASS-${new Date().getFullYear()}-POC-01`;
  const passportHash = generatePassportHash({
    mandateId: mandate.id,
    purchaseId: purchase.id,
    paypalOrderId: purchase.paypalOrderId,
    amount: purchase.amount,
    currency: purchase.currency,
    recipient: proposalRecord.recipient,
    agentModel: proposalRecord.agentModel,
    timestamp: purchase.completedAt?.toISOString() || new Date().toISOString(),
  });
  const signature = signPassport(passportHash);
  const isValidSignature = verifyPassportSignature(passportHash, signature);

  const passport = await prisma.trustPassport.create({
    data: {
      passportNumber,
      purchaseId: purchase.id,
      mandateId: mandate.id,
      passportHash,
      previousPassportHash: capture.captureId,
      signature,
      status: "VALID",
      authorizationData: JSON.stringify({
        mandateTitle: mandate.title,
        mandatePurpose: mandate.purpose,
        budgetLimit: `$${mandate.maxAmount.toFixed(2)} USD`,
      }),
      transactionData: JSON.stringify({
        paypalOrderId: purchase.paypalOrderId,
        captureId: purchase.paypalCaptureId,
        amount: `$${purchase.amount.toFixed(2)} USD`,
      }),
      agentTrailData: JSON.stringify({
        agentModel: proposalRecord.agentModel,
        reasoning: proposalRecord.reasoning,
      }),
      refundEligibility: JSON.stringify({
        allowed: true,
        policy: mandate.refundPolicy,
      }),
      disputeReadinessScore: 98,
      evidencePack: JSON.stringify(["MANDATE_AUTHORIZATION", "PAYPAL_CAPTURE_RECEIPT", "AGENT_REASONING_LOG"]),
      qrCodePayload: `https://passport.ai/verify/${passportNumber}?hash=${passportHash}`,
    },
  });
  console.log(`🛡️ Trust Passport Issued: Number=${passport.passportNumber}`);
  console.log(`   SHA-256 Fingerprint: ${passport.passportHash}`);
  console.log(`   Cryptographic Signature Verified: ${isValidSignature}`);

  // Step 7: Receive / Simulate Dispute Event
  console.log("\n👉 Step 7: Simulating Dispute Event...");
  const dispute = await prisma.dispute.create({
    data: {
      paypalDisputeId: `PP-D-POC-${Date.now().toString().slice(-6)}`,
      purchaseId: purchase.id,
      passportId: passport.id,
      status: "ACTION_REQUIRED",
      disputeReason: "UNAUTHORIZED_TRANSACTION",
      disputeAmount: purchase.amount,
      currency: purchase.currency,
      dueDate: new Date(Date.now() + 7 * 86400000),
      buyerNotes: "Cardholder claims unrecognized charge of $75.",
    },
  });
  console.log(`⚠️ Dispute Created: DisputeID=${dispute.paypalDisputeId}, Reason=${dispute.disputeReason}`);

  // Step 8 & 9: Retrieve details and run Chargeback Autopsy (evidence checklist & draft response)
  console.log("\n👉 Step 8 & 9: Running Chargeback Autopsy & Generating Defense...");
  const autopsy = await runDisputeAutopsy(dispute.id);
  console.log(`🔍 Classification: ${autopsy.analysis.classification.category} (Confidence: ${(autopsy.analysis.classification.confidence * 100).toFixed(0)}%)`);
  console.log(`📋 Evidence Checklist (${autopsy.analysis.evidenceChecklist.length} items assembled):`);
  autopsy.analysis.evidenceChecklist.forEach((item, idx) => {
    console.log(`   ${idx + 1}. [${item.status}] ${item.title}`);
  });
  console.log(`⚠️ Evidence Gaps (${autopsy.analysis.evidenceGaps.length} items):`);
  autopsy.analysis.evidenceGaps.forEach((gap, idx) => {
    console.log(`   ${idx + 1}. ${gap.item}: ${gap.mitigation}`);
  });
  console.log(`\n📝 Draft Response Preview:\n${autopsy.analysis.draftResponse.slice(0, 300)}...\n`);

  console.log("=================================================");
  console.log("🎉 MILESTONE 1 PROOF OF CONCEPT SUCCEEDED 100%!");
  console.log("=================================================");
}

runMilestone1ProofOfConcept()
  .catch((err) => {
    console.error("❌ Milestone 1 POC failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

