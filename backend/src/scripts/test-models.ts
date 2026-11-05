import dotenv from "dotenv";
dotenv.config();

import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const primaryModel = process.env.GEMINI_PRIMARY_MODEL || "gemini-2.5-pro";
const fallbackModel = process.env.GEMINI_FALLBACK_MODEL || "gemini-2.0-flash";

async function testModel(genAI: GoogleGenerativeAI, modelName: string) {
  const startTime = Date.now();
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Respond with the single word: PONG");
    const responseText = result.response.text().trim();
    const durationMs = Date.now() - startTime;
    return {
      modelName,
      status: "SUCCESS",
      durationMs,
      response: responseText,
    };
  } catch (err: any) {
    const durationMs = Date.now() - startTime;
    return {
      modelName,
      status: "FAILED",
      durationMs,
      error: err?.message || String(err),
      statusCode: err?.status || err?.statusCode || "UNKNOWN",
    };
  }
}

async function main() {
  console.log("=================================================");
  console.log("   PASSPORT AI - GEMINI MODEL RESILIENCE CHECK   ");
  console.log("=================================================");
  console.log(`Primary Model:  ${primaryModel}`);
  console.log(`Fallback Model: ${fallbackModel}`);
  console.log(`API Key Configured: ${Boolean(apiKey && apiKey.trim() !== "")}`);
  console.log("-------------------------------------------------");

  if (!apiKey || apiKey.trim() === "") {
    console.warn("⚠️  GEMINI_API_KEY is not set. Systems run in high-fidelity deterministic simulation mode.");
    console.log("Primary Model:  SIMULATION READY (Deterministic template)");
    console.log("Fallback Model: SIMULATION READY (Deterministic template)");
    console.log("=================================================");
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  console.log(`Testing Primary Model: ${primaryModel}...`);
  const primaryResult = await testModel(genAI, primaryModel);
  console.log(`Result: ${primaryResult.status} (${primaryResult.durationMs}ms)`);
  if (primaryResult.status === "SUCCESS") {
    console.log(`Response: "${primaryResult.response}"`);
  } else {
    console.error(`Error: ${primaryResult.error}`);
  }

  console.log("-------------------------------------------------");
  console.log(`Testing Fallback Model: ${fallbackModel}...`);
  const fallbackResult = await testModel(genAI, fallbackModel);
  console.log(`Result: ${fallbackResult.status} (${fallbackResult.durationMs}ms)`);
  if (fallbackResult.status === "SUCCESS") {
    console.log(`Response: "${fallbackResult.response}"`);
  } else {
    console.error(`Error: ${fallbackResult.error}`);
  }

  console.log("=================================================");
  console.log("Summary Report:");
  console.log(`- Primary  (${primaryModel}):  ${primaryResult.status}`);
  console.log(`- Fallback (${fallbackModel}): ${fallbackResult.status}`);
  console.log("=================================================");
}

main().catch((err) => {
  console.error("Fatal error running test-models:", err);
  process.exit(1);
});

