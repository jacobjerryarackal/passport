import { Router, Request, Response } from "express";
import prisma from "../db/prisma";
import { runDisputeAutopsy } from "../agents/dispute-agent";
import { submitDisputeEvidence } from "../paypal/disputes";
import { logAuditEvent } from "../audit/logger";
import * as crypto from "crypto";

const router = Router();

// GET /api/disputes
router.get("/", async (_req: Request, res: Response) => {
  try {
    const disputes = await prisma.dispute.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        purchase: {
          include: {
            mandate: true,
            proposal: true,
            passport: true,
          },
        },
        passport: true,
        evidenceItems: true,
      },
    });

    return res.json({ disputes });
  } catch (err) {
    console.error("GET /api/disputes error:", err);
    return res.status(500).json({ error: "Failed to fetch disputes" });
  }
});

// POST /api/disputes (simulate or trigger a dispute)
router.post("/", async (req: Request, res: Response) => {
  try {
    const { purchaseId, reason = "UNAUTHORIZED_TRANSACTION", buyerNotes } = req.body;

    let targetPurchase = null;
    if (purchaseId) {
      targetPurchase = await prisma.purchase.findUnique({
        where: { id: purchaseId },
        include: { passport: true },
      });
    } else {
      targetPurchase = await prisma.purchase.findFirst({
        where: { status: { in: ["COMPLETED", "DISPUTED"] } },
        orderBy: { createdAt: "desc" },
        include: { passport: true },
      });
    }

    if (!targetPurchase) {
      return res.status(404).json({ error: "No eligible purchase found to dispute" });
    }

    const paypalDisputeId = `PP-D-${crypto.randomInt(100000, 999999)}`;
    const dueDate = new Date(Date.now() + 7 * 86400000);

    const dispute = await prisma.dispute.create({
      data: {
        paypalDisputeId,
        purchaseId: targetPurchase.id,
        passportId: targetPurchase.passport?.id || null,
        status: "ACTION_REQUIRED",
        disputeReason: reason,
        disputeAmount: targetPurchase.amount,
        currency: targetPurchase.currency,
        disputeLifeCycleStage: "CHARGEBACK",
        dueDate,
        buyerNotes:
          buyerNotes ||
          "Cardholder reported unrecognized digital transaction and filed chargeback claiming unauthorized access.",
      },
    });

    await prisma.purchase.update({
      where: { id: targetPurchase.id },
      data: { status: "DISPUTED" },
    });

    if (targetPurchase.passport?.id) {
      await prisma.trustPassport.update({
        where: { id: targetPurchase.passport.id },
        data: { status: "DISPUTED" },
      });
    }

    await logAuditEvent({
      mandateId: targetPurchase.mandateId,
      action: "DISPUTE_RECEIVED",
      actor: "PAYPAL_WEBHOOK",
      actorModel: "dispute-simulator",
      details: {
        disputeId: dispute.id,
        paypalDisputeId: dispute.paypalDisputeId,
        reason: dispute.disputeReason,
        amount: dispute.disputeAmount,
      },
    });

    const autopsyResult = await runDisputeAutopsy(dispute.id);

    return res.status(201).json({
      dispute: autopsyResult.dispute,
      analysis: autopsyResult.analysis,
    });
  } catch (err) {
    console.error("POST /api/disputes error:", err);
    return res.status(500).json({ error: (err as Error).message });
  }
});

// GET /api/disputes/:id
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const dispute = await prisma.dispute.findFirst({
      where: {
        OR: [{ id }, { paypalDisputeId: id }],
      },
      include: {
        evidenceItems: true,
        passport: true,
        purchase: {
          include: {
            mandate: {
              include: {
                auditLogs: { orderBy: { timestamp: "asc" } },
              },
            },
            proposal: true,
          },
        },
      },
    });

    if (!dispute) {
      return res.status(404).json({ error: "Dispute not found" });
    }

    return res.json({ dispute });
  } catch (err) {
    console.error("GET /api/disputes/:id error:", err);
    return res.status(500).json({ error: "Failed to load dispute" });
  }
});

// POST /api/disputes/:id/classify
router.post("/:id/classify", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await runDisputeAutopsy(id);
    return res.json(result);
  } catch (err) {
    console.error("POST /api/disputes/:id/classify error:", err);
    return res.status(500).json({ error: (err as Error).message });
  }
});

// POST /api/disputes/:id/cosign
router.post("/:id/cosign", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { cosignedBy, finalResponseText } = req.body;

    if (!cosignedBy || typeof cosignedBy !== "string") {
      return res.status(400).json({ error: "Human approver name or identity is required to co-sign" });
    }

    const dispute = await prisma.dispute.findUnique({
      where: { id },
      include: {
        evidenceItems: true,
        purchase: {
          include: { mandate: true },
        },
      },
    });

    if (!dispute) {
      return res.status(404).json({ error: "Dispute not found" });
    }

    const now = new Date();
    const effectiveResponse = finalResponseText || dispute.draftResponse || "Evidence package submitted.";

    // 1. Submit evidence payload to PayPal API (or clearly labeled mock submission if simulated)
    const isSimulated = Boolean(
      dispute.simulated ||
      dispute.paypalDisputeId.startsWith("PP-D-SIM") ||
      dispute.paypalDisputeId.startsWith("PP-D-849201")
    );

    const submissionResult = await submitDisputeEvidence({
      disputeId: dispute.paypalDisputeId,
      notes: effectiveResponse,
      evidenceType: "PROOF_OF_FULFILLMENT",
      evidenceItems: dispute.evidenceItems.map((e) => ({ title: e.title, hash: e.hash })),
      cosignedBy,
      isSimulated,
    });

    // 2. Update Dispute in Database
    const updated = await prisma.dispute.update({
      where: { id: dispute.id },
      data: {
        status: "SUBMITTED",
        cosignedBy,
        cosignedAt: now,
        submittedAt: now,
        draftResponse: effectiveResponse,
        submissionPayload: JSON.stringify({
          disputeId: dispute.paypalDisputeId,
          cosignedBy,
          submittedAt: now.toISOString(),
          isSimulated,
          submissionMode: submissionResult.submissionMode || "SIMULATED SUBMISSION",
          submissionResult,
        }),
      },
    });

    // 3. Log Human Co-Signature Audit Event
    await logAuditEvent({
      mandateId: dispute.purchase.mandateId,
      action: "HUMAN_COSIGNED",
      actor: "HUMAN_ADMIN",
      actorModel: "dispute-co-sign-modal",
      simulated: isSimulated,
      details: {
        disputeId: dispute.id,
        paypalDisputeId: dispute.paypalDisputeId,
        cosignedBy,
        cosignedAt: now.toISOString(),
        isSimulated,
        submissionMode: submissionResult.submissionMode,
      },
    });

    // 4. Log Dispute Submission Event
    await logAuditEvent({
      mandateId: dispute.purchase.mandateId,
      action: "DISPUTE_SUBMITTED",
      actor: "SYSTEM_VALIDATOR",
      actorModel: isSimulated ? "simulated-dispute-client" : "paypal-disputes-v1-client",
      simulated: isSimulated,
      details: {
        disputeId: dispute.id,
        paypalDisputeId: dispute.paypalDisputeId,
        isSimulated,
        submissionMode: submissionResult.submissionMode,
      },
    });

    return res.json({
      success: true,
      dispute: updated,
      submissionResult,
    });
  } catch (err) {
    console.error("POST /api/disputes/:id/cosign error:", err);
    return res.status(500).json({ error: (err as Error).message });
  }
});

export default router;

