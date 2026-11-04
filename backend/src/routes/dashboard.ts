import { Router, Request, Response } from "express";
import prisma from "../db/prisma";

const router = Router();

// GET /api/dashboard
router.get("/", async (_req: Request, res: Response) => {
  try {
    const [mandates, purchases, proposals, passports, disputes, auditLogs] =
      await Promise.all([
        prisma.mandate.findMany({
          orderBy: { createdAt: "desc" },
          include: { purchases: true, passports: true },
        }),
        prisma.purchase.findMany({
          orderBy: { createdAt: "desc" },
          take: 12,
          include: { mandate: true, proposal: true, passport: true },
        }),
        prisma.purchaseProposal.findMany({
          orderBy: { createdAt: "desc" },
          take: 12,
          include: { mandate: true },
        }),
        prisma.trustPassport.findMany({
          orderBy: { issuedAt: "desc" },
          take: 12,
          include: {
            purchase: {
              include: { proposal: true },
            },
            mandate: true,
          },
        }),
        prisma.dispute.findMany({
          orderBy: { createdAt: "desc" },
          include: { purchase: true, passport: true, evidenceItems: true },
        }),
        prisma.auditLog.findMany({
          orderBy: { timestamp: "desc" },
          take: 10,
        }),
      ]);

    return res.json({
      mandates,
      purchases,
      proposals,
      passports,
      disputes,
      auditLogs,
    });
  } catch (err) {
    console.error("GET /api/dashboard error:", err);
    return res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
});

export default router;

