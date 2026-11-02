import { NextResponse } from "next/server";
import { getPayPalConfigInfo } from "@/server/paypal/client";
import { isGeminiConfigured } from "@/server/agents/gemini";

export async function GET() {
  const paypal = getPayPalConfigInfo();
  const geminiConfigured = isGeminiConfigured();

  return NextResponse.json({
    paypal,
    gemini: {
      configured: geminiConfigured,
      model: "gemini-1.5-pro",
    },
    demoMode: process.env.DEMO_MODE === "true" || !paypal.configured,
  });
}

