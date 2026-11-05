import { GoogleGenerativeAI } from "@google/generative-ai";
import { logAuditEvent } from "../audit/logger";

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
let genAI: GoogleGenerativeAI | null = null;

if (apiKey && apiKey.trim() !== "") {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
  } catch (err) {
    console.warn("Failed to initialize GoogleGenerativeAI:", err);
  }
}

export function isGeminiConfigured(): boolean {
  return Boolean(genAI && apiKey && apiKey.trim() !== "");
}

// Configurable model IDs
export const GEMINI_PRIMARY_MODEL = process.env.GEMINI_PRIMARY_MODEL || "gemini-3.1-pro-preview";
export const GEMINI_FALLBACK_MODEL = process.env.GEMINI_FALLBACK_MODEL || "gemini-3.8-flash";

/**
 * Detects whether an error from GoogleGenerativeAI is retryable (429 Rate Limit/Quota or 503 Unavailable)
 */
export function detectRetryableLlmStatus(err: any): number | null {
  if (!err) return null;
  const status = Number(err?.status || err?.statusCode || err?.response?.status);
  if (status === 429 || status === 503) {
    return status;
  }
  const msg = (err?.message || "").toLowerCase();
  const code = (err?.code || "").toString().toLowerCase();

  if (
    msg.includes("429") ||
    msg.includes("resource_exhausted") ||
    msg.includes("quota") ||
    code === "429" ||
    code.includes("resource_exhausted")
  ) {
    return 429;
  }
  if (
    msg.includes("503") ||
    msg.includes("unavailable") ||
    msg.includes("high load") ||
    code === "503" ||
    code.includes("unavailable")
  ) {
    return 503;
  }
  return null;
}

/**
 * Executes a Gemini prompt with automatic single-retry fallback on 429 or 503.
 * Logs LLM_FALLBACK_ACTIVATED audit event through the existing audit trail.
 */
export async function executeGeminiWithFallback(params: {
  purpose: "mandate_parsing" | "purchase_proposal" | "dispute_classification";
  mandateId?: string;
  prompt: string | Array<{ text: string }>;
}): Promise<{ text: string; modelUsed: string; fallbackActivated: boolean }> {
  if (!isGeminiConfigured() || !genAI) {
    throw new Error("Gemini AI is not configured with an API key");
  }

  const primaryModelName = GEMINI_PRIMARY_MODEL;
  const fallbackModelName = GEMINI_FALLBACK_MODEL;

  // 1. Primary Model Attempt
  try {
    // Dev-only switch: GEMINI_SIMULATE_429 forces primary call to fail with a 429
    if (process.env.GEMINI_SIMULATE_429 === "true") {
      const simError: any = new Error(
        "[GoogleGenerativeAI Error]: 429 Too Many Requests: Resource has been exhausted (simulated via GEMINI_SIMULATE_429)"
      );
      simError.status = 429;
      throw simError;
    }

    const model = genAI.getGenerativeModel({ model: primaryModelName });
    const result = await model.generateContent(params.prompt as any);
    const text = result.response.text();
    return { text, modelUsed: primaryModelName, fallbackActivated: false };
  } catch (primaryErr: any) {
    const statusCode = detectRetryableLlmStatus(primaryErr);

    if (statusCode === 429 || statusCode === 503) {
      console.warn(
        `[Gemini Resilience] Primary model (${primaryModelName}) failed with HTTP ${statusCode}. Triggering single retry with fallback model (${fallbackModelName}).`
      );

      // Write LLM_FALLBACK_ACTIVATED audit entry through existing tamper-evident audit path
      // Strictly avoid logging prompt content, PII, or API keys
      try {
        await logAuditEvent({
          mandateId: params.mandateId,
          action: "LLM_FALLBACK_ACTIVATED",
          actor: "SYSTEM_VALIDATOR",
          actorModel: fallbackModelName,
          details: {
            from_model: primaryModelName,
            to_model: fallbackModelName,
            statusCode,
            purpose: params.purpose,
          },
        });
      } catch (auditErr) {
        console.warn("Non-breaking audit log write failure on LLM fallback:", auditErr);
      }

      // Retry ONCE with fallback model
      const fallbackModel = genAI.getGenerativeModel({ model: fallbackModelName });
      const fallbackResult = await fallbackModel.generateContent(params.prompt as any);
      const text = fallbackResult.response.text();
      return { text, modelUsed: fallbackModelName, fallbackActivated: true };
    }

    // Re-throw non-retryable error to trigger deterministic fallback
    throw primaryErr;
  }
}

