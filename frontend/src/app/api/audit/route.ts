import { NextResponse } from "next/server";
import prisma from "@/server/db/prisma";
import { sha256 } from "@/server/verification/hasher";

export async function GET() {
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

    return NextResponse.json({
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
    return NextResponse.json({ error: "Failed to fetch audit log" }, { status: 500 });
  }
}

