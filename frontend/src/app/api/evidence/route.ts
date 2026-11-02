import { NextResponse } from "next/server";
import prisma from "@/server/db/prisma";

export async function GET() {
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

    return NextResponse.json({ evidenceItems: items });
  } catch (err) {
    console.error("GET /api/evidence error:", err);
    return NextResponse.json({ error: "Failed to fetch evidence items" }, { status: 500 });
  }
}