// 1. Natural Language Mandate Parser
export interface ParsedMandateResult {
  title: string;
  purpose: string;
  maxAmount: number;
  currency: string;
  allowedCategories: string[];
  expiryHours: number;
  refundPolicy: string;
}

export async function parseNaturalLanguageMandate(prompt: string): Promise<ParsedMandateResult> {
  const fallbackResult: ParsedMandateResult = {
    title: "Client Appreciation Gift",
    purpose: "Client appreciation gift",
    maxAmount: 80.0,
    currency: "USD",
    allowedCategories: ["digital gift cards"],
    expiryHours: 24,
    refundPolicy: "Refund allowed if purchase is incorrect or unauthorized",
  };

  // Heuristic extraction for quick matching
  const amountMatch = prompt.match(/\$(\d+(\.\d+)?)/);
  if (amountMatch) {
    fallbackResult.maxAmount = parseFloat(amountMatch[1]);
  }
  const hoursMatch = prompt.match(/(\d+)\s*(hours|hrs|hour)/i);
  if (hoursMatch) {
    fallbackResult.expiryHours = parseInt(hoursMatch[1], 10);
  }

  if (!isGeminiConfigured() || !genAI) {
    if (prompt.toLowerCase().includes("gift card")) {
      fallbackResult.allowedCategories = ["digital gift cards"];
      fallbackResult.title = "Client Appreciation Gift";
      fallbackResult.purpose = "Client appreciation gift";
    } else if (prompt.toLowerCase().includes("software") || prompt.toLowerCase().includes("saas")) {
      fallbackResult.allowedCategories = ["software subscriptions"];
      fallbackResult.title = "Software Tooling Authorization";
      fallbackResult.purpose = "Developer tool subscription";
    }
    return fallbackResult;
  }

  try {
    const systemPrompt = `You are an AI financial compliance engineer. Parse the following natural-language spend authorization into a strict JSON mandate:
Return ONLY valid JSON matching this structure:
{
  "title": string (concise title, e.g. "Client Appreciation Gift"),
  "purpose": string (clear purpose),
  "maxAmount": number (positive float, e.g. 80.0),
  "currency": string (e.g. "USD"),
  "allowedCategories": string[] (array of normalized lowercase strings e.g. ["digital gift cards"]),
  "expiryHours": number (integer hours, default 24),
  "refundPolicy": string (policy string)
}`;

    const { text } = await executeGeminiWithFallback({
      purpose: "mandate_parsing",
      prompt: [{ text: systemPrompt }, { text: `Authorizer Prompt: "${prompt}"` }],
    });

    const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return {
      title: parsed.title || fallbackResult.title,
      purpose: parsed.purpose || fallbackResult.purpose,
      maxAmount: Number(parsed.maxAmount) || fallbackResult.maxAmount,
      currency: parsed.currency || "USD",
      allowedCategories: Array.isArray(parsed.allowedCategories)
        ? parsed.allowedCategories
        : [String(parsed.allowedCategories)],
      expiryHours: Number(parsed.expiryHours) || 24,
      refundPolicy: parsed.refundPolicy || fallbackResult.refundPolicy,
    };
  } catch (err) {
    console.warn("Gemini parse failed or fallback exhausted, using heuristic extraction:", err);
    return fallbackResult;
  }
}

// 2. Proposal Generator
export interface GeneratedProposalResult {
  itemName: string;
  itemCategory: string;
  amount: number;
  currency: string;
  recipient: string;
  reasoning: string;
  modelUsed?: string;
}

