import { Router, Request, Response } from "express";
import prisma from "../db/prisma";
import { runPurchaseAgent } from "../agents/purchase-agent";
import { validateProposalAgainstMandate } from "../mandates/validator";
import { createPayPalOrder, capturePayPalOrder } from "../paypal/orders";
import { generatePassportHash, signPassport, calculateDisputeReadinessScore } from "../verification/hasher";
import { logAuditEvent } from "../audit/logger";
import * as crypto from "crypto";

const router = Router();

// POST /api/purchases/propose
router.post("/propose", async (req: Request, res: Response) => {
  try {
    const { mandateId, userPrompt, forceBlockedScenario, proposal: inputProposal } = req.body;

    if (!mandateId) {
      return res.status(400).json({ error: "mandateId is required" });
    }

    // Case 1: Specific proposal payload provided (e.g. from Agent Trigger Simulator)
    if (inputProposal || (req.body.itemName && req.body.amount)) {
      const targetProposal = inputProposal || {
        itemName: req.body.itemName,
        amount: req.body.amount,
        currency: req.body.currency || "USD",
        category: req.body.category || req.body.itemCategory,
        merchant: req.body.merchant,
        recipient: req.body.recipient,
        reasoning: req.body.reasoning,
      };

      const mandate = await prisma.mandate.findUnique({
        where: { id: mandateId },
        include: { purchases: true },
      });

      if (!mandate) {
        return res.status(404).json({ error: `Mandate ${mandateId} not found` });
      }

      // Calculate current cumulative spend
      const currentSpent = mandate.purchases.reduce((acc, p) => {
        return p.status !== "FAILED" ? acc + p.amount : acc;
      }, 0);

      const allowedCats =
        typeof mandate.allowedCategories === "string"
          ? JSON.parse(mandate.allowedCategories)
          : mandate.allowedCategories;

      // Strictly validate proposal against mandate constraints
      const validation = validateProposalAgainstMandate({
        mandate: {
          id: mandate.id,
          title: mandate.title,
          maxAmount: mandate.maxAmount,
          currency: mandate.currency,
          allowedCategories: allowedCats,
          expiresAt: mandate.expiresAt,
          status: mandate.status,
          revoked: mandate.revoked,
        },
        proposal: {
          itemName: targetProposal.itemName || "Unnamed Proposal Item",
          itemCategory: targetProposal.category || targetProposal.itemCategory || "general",
          amount: Number(targetProposal.amount),
          currency: targetProposal.currency || mandate.currency,
          recipient: targetProposal.recipient || "authorized-recipient@business.internal",
          reasoning: targetProposal.reasoning,
          isPromptInjection: Boolean(targetProposal.isPromptInjection),
          rawPrompt: typeof userPrompt === "string" ? userPrompt : undefined,
        },
        currentSpentAmount: currentSpent,
      });

      // Save proposal record to database
      const savedProposal = await prisma.purchaseProposal.create({
        data: {
          mandateId: mandate.id,
          agentModel: "gemini-2.5-pro",
          itemName: targetProposal.itemName || "Unnamed Proposal Item",
          itemCategory: targetProposal.category || targetProposal.itemCategory || "general",
          amount: Number(targetProposal.amount),
          currency: targetProposal.currency || mandate.currency,
          recipient: targetProposal.recipient || "authorized-recipient@business.internal",
          reasoning: targetProposal.reasoning || "Generated under spend mandate",
          validationStatus: validation.status,
          violationReason: validation.violationReason || null,
          validationChecks: JSON.stringify(validation.checks),
        },
      });

      // Log tamper-evident audit event
      await logAuditEvent({
        mandateId: mandate.id,
        action: validation.isApproved ? "VALIDATION_PASSED" : "VALIDATION_BLOCKED",
        actor: "SYSTEM_VALIDATOR",
        actorModel: "passport-guard-engine",
        details: {
          proposalId: savedProposal.id,
          itemName: savedProposal.itemName,
          amount: savedProposal.amount,
          status: validation.status,
          violationReason: validation.violationReason,
          checks: validation.checks,
        },
      });

      return res.json({
        proposal: savedProposal,
        validation,
      });
    }

    // Case 2: Standard agent proposal generation from prompt
    const result = await runPurchaseAgent({
      mandateId,
      userPrompt: userPrompt || "Select an appropriate purchase within authorized mandate",
      forceBlockedScenario: Boolean(forceBlockedScenario),
    });

    return res.json(result);
  } catch (err) {
    console.error("POST /api/purchases/propose error:", err);
    return res.status(500).json({ error: (err as Error).message });
  }
});

