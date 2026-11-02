import { NextRequest, NextResponse } from "next/server";
import { runPurchaseAgent } from "@/server/agents/purchase-agent";

export async function POST(req: NextRequest) {
  try {
    const { mandateId, userPrompt, forceBlockedScenario } = await req.json();

    if (!mandateId) {
      return NextResponse.json({ error: "mandateId is required" }, { status: 400 });
    }

    const result = await runPurchaseAgent({
      mandateId,
      userPrompt: userPrompt || "Select an appropriate purchase within authorized mandate",
      forceBlockedScenario: Boolean(forceBlockedScenario),
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("POST /api/purchases/propose error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