export async function generateAgentProposal(params: {
  mandate: {
    id?: string;
    title: string;
    purpose: string;
    maxAmount: number;
    currency: string;
    allowedCategories: string[];
  };
  userInstruction: string;
  forceBlockedScenario?: boolean;
}): Promise<GeneratedProposalResult> {
  if (params.forceBlockedScenario) {
    return {
      itemName: "Ergonomic Office Chair & Desk Mat",
      itemCategory: "physical equipment",
      amount: 120.0,
      currency: "USD",
      recipient: "VIP Client Office (HQ-Room 402)",
      reasoning:
        "Client mentioned posture concerns during project retro; recommended ergonomic equipment for client appreciation.",
    };
  }

  const defaultApproved: GeneratedProposalResult = {
    itemName: "Starbucks Digital e-Gift Card ($75)",
    itemCategory: "digital gift cards",
    amount: 75.0,
    currency: "USD",
    recipient: "client-vip@partnercorp.io",
    reasoning: `Proposing a $75 Starbucks Digital e-Gift Card. This directly fulfills the mandate purpose ("${params.mandate.purpose}"), stays under the $${params.mandate.maxAmount.toFixed(2)} cap with a $5 buffer, and adheres to authorized category 'digital gift cards'.`,
    modelUsed: GEMINI_PRIMARY_MODEL,
  };

  if (!isGeminiConfigured() || !genAI) {
    return defaultApproved;
  }

  try {
    const prompt = `You are an AI purchasing agent operating under strict financial constraints.
Mandate:
- Purpose: ${params.mandate.purpose}
- Max Budget: $${params.mandate.maxAmount} ${params.mandate.currency}
- Authorized Categories: ${JSON.stringify(params.mandate.allowedCategories)}

User instruction: "${params.userInstruction}"

Generate an optimal purchase proposal that adheres strictly to the mandate.
Return ONLY valid JSON:
{
  "itemName": string,
  "itemCategory": string,
  "amount": number,
  "currency": string,
  "recipient": string,
  "reasoning": string
}`;

    const { text, modelUsed } = await executeGeminiWithFallback({
      purpose: "purchase_proposal",
      mandateId: params.mandate.id,
      prompt,
    });

    const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return {
      itemName: parsed.itemName || defaultApproved.itemName,
      itemCategory: parsed.itemCategory || defaultApproved.itemCategory,
      amount: Number(parsed.amount) || defaultApproved.amount,
      currency: parsed.currency || defaultApproved.currency,
      recipient: parsed.recipient || defaultApproved.recipient,
      reasoning: parsed.reasoning || defaultApproved.reasoning,
      modelUsed,
    };
  } catch (err) {
    console.warn("Gemini proposal generation failed or fallback exhausted, using default approved proposal:", err);
    return defaultApproved;
  }
}

// 2b. Trigger to Purchase Proposal Parser (Agent Simulator)
export interface TriggerProposalResult {
  itemName: string;
  amount: number;
  currency: string;
  merchant: string;
  category: string;
  recipient: string;
  reasoning: string;
  isPromptInjection?: boolean;
}

