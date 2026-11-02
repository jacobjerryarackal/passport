import { NextRequest, NextResponse } from "next/server";
import { runDisputeAutopsy } from "@/server/agents/dispute-agent";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await runDisputeAutopsy(params.id);
    return NextResponse.json(result);
  } catch (err) {
    console.error("POST /api/disputes/[id]/classify error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

