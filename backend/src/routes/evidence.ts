import { Router, Request, Response } from "express";
import prisma from "../db/prisma";

const router = Router();

// GET /api/evidence
router.get("/", async (_req: Request, res: Response) => {
  try {
    const items = await prisma.evidenceItem.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        dispute: {
          include: {
            purchase: {
              include: {
                mandate: true,
                passport: true,
              },
            },
          },
        },
      },
    });

    return res.json({ evidenceItems: items });
  } catch (err) {
    console.error("GET /api/evidence error:", err);
    return res.status(500).json({ error: "Failed to fetch evidence items" });
  }
});

export default router;

