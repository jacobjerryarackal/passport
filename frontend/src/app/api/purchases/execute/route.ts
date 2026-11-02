import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prisma";
import { createPayPalOrder, capturePayPalOrder } from "@/server/paypal/orders";
import { generatePassportHash, signPassport, calculateDisputeReadinessScore } from "@/server/verification/hasher";
import { logAuditEvent } from "@/server/audit/logger";
import * as crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { proposalId } = await req.json();

    if (!proposalId) {
      return NextResponse.json({ error: "proposalId is required" }, { status: 400 });
    }

    const proposal = await prisma.purchaseProposal.findUnique({
      where: { id: proposalId },
      include: { mandate: true },
    });

    if (!proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    if (proposal.validationStatus !== "APPROVED") {
      return NextResponse.json(
        {
          error: "Proposal violates mandate policy and cannot be executed via PayPal",
          violationReason: proposal.violationReason,
        },
        { status: 400 }
      );
    }

    // 1. Create PayPal Order
    const paypalOrder = await createPayPalOrder({
      mandateId: proposal.mandateId,
      amount: proposal.amount,
      currency: proposal.currency,
      itemName: proposal.itemName,
      category: proposal.itemCategory,
      recipient: proposal.recipient,
      mcpSessionId: `mcp-${crypto.randomBytes(6).toString("hex")}`,
    });

    await logAuditEvent({
      mandateId: proposal.mandateId,
      action: "PAYPAL_ORDER_CREATED",
      actor: "PAYPAL_API",
      actorModel: "paypal-checkout-orders-v2",
      details: {
        orderId: paypalOrder.id,
        amount: proposal.amount,
        currency: proposal.currency,
        isSimulated: paypalOrder.isSimulated,
      },
    });

    // 2. Capture PayPal Order
    const captured = await capturePayPalOrder(paypalOrder.id);

    // 3. Save Purchase record
    const purchase = await prisma.purchase.create({
      data: {
        mandateId: proposal.mandateId,
        proposalId: proposal.id,
        paypalOrderId: paypalOrder.id,
        paypalCaptureId: captured.captureId,
        status: "COMPLETED",
        amount: proposal.amount,
        currency: proposal.currency,
        merchantName: "Starbucks Digital Rewards Network",
        payerEmail: "agent-treasury@passport-ai.internal",
        paymentMethod: captured.isSimulated
          ? "PayPal Sandbox Wallet (Simulated Instant)"
          : "PayPal Sandbox Wallet",
        mcpSessionId: `mcp-${crypto.randomBytes(6).toString("hex")}`,
        rawPaypalResponse: JSON.stringify(captured.raw),
        completedAt: new Date(),
      },
    });

    await logAuditEvent({
      mandateId: proposal.mandateId,
      action: "PAYPAL_ORDER_CAPTURED",
      actor: "PAYPAL_API",
      actorModel: "paypal-orders-v2-capture",
      details: {
        purchaseId: purchase.id,
        orderId: purchase.paypalOrderId,
        captureId: purchase.paypalCaptureId,
        sellerProtectionStatus: captured.sellerProtectionStatus,
      },
    });

    // 4. Generate Trust Passport
    const passportNumber = `PASS-${new Date().getFullYear()}-${crypto.randomInt(1000, 9999)}-US`;
    const passportHash = generatePassportHash({
      mandateId: proposal.mandateId,
      purchaseId: purchase.id,
      paypalOrderId: purchase.paypalOrderId,
      amount: purchase.amount,
      currency: purchase.currency,
      recipient: proposal.recipient,
      agentModel: proposal.agentModel,
      timestamp: purchase.completedAt?.toISOString() || new Date().toISOString(),
    });

    const signature = signPassport(passportHash);

    const initialEvidencePack = [
      { type: "MANDATE_AUTHORIZATION", status: "VERIFIED" },
      { type: "PAYPAL_CAPTURE_RECEIPT", status: "VERIFIED" },
      { type: "AGENT_REASONING_LOG", status: "VERIFIED" },
      { type: "DELIVERY_CONFIRMATION", status: "VERIFIED" },
      { type: "TERMS_AND_REFUND_POLICY", status: "VERIFIED" },
    ];

    const disputeReadinessScore = calculateDisputeReadinessScore(initialEvidencePack);

    const passport = await prisma.trustPassport.create({
      data: {
        passportNumber,
        purchaseId: purchase.id,
        mandateId: proposal.mandateId,
        passportHash,
        previousPassportHash: captured.captureId,
        signature,
        status: "VALID",
        authorizationData: JSON.stringify({
          mandateTitle: proposal.mandate.title,
          mandatePurpose: proposal.mandate.purpose,
          budgetCap: `$${proposal.mandate.maxAmount.toFixed(2)} ${proposal.mandate.currency}`,
          allowedCategories: proposal.mandate.allowedCategories,
          authorizedAt: proposal.mandate.createdAt.toISOString(),
          expiresAt: proposal.mandate.expiresAt.toISOString(),
          authorizer: "Human Small Business Owner",
        }),
        transactionData: JSON.stringify({
          paypalOrderId: purchase.paypalOrderId,
          captureId: purchase.paypalCaptureId,
          amount: `$${purchase.amount.toFixed(2)} ${purchase.currency}`,
          merchant: purchase.merchantName,
          paymentGateway: "PayPal Sandbox API v2",
          sellerProtectionStatus: captured.sellerProtectionStatus,
          settledAt: purchase.completedAt?.toISOString(),
        }),
        agentTrailData: JSON.stringify({
          agentModel: proposal.agentModel,
          promptUsed: proposal.mandate.rawPrompt || proposal.mandate.purpose,
          reasoning: proposal.reasoning,
          validationOutcome: "APPROVED",
          recipient: proposal.recipient,
        }),
        refundEligibility: JSON.stringify({
          allowed: true,
          policy: proposal.mandate.refundPolicy,
          requiresHumanApproval: true,
          eligibilityWindowHours: 72,
        }),
        disputeReadinessScore,
        evidencePack: JSON.stringify(initialEvidencePack.map((e) => e.type)),
        qrCodePayload: `https://passport.ai/verify/${passportNumber}?hash=${passportHash}`,
      },
    });

    await logAuditEvent({
      mandateId: proposal.mandateId,
      action: "PASSPORT_ISSUED",
      actor: "SYSTEM_VALIDATOR",
      actorModel: "passport-core-engine",
      details: {
        passportId: passport.id,
        passportNumber: passport.passportNumber,
        hash: passport.passportHash,
        disputeReadinessScore: passport.disputeReadinessScore,
      },
    });

    return NextResponse.json({
      purchase,
      passport,
      paypalOrder,
    });
  } catch (err) {
    console.error("POST /api/purchases/execute error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

