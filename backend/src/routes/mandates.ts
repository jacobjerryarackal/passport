import { Router, Request, Response } from "express";
import prisma from "../db/prisma";
import { logAuditEvent } from "../audit/logger";
import { parseNaturalLanguageMandate } from "../agents/gemini";

const router = Router();

// GET /api/mandates
router.get("/", async (_req: Request, res: Response) => {
  try {
    const mandates = await prisma.mandate.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        proposals: { orderBy: { createdAt: "desc" } },
        purchases: { orderBy: { createdAt: "desc" } },
        passports: true,
      },
    });

    return res.json({ mandates });
  } catch (err) {
    console.error("GET /api/mandates error:", err);
    return res.status(500).json({ error: "Failed to fetch mandates" });
  }
});

// POST /api/mandates
router.post("/", async (req: Request, res: Response) => {
  try {
    const {
      title,
      purpose,
      maxAmount,
      currency = "USD",
      allowedCategories,
      expiryHours = 24,
      refundPolicy,
      rawPrompt,
    } = req.body;

    if (!title || !purpose || !maxAmount) {
      return res.status(400).json({ error: "Missing required mandate fields" });
    }

    const expiresAt = new Date(Date.now() + Number(expiryHours) * 3600000);
    const categoriesArray = Array.isArray(allowedCategories)
      ? allowedCategories
      : typeof allowedCategories === "string"
      ? allowedCategories.split(",").map((c: string) => c.trim())
      : ["digital gift cards"];

    const mandate = await prisma.mandate.create({
      data: {
        title,
        purpose,
        maxAmount: Number(maxAmount),
        currency: currency.toUpperCase(),
        allowedCategories: JSON.stringify(categoriesArray),
        expiryHours: Number(expiryHours),
        expiresAt,
        refundPolicy: refundPolicy || "Refund allowed if purchase is incorrect or unauthorized",
        status: "ACTIVE",
        rawPrompt: rawPrompt || null,
      },
    });

    await logAuditEvent({
      mandateId: mandate.id,
      action: "MANDATE_CREATED",
      actor: "HUMAN_ADMIN",
      details: {
        title: mandate.title,
        maxAmount: mandate.maxAmount,
        currency: mandate.currency,
        allowedCategories: categoriesArray,
        expiryHours: mandate.expiryHours,
      },
    });

    return res.status(201).json({ mandate });
  } catch (err) {
    console.error("POST /api/mandates error:", err);
    return res.status(500).json({ error: "Failed to create mandate" });
  }
});

// POST /api/mandates/parse
router.post("/parse", async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Missing required prompt" });
    }

    const parsed = await parseNaturalLanguageMandate(prompt);
    return res.json({ parsed });
  } catch (err) {
    console.error("POST /api/mandates/parse error:", err);
    return res.status(500).json({ error: "Failed to parse mandate prompt" });
  }
});

export default router;

