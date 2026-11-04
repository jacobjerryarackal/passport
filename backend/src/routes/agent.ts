import { Router, Request, Response } from "express";
import prisma from "../db/prisma";
import { parseTriggerToProposal } from "../agents/gemini";

const router = Router();

// POST /api/agent/trigger
router.post("/trigger", async (req: Request, res: Response) => {
  try {
    const { triggerText, mandateId } = req.body;

    if (!triggerText || typeof triggerText !== "string") {
      return res.status(400).json({ error: "triggerText is required and must be a string" });
    }

    // 1. Locate active mandate
    let mandate = null;
    if (mandateId) {
      mandate = await prisma.mandate.findUnique({
        where: { id: mandateId },
        include: { purchases: true },
      });
    }

    if (!mandate) {
      mandate = await prisma.mandate.findFirst({
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
        include: { purchases: true },
      });
    }

    // If still no mandate in DB (fresh instance), retrieve latest or create baseline
    if (!mandate) {
      mandate = await prisma.mandate.findFirst({
        orderBy: { createdAt: "desc" },
        include: { purchases: true },
      });
    }

    if (!mandate) {
      // Create default active mandate for demonstration
      const expiresAt = new Date(Date.now() + 24 * 3600000);
      mandate = await prisma.mandate.create({
        data: {
          id: "mandate-gift-card-demo",
          title: "Client Appreciation Gift",
          purpose: "Client appreciation gift",
          maxAmount: 80.0,
          currency: "USD",
          allowedCategories: JSON.stringify(["digital gift cards"]),
          expiryHours: 24,
          expiresAt,
          refundPolicy: "Refund allowed if purchase is incorrect or unauthorized",
          status: "ACTIVE",
          rawPrompt: "Authorize my AI agent to buy a digital gift card for a client, up to $80, valid for 24 hours.",
        },
        include: { purchases: true },
      });
    }

    const allowedCats =
      typeof mandate.allowedCategories === "string"
        ? JSON.parse(mandate.allowedCategories)
        : mandate.allowedCategories;

    // 2. Synthesize purchase proposal using Gemini or scenario intelligence
    const proposal = await parseTriggerToProposal({
      triggerText,
      mandate: {
        title: mandate.title,
        purpose: mandate.purpose,
        maxAmount: mandate.maxAmount,
        currency: mandate.currency,
        allowedCategories: allowedCats,
      },
    });

    return res.json({
      success: true,
      triggerText,
      mandate: {
        id: mandate.id,
        title: mandate.title,
        purpose: mandate.purpose,
        maxAmount: mandate.maxAmount,
        currency: mandate.currency,
        allowedCategories: allowedCats,
        expiresAt: mandate.expiresAt,
        status: mandate.status,
      },
      proposal,
    });
  } catch (err) {
    console.error("POST /api/agent/trigger error:", err);
    return res.status(500).json({ error: (err as Error).message });
  }
});

export default router;

