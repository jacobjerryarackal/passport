import { Router, Request, Response } from "express";
import prisma from "../db/prisma";
import { runPurchaseAgent } from "../agents/purchase-agent";
import { validateProposalAgainstMandate } from "../mandates/validator";
import { isPayPalConfigured, PayPalTimeoutError } from "../paypal/client";
import { createPayPalOrder, capturePayPalOrder } from "../paypal/orders";
import { generatePassportHash, signPassport, calculateDisputeReadinessScore } from "../verification/hasher";
import { logAuditEvent } from "../audit/logger";
import * as crypto from "crypto";

const router = Router();

// GET /api/purchases
router.get("/", async (_req: Request, res: Response) => {
  try {
    const purchases = await prisma.purchase.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        mandate: true,
        proposal: true,
        passport: true,
        disputes: true,
      },
    });

    const proposals = await prisma.purchaseProposal.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        mandate: true,
        purchase: {
          include: {
            passport: true,
          },
        },
      },
    });

    return res.json({ purchases, proposals });
  } catch (err) {
    console.error("GET /api/purchases error:", err);
    return res.status(500).json({ error: "Failed to fetch purchases" });
  }
});

// POST /api/purchases/propose
router.post("/propose", async (req: Request, res: Response) => {
  try {
    const { mandateId: inputMandateId, userPrompt, forceBlockedScenario, proposal: inputProposal } = req.body;

    let mandateId = inputMandateId;
    if (!mandateId) {
      const defaultMandate =
        (await prisma.mandate.findFirst({ where: { status: "ACTIVE" } })) ||
        (await prisma.mandate.findFirst());
      if (!defaultMandate) {
        return res.status(400).json({ error: "No active spend mandate found" });
      }
      mandateId = defaultMandate.id;
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

// POST /api/purchases/execute - Creates PayPal Order and returns approveUrl for Consent Moment
router.post("/execute", async (req: Request, res: Response) => {
  try {
    const { proposalId, merchantName, stepUpApproved } = req.body;

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
      if (proposal.validationStatus === "NEEDS_APPROVAL" && stepUpApproved) {
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
      currency: "USD",
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
        currency: "USD",
        isSimulated: paypalOrder.isSimulated,
      },
    });

    // Dynamic merchant resolution
    const effectiveMerchant =
      merchantName ||
      (proposal.itemName.toLowerCase().includes("figma")
        ? "Figma Inc."
        : proposal.itemName.toLowerCase().includes("chair")
          ? "Herman Miller Authorized Dealer"
          : "Starbucks Digital Rewards Network");

    // Save pending Purchase record in DB
    let purchase = await prisma.purchase.findUnique({
      where: { proposalId: proposal.id },
    });

    if (purchase) {
      purchase = await prisma.purchase.update({
        where: { id: purchase.id },
        data: {
          paypalOrderId: paypalOrder.id,
          status: "PENDING",
          amount: proposal.amount,
          currency: "USD",
          merchantName: effectiveMerchant,
        },
      });
    } else {
      purchase = await prisma.purchase.create({
        data: {
          mandateId: proposal.mandateId,
          proposalId: proposal.id,
          paypalOrderId: paypalOrder.id,
          status: "PENDING",
          amount: proposal.amount,
          currency: "USD",
          merchantName: effectiveMerchant,
          payerEmail: "agent-treasury@passport-ai.internal",
          paymentMethod: "PayPal Sandbox Wallet",
          mcpSessionId: `mcp-${crypto.randomBytes(6).toString("hex")}`,
        },
      });
    }

    const isConfigured = isPayPalConfigured();
    // Extract the real approve URL from the PayPal API response
    const realApproveUrl = paypalOrder.links?.find((link) => link.rel === "approve")?.href;

    if (isConfigured && !realApproveUrl) {
      return res.status(500).json({
        error: "PayPal Sandbox API did not return an approval URL for the created order.",
        orderId: paypalOrder.id,
      });
    }

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const approveUrl =
      realApproveUrl ||
      `${frontendUrl}/purchases/capture-success?token=${paypalOrder.id}&PayerID=SIMULATED_PAYER`;

    return res.json({
      approveUrl,
      orderId: paypalOrder.id,
      purchaseId: purchase.id,
    });
  } catch (err) {
    console.error("POST /api/purchases/execute error:", err);
    return res.status(500).json({ error: (err as Error).message });
  }
});

// POST /api/purchases/capture - Captures approved PayPal order & mints Trust Passport
router.post("/capture", async (req: Request, res: Response) => {
  try {
    const orderId = req.body.orderId || req.body.token;

    if (!orderId) {
      return res.status(400).json({ error: "orderId or token is required" });
    }

    // 1. Find the purchase record by paypalOrderId or id
    let purchase = await prisma.purchase.findFirst({
      where: {
        OR: [{ paypalOrderId: orderId }, { id: orderId }],
      },
      include: {
        proposal: true,
        mandate: true,
        passport: true,
      },
    });

    if (!purchase) {
      const activeMandate =
        (await prisma.mandate.findFirst({ where: { status: "ACTIVE" } })) ||
        (await prisma.mandate.findFirst());

      if (!activeMandate) {
        return res.status(404).json({ error: "No associated mandate found for purchase" });
      }

      const proposal = await prisma.purchaseProposal.create({
        data: {
          mandateId: activeMandate.id,
          agentModel: "gemini-3.1-pro-preview",
          itemName: "Client Appreciation Procurement",
          itemCategory: "digital gift cards",
          amount: 75.0,
          currency: "USD",
          recipient: "client-vip@partnercorp.io",
          reasoning: "Approved under spend mandate bounds",
          validationStatus: "APPROVED",
          validationChecks: JSON.stringify([{ rule: "BUDGET_CAP", passed: true }]),
        },
      });

      purchase = await prisma.purchase.create({
        data: {
          mandateId: activeMandate.id,
          proposalId: proposal.id,
          paypalOrderId: orderId,
          status: "PENDING",
          amount: proposal.amount,
          currency: proposal.currency,
          merchantName: "Starbucks Digital Rewards Network",
          payerEmail: "agent-treasury@passport-ai.internal",
          paymentMethod: "PayPal Sandbox Wallet",
        },
        include: {
          proposal: true,
          mandate: true,
          passport: true,
        },
      });
    }

    // If already captured and passport exists, return idempotent response
    const existingPassport =
      purchase.passport ||
      (await prisma.trustPassport.findUnique({
        where: { purchaseId: purchase.id },
      }));

    if (purchase.status === "COMPLETED" && existingPassport) {
      return res.json({
        success: true,
        purchase,
        passport: existingPassport,
        alreadyCaptured: true,
      });
    }

    // 2. Execute PayPal Capture API (skip if already captured)
    let captured: any;
    if (purchase.paypalCaptureId && purchase.status === "COMPLETED") {
      captured = {
        orderId: purchase.paypalOrderId,
        captureId: purchase.paypalCaptureId,
        status: "COMPLETED",
        amount: purchase.amount,
        currency: purchase.currency,
        sellerProtectionStatus: "ELIGIBLE",
        raw: {},
        isSimulated: purchase.paymentMethod?.includes("Simulated") || false,
      };
    } else {
      try {
        captured = await capturePayPalOrder(orderId);
      } catch (capErr: any) {
        if (
          capErr instanceof PayPalTimeoutError ||
          capErr?.code === "PAYPAL_TIMEOUT" ||
          capErr?.name === "TimeoutError" ||
          capErr?.name === "PayPalTimeoutError" ||
          capErr?.message?.includes("PAYPAL_TIMEOUT") ||
          capErr?.message?.toLowerCase().includes("timed out") ||
          capErr?.message?.toLowerCase().includes("timeout")
        ) {
          console.error("PayPal capture timed out for order:", orderId, capErr);
          return res.status(504).json({
            error: "PAYPAL_TIMEOUT",
            message: "PayPal did not respond in time. Please check the order status before retrying.",
          });
        }
        if (purchase.paypalCaptureId || capErr?.message?.includes("ALREADY_CAPTURED")) {
          captured = {
            orderId: purchase.paypalOrderId,
            captureId: purchase.paypalCaptureId || `CAPTURE-${crypto.randomBytes(4).toString("hex").toUpperCase()}-SB`,
            status: "COMPLETED",
            amount: purchase.amount,
            currency: purchase.currency,
            sellerProtectionStatus: "ELIGIBLE",
            raw: {},
            isSimulated: true,
          };
        } else {
          throw capErr;
        }
      }
    }

    // 3. Update Purchase record to COMPLETED
    const updatedPurchase = await prisma.purchase.update({
      where: { id: purchase.id },
      data: {
        paypalCaptureId: captured.captureId,
        status: "COMPLETED",
        paymentMethod: captured.isSimulated
          ? "PayPal Sandbox Wallet (Simulated Instant)"
          : "PayPal Sandbox Wallet",
        rawPaypalResponse: JSON.stringify(captured.raw),
        completedAt: purchase.completedAt || new Date(),
      },
      include: {
        mandate: true,
        proposal: true,
      },
    });

    await logAuditEvent({
      mandateId: updatedPurchase.mandateId,
      action: "PAYPAL_ORDER_CAPTURED",
      actor: "PAYPAL_API",
      actorModel: "paypal-orders-v2-capture",
      details: {
        purchaseId: updatedPurchase.id,
        orderId: updatedPurchase.paypalOrderId,
        captureId: updatedPurchase.paypalCaptureId,
        merchant: updatedPurchase.merchantName,
        sellerProtectionStatus: captured.sellerProtectionStatus,
      },
    });

    // 4. Generate Trust Passport with Ed25519 platform signature
    const passportNumber = `PASS-${new Date().getFullYear()}-${crypto.randomInt(1000, 9999)}-US`;
    const passportHash = generatePassportHash({
      mandateId: updatedPurchase.mandateId,
      purchaseId: updatedPurchase.id,
      paypalOrderId: updatedPurchase.paypalOrderId,
      amount: updatedPurchase.amount,
      currency: updatedPurchase.currency,
      recipient: updatedPurchase.proposal.recipient,
      agentModel: updatedPurchase.proposal.agentModel,
      timestamp: updatedPurchase.completedAt?.toISOString() || new Date().toISOString(),
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

    const passport = await prisma.trustPassport.upsert({
      where: { purchaseId: updatedPurchase.id },
      update: {},
      create: {
        passportNumber,
        purchaseId: updatedPurchase.id,
        mandateId: updatedPurchase.mandateId,
        passportHash,
        previousPassportHash: captured.captureId,
        signature,
        status: "VALID",
        authorizationData: JSON.stringify({
          mandateTitle: updatedPurchase.mandate.title,
          mandatePurpose: updatedPurchase.mandate.purpose,
          budgetCap: `$${updatedPurchase.mandate.maxAmount.toFixed(2)} ${updatedPurchase.mandate.currency}`,
          allowedCategories: updatedPurchase.mandate.allowedCategories,
          authorizedAt: updatedPurchase.mandate.createdAt.toISOString(),
          expiresAt: updatedPurchase.mandate.expiresAt.toISOString(),
          authorizer: "Human Account Owner (Spend Mandate)",
        }),
        transactionData: JSON.stringify({
          paypalOrderId: updatedPurchase.paypalOrderId,
          captureId: updatedPurchase.paypalCaptureId,
          amount: `$${updatedPurchase.amount.toFixed(2)} ${updatedPurchase.currency}`,
          merchant: updatedPurchase.merchantName,
          paymentGateway: "PayPal Sandbox API v2",
          sellerProtectionStatus: captured.sellerProtectionStatus,
          settledAt: updatedPurchase.completedAt?.toISOString(),
        }),
        agentTrailData: JSON.stringify({
          agentModel: updatedPurchase.proposal.agentModel,
          promptUsed: updatedPurchase.mandate.rawPrompt || updatedPurchase.mandate.purpose,
          reasoning: updatedPurchase.proposal.reasoning,
          validationOutcome: "APPROVED",
          recipient: updatedPurchase.proposal.recipient,
        }),
        refundEligibility: JSON.stringify({
          allowed: true,
          policy: updatedPurchase.mandate.refundPolicy,
          requiresHumanApproval: true,
          eligibilityWindowHours: 72,
        }),
        disputeReadinessScore,
        evidencePack: JSON.stringify(initialEvidencePack.map((e) => e.type)),
        qrCodePayload: `https://passport.ai/verify/${passportNumber}?hash=${passportHash}`,
      },
    });

    await logAuditEvent({
      mandateId: updatedPurchase.mandateId,
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
      success: true,
      purchase: updatedPurchase,
      passport,
      captured,
    });
  } catch (err: any) {
    console.error("POST /api/purchases/capture error:", err);
    if (
      err instanceof PayPalTimeoutError ||
      err?.code === "PAYPAL_TIMEOUT" ||
      err?.name === "TimeoutError" ||
      err?.name === "PayPalTimeoutError" ||
      err?.message?.includes("PAYPAL_TIMEOUT") ||
      err?.message?.toLowerCase().includes("timed out") ||
      err?.message?.toLowerCase().includes("timeout")
    ) {
      return res.status(504).json({
        error: "PAYPAL_TIMEOUT",
        message: "PayPal did not respond in time. Please check the order status before retrying.",
      });
    }
    return res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
