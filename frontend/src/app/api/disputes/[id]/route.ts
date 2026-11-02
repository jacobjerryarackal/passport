import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const dispute = await prisma.dispute.findFirst({
      where: {
        OR: [{ id: params.id }, { paypalDisputeId: params.id }],
      },
      include: {
        evidenceItems: true,
        passport: true,
        purchase: {
          include: {
            mandate: {
              include: {
                auditLogs: { orderBy: { timestamp: "asc" } },
              },
            },
            proposal: true,
          },
        },
      },
    });

    if (!dispute) {
      return NextResponse.json({ error: "Dispute not found" }, { status: 404 });
    }

    return NextResponse.json({ dispute });
  } catch (err) {
    console.error("GET /api/disputes/[id] error:", err);
    return NextResponse.json({ error: "Failed to load dispute" }, { status: 500 });
  }
}

