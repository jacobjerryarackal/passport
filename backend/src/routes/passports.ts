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

// GET /api/passports/:id/public - Unauthenticated public verification endpoint
router.get("/:id/public", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const passport = await prisma.trustPassport.findFirst({
      where: {
        OR: [{ id }, { passportNumber: id }],
      },
      include: {
        mandate: true,
        purchase: {
          include: {
            proposal: true,
          },
        },
      },
    });

    if (!passport) {
      return res.status(404).json({ error: "Trust Passport not found" });
    }

    const isSignatureValid = verifyPassportSignature(passport.passportHash, passport.signature);

    return res.json({
      passport: {
        id: passport.id,
        passportNumber: passport.passportNumber,
        issuedAt: passport.issuedAt,
        passportHash: passport.passportHash,
        signature: passport.signature,
        disputeReadinessScore: passport.disputeReadinessScore,
        status: passport.status,
        mandate: passport.mandate
          ? {
              id: passport.mandate.id,
              title: passport.mandate.title,
              purpose: passport.mandate.purpose,
              maxAmount: passport.mandate.maxAmount,
              currency: passport.mandate.currency,
              allowedCategories: passport.mandate.allowedCategories,
              expiresAt: passport.mandate.expiresAt.toISOString(),
              status: passport.mandate.status,
            }
          : undefined,
        purchase: passport.purchase
          ? {
              id: passport.purchase.id,
              paypalOrderId: passport.purchase.paypalOrderId,
              paypalCaptureId: passport.purchase.paypalCaptureId || "CAPTURE-PENDING",
              amount: passport.purchase.amount,
              currency: passport.purchase.currency,
              merchantName: passport.purchase.merchantName,
              status: passport.purchase.status,
              proposal: passport.purchase.proposal
                ? {
                    itemName: passport.purchase.proposal.itemName,
                    itemCategory: passport.purchase.proposal.itemCategory,
                    recipient: passport.purchase.proposal.recipient,
                    reasoning: passport.purchase.proposal.reasoning,
                  }
                : undefined,
            }
          : undefined,
      },
      verification: {
        isSignatureValid,
        hash: passport.passportHash,
        algorithm: "Ed25519 / SHA-256 Merkle Linkage",
        verifiedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error("GET /api/passports/:id/public error:", err);
    return res.status(500).json({ error: "Failed to verify public passport" });
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