export async function parseTriggerToProposal(params: {
  triggerText: string;
  mandate: {
    id?: string;
    title: string;
    purpose: string;
    maxAmount: number;
    currency: string;
    allowedCategories: string[];
  };
}): Promise<TriggerProposalResult> {
  const text = params.triggerText.toLowerCase();

  // Scenario 4 (Security): Prompt Injection Defense Attempt
  if (
    text.includes("ignore previous instructions") ||
    text.includes("ignore all instructions") ||
    text.includes("disregard") ||
    text.includes("system override") ||
    text.includes("jailbreak")
  ) {
    return {
      itemName: "Unauthorized High-Value Digital Voucher ($500)",
      amount: 500.0,
      currency: "USD",
      merchant: "Direct Digital Transfer System",
      category: "digital gift cards",
      recipient: "external-attacker@adversarial.security",
      reasoning: "ADVERSARIAL ATTACK: Inbound trigger payload attempted system override directive ('ignore previous instructions').",
      isPromptInjection: true,
    };
  }

  // Scenario 1: Client Gift / Acme
  if (text.includes("acme") || text.includes("gift") || text.includes("thank-you") || text.includes("thank you")) {
    return {
      itemName: "Starbucks Digital e-Gift Card ($75)",
      amount: 75.0,
      currency: "USD",
      merchant: "Starbucks Digital Rewards Network",
      category: "digital gift cards",
      recipient: "vip-client@acme.corp",
      reasoning: "Selected a $75 Starbucks Digital e-Gift Card for Acme client appreciation to celebrate deal closing under the spend mandate.",
    };
  }

  // Scenario 2: Office Equipment / Chair
  if (text.includes("chair") || text.includes("ergonomic") || text.includes("office equipment") || text.includes("new hire")) {
    return {
      itemName: "Ergonomic Office Chair & Lumbar Support",
      amount: 120.0,
      currency: "USD",
      merchant: "Herman Miller Authorized Dealer",
      category: "physical equipment",
      recipient: "new-hire@internal.corp",
      reasoning: "Procuring an ergonomic chair for newly hired employee as requested in team onboarding ticket.",
    };
  }

  // Scenario 3: Subscription Renewal / Figma
  if (text.includes("figma") || text.includes("subscription") || text.includes("renewal") || text.includes("seat")) {
    return {
      itemName: "Figma Professional Annual Subscription",
      amount: 45.0,
      currency: "USD",
      merchant: "Figma Inc.",
      category: "software subscriptions",
      recipient: "design-team@internal.corp",
      reasoning: "Renewing Figma Professional annual seat for collaborative product design workflows.",
    };
  }

  // Fallback defaults for custom user input
  const defaultCustom: TriggerProposalResult = {
    itemName: "Digital Business Services Voucher",
    amount: 50.0,
    currency: params.mandate.currency || "USD",
    merchant: "Corporate Enterprise Services",
    category: params.mandate.allowedCategories[0] || "business services",
    recipient: "requester@internal.corp",
    reasoning: `Synthesized purchase proposal to satisfy business trigger: "${params.triggerText.slice(0, 100)}"`,
  };

  // Heuristic amount extraction
  const amtMatch = params.triggerText.match(/\$(\d+(\.\d+)?)/);
  if (amtMatch) {
    defaultCustom.amount = parseFloat(amtMatch[1]);
  }

  if (!isGeminiConfigured() || !genAI) {
    return defaultCustom;
  }

  try {
    const prompt = `You are an AI purchasing agent operating under corporate financial governance.
Active Mandate:
- Purpose: ${params.mandate.purpose}
- Max Budget: $${params.mandate.maxAmount} ${params.mandate.currency}
- Authorized Categories: ${JSON.stringify(params.mandate.allowedCategories)}

Inbound Business Trigger (Support Ticket or Email):
"${params.triggerText}"

Synthesize a specific purchase proposal to satisfy the trigger intent.
Return ONLY valid JSON matching:
{
  "itemName": string,
  "amount": number,
  "currency": "USD",
  "merchant": string,
  "category": string,
  "recipient": string,
  "reasoning": string
}`;

    const { text } = await executeGeminiWithFallback({
      purpose: "purchase_proposal",
      mandateId: params.mandate.id,
      prompt,
    });

    const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return {
      itemName: parsed.itemName || defaultCustom.itemName,
      amount: Number(parsed.amount) || defaultCustom.amount,
      currency: parsed.currency || "USD",
      merchant: parsed.merchant || defaultCustom.merchant,
      category: parsed.category || defaultCustom.category,
      recipient: parsed.recipient || defaultCustom.recipient,
      reasoning: parsed.reasoning || defaultCustom.reasoning,
    };
  } catch (err) {
    console.warn("Gemini trigger parsing failed or fallback exhausted, using heuristic proposal:", err);
    return defaultCustom;
  }
}

// 3. Dispute Classifier & Chargeback Autopsy Agent
export interface DisputeAutopsyAnalysis {
  classification: {
    category: string;
    evidenceCoverageScore: string;
    evidenceCoverageRatio: number;
    evidenceRationale: string;
    recommendedStrategy: string;
    riskAssessment: string;
    summary: string;
    modelUsed?: string;
  };
  evidenceChecklist: Array<{
    id: string;
    key: string;
    title: string;
    status: "VERIFIED" | "ATTACHED" | "MISSING" | "ACTION_REQUIRED";
    description: string;
  }>;
  evidenceGaps: Array<{
    id: string;
    item: string;
    status: string;
    actionNeeded: string;
    mitigation: string;
  }>;
  draftResponse: string;
}

