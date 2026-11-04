import { Router, Request, Response } from "express";
import prisma from "../db/prisma";

const router = Router();

// GET /api/audit
router.get("/", async (_req: Request, res: Response) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { timestamp: "desc" },
      include: {
        mandate: true,
      },
    });

    // Verify hash chain integrity
    let isChainIntact = true;
    for (let i = 0; i < logs.length - 1; i++) {
      const current = logs[i];
      const previous = logs[i + 1];
      if (current.parentHash && current.parentHash !== previous.eventHash) {
        isChainIntact = false;
        break;
      }
    }

    return res.json({
      auditLogs: logs,
      verification: {
        isChainIntact,
        totalEntries: logs.length,
        latestHash: logs[0]?.eventHash || null,
        verifiedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error("GET /api/audit error:", err);
    return res.status(500).json({ error: "Failed to fetch audit log" });
  }
});

export default router;

