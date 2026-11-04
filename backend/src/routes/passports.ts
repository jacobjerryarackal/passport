import { Router, Request, Response } from "express";
import prisma from "../db/prisma";
import { verifyPassportSignature } from "../verification/hasher";

const router = Router();

// GET /api/passports
router.get("/", async (_req: Request, res: Response) => {
  try {
    const passports = await prisma.trustPassport.findMany({
      orderBy: { issuedAt: "desc" },
      include: {
        mandate: true,
        purchase: {
          include: {
            proposal: true,
          },
        },
        disputes: true,
      },
    });

    return res.json({ passports });
  } catch (err) {
    console.error("GET /api/passports error:", err);
    return res.status(500).json({ error: "Failed to fetch passports" });
  }
});

// GET /api/passports/:id
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const passport = await prisma.trustPassport.findFirst({
      where: {
        OR: [{ id }, { passportNumber: id }],
      },
      include: {
        mandate: {
          include: {
            auditLogs: { orderBy: { timestamp: "asc" } },
          },
        },
        purchase: {
          include: {
            proposal: true,
            disputes: {
              include: {
                evidenceItems: true,
              },
            },
          },
        },
      },
    });

    if (!passport) {
      return res.status(404).json({ error: "Passport not found" });
    }

    const isSignatureValid = verifyPassportSignature(passport.passportHash, passport.signature);

    return res.json({
      passport,
      verification: {
        isSignatureValid,
        hash: passport.passportHash,
        algorithm: "HMAC-SHA256 / SECP256K1",
        verifiedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error("GET /api/passports/:id error:", err);
    return res.status(500).json({ error: "Failed to load passport" });
  }
});

export default router;