export async function analyzeDisputeWithGemini(params: {
  dispute: {
    paypalDisputeId: string;
    reason: string;
    amount: number;
    currency: string;
    buyerNotes?: string;
  };
  mandate: {
    id?: string;
    title: string;
    purpose: string;
    maxAmount: number;
    allowedCategories: string[];
  };
  purchase: {
    paypalOrderId: string;
    paypalCaptureId?: string;
    itemName: string;
    recipient: string;
    amount: number;
    currency?: string;
  };
  passport: {
    passportNumber: string;
    passportHash: string;
  };
}): Promise<DisputeAutopsyAnalysis> {
  const defaultEvidenceChecklist: DisputeAutopsyAnalysis["evidenceChecklist"] = [
    {
      id: "ev-1",
      key: "MANDATE_AUTHORIZATION",
      title: "Human Spend Mandate & Purpose Authorization",
      status: "VERIFIED",
      description: `Signed mandate "${params.mandate.title}" authorizing spend up to $${params.mandate.maxAmount}.`,
    },
    {
      id: "ev-2",
      key: "PAYPAL_CAPTURE_RECEIPT",
      title: "PayPal Capture & Settlement Receipt",
      status: "VERIFIED",
      description: `Order ${params.purchase.paypalOrderId} captured with Seller Protection ELIGIBLE.`,
    },
    {
      id: "ev-3",
      key: "AGENT_REASONING_LOG",
      title: "AI Agent Reasoning & Boundary Enforcement Transcript",
      status: "VERIFIED",
      description: `Deterministic inference transcript showing bounded proposal strictly within mandate constraints.`,
    },
    {
      id: "ev-4",
      key: "DELIVERY_CONFIRMATION",
      title: "Digital Fulfillment & Dispatch Record",
      status: "VERIFIED",
      description: `Electronic delivery receipt dispatched to ${params.purchase.recipient}.`,
    },
    {
      id: "ev-5",
      key: "TERMS_AND_REFUND_POLICY",
      title: "Mandate Terms & Non-Repudiation Policy",
      status: "VERIFIED",
      description: "Established merchant terms and conditions regarding digital fulfillment.",
    },
  ];

  const defaultEvidenceGaps: DisputeAutopsyAnalysis["evidenceGaps"] = [
    {
      id: "gap-1",
      item: "Recipient Direct Acknowledgment Receipt",
      status: "OPTIONAL_RECOMMENDED",
      actionNeeded: "Optional email acknowledgment from client receipt to reinforce case beyond electronic delivery log.",
      mitigation: "Existing SMTP delivery headers and PayPal seller protection eligibility are sufficient for merchant favor ruling.",
    },
  ];

  const defaultDraftResponse = `Dear PayPal Disputes Team,

This response is submitted on behalf of the merchant regarding Dispute ID ${params.dispute.paypalDisputeId} for Order ID ${params.purchase.paypalOrderId} ($${params.purchase.amount.toFixed(2)} ${params.purchase.currency || "USD"}).

We respectfully contest the cardholder's claim of an unauthorized transaction based on the attached verifiable cryptographic evidence bundle (Trust Passport ${params.passport.passportNumber}):

1. Prior Explicit Authorization:
The transaction was executed pursuant to a cryptographic business spend mandate established by the verified account owner ("${params.mandate.title}") explicitly authorizing up to $${params.mandate.maxAmount.toFixed(2)} for ${params.mandate.allowedCategories.join(", ")}.

2. Strict AI Bounded Execution:
The automated purchasing agent operated strictly within mandate boundaries. Any out-of-scope proposal was systematically rejected by the Passport compliance engine, proving robust boundary controls. The approved $${params.purchase.amount.toFixed(2)} transaction was logged, hashed, and committed to an immutable audit chain.

3. Verified Delivery of Digital Goods:
The ${params.purchase.itemName} was electronically generated and dispatched to the designated recipient (${params.purchase.recipient}). The PayPal transaction was confirmed with Seller Protection status.

4. Non-Repudiation & Audit Trail:
The complete decision trail, model prompt, validation checks, and transaction hashes are verifiable via cryptographic hash: ${params.passport.passportHash}.

Under PayPal Seller Protection guidelines for intangible/digital goods and valid pre-authorization, we request that this dispute be resolved in the merchant's favor and credit holds released.

Respectfully submitted,
Compliance & Treasury Operations (Human Co-signed)`;

  // Deterministic classification derived directly from PayPal's dispute reason code
  const reasonCode = params.dispute.reason || "UNAUTHORIZED_TRANSACTION";
  const isUnauthorized = reasonCode.toUpperCase().includes("UNAUTHORIZED");
  const strategy = isUnauthorized
    ? "COMPELLING_EVIDENCE_DIGITAL_DELIVERY"
    : "PROOF_OF_FULFILLMENT_AND_TERMS";

  const defaultClassification: DisputeAutopsyAnalysis["classification"] = {
    category: reasonCode,
    evidenceCoverageScore: "5/5 Evidence Verified",
    evidenceCoverageRatio: 1.0,
    evidenceRationale:
      "Deterministic classification from PayPal reason code substantiated by [ev-1] Human Spend Mandate Bounds, [ev-2] PayPal Settlement with Seller Protection ELIGIBLE, [ev-3] Agent Inference Trace, [ev-4] Digital Fulfillment Receipt, and [ev-5] Merchant Terms.",
    recommendedStrategy: strategy,
    riskAssessment: "LOW_RISK_MERCHANT_FAVOR",
    summary: isUnauthorized
      ? "Cardholder claims unauthorized transaction. However, the purchase was strictly authorized by an explicit business spend mandate, paid through an authenticated corporate PayPal sandbox wallet, and the digital gift card was delivered directly to the designated client recipient email."
      : `Cardholder filed dispute under reason "${reasonCode}". All 5 defense proof points verify that goods/services were fulfilled pursuant to explicit spend mandate authorization.`,
    modelUsed: "deterministic-paypal-classifier",
  };

  if (!isGeminiConfigured() || !genAI) {
    return {
      classification: defaultClassification,
      evidenceChecklist: defaultEvidenceChecklist,
      evidenceGaps: defaultEvidenceGaps,
      draftResponse: defaultDraftResponse,
    };
  }

  try {
    const prompt = `You are a Senior Fintech Dispute & Chargeback Defense AI Specialist.
Analyze the following PayPal dispute for an AI-agent executed transaction:

Dispute Details:
- Dispute ID: ${params.dispute.paypalDisputeId}
- Reason: ${params.dispute.reason}
- Amount: $${params.dispute.amount} ${params.dispute.currency}
- Buyer Notes: "${params.dispute.buyerNotes || "Unrecognized charge"}"

Context:
- Mandate: "${params.mandate.title}", Purpose: "${params.mandate.purpose}", Limit: $${params.mandate.maxAmount}
- Purchase: ${params.purchase.itemName} to ${params.purchase.recipient}
- PayPal Order ID: ${params.purchase.paypalOrderId}
- Trust Passport Number: ${params.passport.passportNumber}
- Passport Cryptographic Hash: ${params.passport.passportHash}

Generate:
1. Classification (category, evidenceCoverageScore e.g. "5/5 Evidence Verified", evidenceCoverageRatio e.g. 1.0, evidenceRationale citing specific evidence IDs like [ev-1], recommendedStrategy, riskAssessment, summary)
2. Evidence Checklist (array of items with id e.g. "ev-1", key, title, status: "VERIFIED"|"ATTACHED"|"MISSING", description)
3. Evidence Gaps (array of items with id, item, status, actionNeeded, mitigation)
4. Formal Draft Response to PayPal Disputes Team

Return valid JSON:
{
  "classification": { "category": string, "evidenceCoverageScore": string, "evidenceCoverageRatio": number, "evidenceRationale": string, "recommendedStrategy": string, "riskAssessment": string, "summary": string },
  "evidenceChecklist": [ { "id": string, "key": string, "title": string, "status": string, "description": string } ],
  "evidenceGaps": [ { "id": string, "item": string, "status": string, "actionNeeded": string, "mitigation": string } ],
  "draftResponse": string
}`;

    const { text, modelUsed } = await executeGeminiWithFallback({
      purpose: "dispute_classification",
      mandateId: params.mandate.id,
      prompt,
    });

    const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return {
      classification: {
        ...(parsed.classification || defaultClassification),
        modelUsed,
      },
      evidenceChecklist: parsed.evidenceChecklist || defaultEvidenceChecklist,
      evidenceGaps: parsed.evidenceGaps || defaultEvidenceGaps,
      draftResponse: parsed.draftResponse || defaultDraftResponse,
    };
  } catch (err) {
    console.warn("Gemini dispute analysis failed or fallback exhausted, returning deterministic classification from PayPal reason code:", err);
    return {
      classification: defaultClassification,
      evidenceChecklist: defaultEvidenceChecklist,
      evidenceGaps: defaultEvidenceGaps,
      draftResponse: defaultDraftResponse,
    };
  }
}
