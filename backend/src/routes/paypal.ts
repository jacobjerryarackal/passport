import { Router, Request, Response } from "express";
import { getPayPalConfigInfo } from "../paypal/client";
import { isGeminiConfigured } from "../agents/gemini";
import { paypalAgentToolkit, list_disputes, get_dispute, accept_dispute_claim } from "../paypal/agent-toolkit";

const router = Router();

// GET /api/paypal/status
router.get("/status", async (_req: Request, res: Response) => {
  try {
    const paypal = getPayPalConfigInfo();
    const geminiConfigured = isGeminiConfigured();

    return res.json({
      paypal,
      gemini: {
        configured: geminiConfigured,
        model: "gemini-2.5-pro",
      },
      demoMode: process.env.DEMO_MODE === "true" || !paypal.configured,
    });
  } catch (err) {
    console.error("GET /api/paypal/status error:", err);
    return res.status(500).json({ error: (err as Error).message });
  }
});

// GET /api/paypal/disputes
router.get("/disputes", async (req: Request, res: Response) => {
  try {
    const startTime = req.query.startTime as string | undefined;
    const disputes = await list_disputes({ startTime });
    return res.json({ disputes });
  } catch (err) {
    console.error("GET /api/paypal/disputes error:", err);
    return res.status(500).json({ error: (err as Error).message });
  }
});

// GET /api/paypal/disputes/:id
router.get("/disputes/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const dispute = await get_dispute(id);
    return res.json({ dispute });
  } catch (err) {
    console.error("GET /api/paypal/disputes/:id error:", err);
    return res.status(500).json({ error: (err as Error).message });
  }
});

// POST /api/paypal/disputes/:id/accept
router.post("/disputes/:id/accept", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    const result = await accept_dispute_claim(id, note);
    return res.json(result);
  } catch (err) {
    console.error("POST /api/paypal/disputes/:id/accept error:", err);
    return res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
