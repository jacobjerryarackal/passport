import { NextResponse } from "next/server";
import prisma from "@/server/db/prisma";

export async function GET() {
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

    return NextResponse.json({ passports });
  } catch (err) {
    console.error("GET /api/passports error:", err);
    return NextResponse.json({ error: "Failed to fetch passports" }, { status: 500 });
  }
}

