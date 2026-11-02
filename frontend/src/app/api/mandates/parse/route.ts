import { NextRequest, NextResponse } from "next/server";
import { parseNaturalLanguageMandate } from "@/server/agents/gemini";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "A natural language authorization prompt is required" }, { status: 400 });
    }

    const parsed = await parseNaturalLanguageMandate(prompt);
    return NextResponse.json({ parsed });
  } catch (err) {
    console.error("POST /api/mandates/parse error:", err);
    return NextResponse.json({ error: "Failed to parse mandate" }, { status: 500 });
  }
}