// POST /api/purchases/execute
router.post("/execute", async (req: Request, res: Response) => {
  try {
    const { proposalId, merchantName } = req.body;

    if (!proposalId) {
      return res.status(400).json({ error: "proposalId is required" });
    }

    const proposal = await prisma.purchaseProposal.findUnique({
      where: { id: proposalId },
      include: { mandate: true },
    });

    if (!proposal) {
      return res.status(404).json({ error: "Proposal not found" });
    }

    if (proposal.validationStatus !== "APPROVED" && proposal.validationStatus !== "ALLOW") {
      if (proposal.validationStatus === "NEEDS_APPROVAL" && req.body.stepUpApproved) {
        // Step-up approval granted by human authorized administrator
        await logAuditEvent({
          mandateId: proposal.mandateId,
          action: "STEP_UP_APPROVED",
          actor: "ACCOUNT_OWNER",
          actorModel: "human-co-signer",
          details: {
            proposalId: proposal.id,
            reason: "Human step-up approval override granted for variance within 20% tolerance.",
          },
        });
      } else {
        return res.status(400).json({
          error: "Proposal violates mandate policy and cannot be executed via PayPal",
          violationReason: proposal.violationReason,
        });
      }
    }

    // Pre-mint Passport identifier and SHA-256 mandate hash for two-sided merchant verification
    const passportNumber = `PASS-${new Date().getFullYear()}-${crypto.randomInt(1000, 9999)}-US`;
    const mandateHash = crypto
      .createHash("sha256")
      .update(JSON.stringify(proposal.mandate))
      .digest("hex");

    // 1. Create PayPal Order with attached custom_id (Trust Passport ID + Mandate SHA-256 Hash)
    const paypalOrder = await createPayPalOrder({
      mandateId: proposal.mandateId,
      amount: proposal.amount,
      currency: proposal.currency,
      itemName: proposal.itemName,
      category: proposal.itemCategory,
      recipient: proposal.recipient,
      mcpSessionId: `mcp-${crypto.randomBytes(6).toString("hex")}`,
      passportId: passportNumber,
      mandateHash,
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

    // Dynamic merchant resolution
    const effectiveMerchant =
      merchantName ||
      (proposal.itemName.toLowerCase().includes("figma")
        ? "Figma Inc."
        : proposal.itemName.toLowerCase().includes("chair")
        ? "Herman Miller Authorized Dealer"
        : "Starbucks Digital Rewards Network");

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
        merchantName: effectiveMerchant,
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
        merchant: effectiveMerchant,
        sellerProtectionStatus: captured.sellerProtectionStatus,
      },
    });

    // 4. Generate Trust Passport with Ed25519 platform signature
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
          authorizer: "Human Account Owner (Spend Mandate)",
        }),
        transactionData: JSON.stringify({
          paypalOrderId: purchase.paypalOrderId,
          captureId: purchase.paypalCaptureId,
          amount: `$${purchase.amount.toFixed(2)} ${purchase.currency}`,
          merchant: effectiveMerchant,
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

    return res.json({
      purchase,
      passport,
      paypalOrder,
    });
  } catch (err) {
    console.error("POST /api/purchases/execute error:", err);
    return res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
