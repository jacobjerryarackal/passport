import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prisma";
import { verifyPassportSignature } from "@/server/verification/hasher";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const passport = await prisma.trustPassport.findFirst({
      where: {
        OR: [{ id: params.id }, { passportNumber: params.id }],
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
      return NextResponse.json({ error: "Passport not found" }, { status: 404 });
    }

    const isSignatureValid = verifyPassportSignature(passport.passportHash, passport.signature);

    return NextResponse.json({
      passport,
      verification: {
        isSignatureValid,
        hash: passport.passportHash,
        algorithm: "HMAC-SHA256 / SECP256K1",
        verifiedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error("GET /api/passports/[id] error:", err);
    return NextResponse.json({ error: "Failed to load passport" }, { status: 500 });
  }
}

