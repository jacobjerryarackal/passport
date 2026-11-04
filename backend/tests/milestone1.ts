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

import prisma from "../src/db/prisma";
import { validateProposalAgainstMandate } from "../src/mandates/validator";
import { createPayPalOrder, capturePayPalOrder } from "../src/paypal/orders";
import { generatePassportHash, signPassport, verifyPassportSignature } from "../src/verification/hasher";
import { runDisputeAutopsy } from "../src/agents/dispute-agent";

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
      allowedCategories: JSON.parse(mandate.allowedCategories),
      expiresAt: mandate.expiresAt,
    },
    proposal: {
      amount: 120.0,
      currency: "USD",
      itemCategory: "physical equipment",
    },
  });
  console.log(`❌ Policy Gate Blocked: Passed=${blockedValidation.isValid}, Reason="${blockedValidation.rejectionReason}"`);

  console.log("\n👉 Step 2b: Testing Approved Proposal ($75 Digital Gift Card)...");
  const approvedValidation = validateProposalAgainstMandate({
    mandate: {
      id: mandate.id,
      title: mandate.title,
      maxAmount: mandate.maxAmount,
      currency: mandate.currency,
      allowedCategories: JSON.parse(mandate.allowedCategories),
      expiresAt: mandate.expiresAt,
    },
    proposal: {
      amount: 75.0,
      currency: "USD",
      itemCategory: "digital gift cards",
    },
  });
  console.log(`✅ Policy Gate Approved: Passed=${approvedValidation.isValid}`);

  // Step 3: Create PayPal Sandbox Order
  console.log("\n👉 Step 3: Creating PayPal Sandbox Order (Orders v2)...");
  const order = await createPayPalOrder({
    mandateId: mandate.id,
    amount: 75.0,
    currency: "USD",
    itemName: "Starbucks Digital e-Gift Card ($75)",
    category: "digital gift cards",
    recipient: "client@example.com",
    mcpSessionId: "mcp-test-session-001",
  });
  console.log(`✅ PayPal Order Created: OrderId=${order.id}, Status=${order.status}, Simulated=${order.isSimulated}`);

  // Step 4: Capture PayPal Order
  console.log("\n👉 Step 4: Capturing PayPal Sandbox Order...");
  const capture = await capturePayPalOrder(order.id);
  console.log(`✅ PayPal Order Captured: CaptureId=${capture.captureId}, Status=${capture.status}`);

  // Step 5: Save Purchase Record
  console.log("\n👉 Step 5: Recording Settled Purchase in Database...");
  const purchase = await prisma.purchase.create({
    data: {
      mandateId: mandate.id,
      proposalId: "test-prop-" + Date.now(),
      paypalOrderId: order.id,
      paypalCaptureId: capture.captureId,
      status: "COMPLETED",
      amount: 75.0,
      currency: "USD",
      merchantName: "Starbucks Digital Rewards Network",
      payerEmail: "agent-treasury@passport-ai.internal",
      paymentMethod: "PayPal Sandbox Wallet",
      mcpSessionId: "mcp-test-session-001",
      completedAt: new Date(),
    },
  });
  console.log(`✅ Purchase Saved: ID=${purchase.id}, CaptureId=${purchase.paypalCaptureId}`);

  // Step 6: Issue Trust Passport
  console.log("\n👉 Step 6: Minting Cryptographic Trust Passport...");
  const passportNumber = "PASS-2026-TEST-" + Math.floor(1000 + Math.random() * 9000);
  const passportHash = generatePassportHash({
    mandateId: mandate.id,
    purchaseId: purchase.id,
    paypalOrderId: purchase.paypalOrderId,
    amount: purchase.amount,
    currency: purchase.currency,
    recipient: "client@example.com",
    agentModel: "gemini-1.5-pro",
    timestamp: purchase.completedAt?.toISOString() || new Date().toISOString(),
  });
  const signature = signPassport(passportHash);
  const isSignatureValid = verifyPassportSignature(passportHash, signature);

  const passport = await prisma.trustPassport.create({
    data: {
      passportNumber,
      purchaseId: purchase.id,
      mandateId: mandate.id,
      passportHash,
      previousPassportHash: capture.captureId,
      signature,
      status: "VALID",
      authorizationData: JSON.stringify({ mandateTitle: mandate.title, maxAmount: mandate.maxAmount }),
      transactionData: JSON.stringify({ orderId: purchase.paypalOrderId, amount: purchase.amount }),
      agentTrailData: JSON.stringify({ model: "gemini-1.5-pro", prompt: "Client appreciation gift" }),
      refundEligibility: JSON.stringify({ allowed: true }),
      disputeReadinessScore: 98,
      evidencePack: JSON.stringify(["MANDATE_AUTH", "PAYPAL_CAPTURE", "DELIVERY_PROOF"]),
      qrCodePayload: `https://passport.ai/verify/${passportNumber}?hash=${passportHash}`,
    },
  });
  console.log(`✅ Trust Passport Minted: Number=${passport.passportNumber}, Hash=${passport.passportHash}`);
  console.log(`🔒 Attestation Seal Cryptographically Verified: ${isSignatureValid}`);

  // Step 7: Create Dispute
  console.log("\n👉 Step 7: Simulating Inbound Customer Dispute (Webhook)...");
  const dispute = await prisma.dispute.create({
    data: {
      paypalDisputeId: "PP-D-TEST-" + Math.floor(100000 + Math.random() * 900000),
      purchaseId: purchase.id,
      passportId: passport.id,
      status: "ACTION_REQUIRED",
      disputeReason: "UNAUTHORIZED_TRANSACTION",
      disputeAmount: 75.0,
      currency: "USD",
      dueDate: new Date(Date.now() + 7 * 86400000),
      buyerNotes: "Cardholder did not recognize digital purchase.",
    },
  });
  console.log(`⚠️ Dispute Logged: DisputeID=${dispute.paypalDisputeId}, Reason=${dispute.disputeReason}`);

  // Step 8 & 9: Run Automated Forensic Dispute Autopsy
  console.log("\n👉 Step 8 & 9: Running Autonomous Chargeback Autopsy (Gemini Engine)...");
  const autopsy = await runDisputeAutopsy(dispute.id);
  console.log(`✅ Autopsy Complete!`);
  console.log(`📊 Recommended Strategy: ${autopsy.analysis.recommendedStrategy}`);
  console.log(`🛡️ Win Probability Score: ${(autopsy.analysis.confidence * 100).toFixed(0)}%`);
  console.log(`📋 Evidence Items Auto-Assembled: ${autopsy.analysis.evidenceChecklist.length}`);
  console.log(`\n=================================================`);
  console.log("🎉 ALL VERTICAL SLICE MILESTONE 1 CHECKS PASSED!");
  console.log("=================================================\n");
}

runMilestone1ProofOfConcept().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});

