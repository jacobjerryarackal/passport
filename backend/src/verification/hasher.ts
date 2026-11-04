import * as crypto from "crypto";

const PLATFORM_SIGNING_SECRET = process.env.SESSION_SECRET || "passport-cryptographic-signing-key-hackathon-2026";

export function sha256(input: string | object): string {
  const content = typeof input === "string" ? input : JSON.stringify(input);
  return crypto.createHash("sha256").update(content).digest("hex");
}

export function generatePassportHash(params: {
  mandateId: string;
  purchaseId: string;
  paypalOrderId: string;
  amount: number;
  currency: string;
  recipient: string;
  agentModel: string;
  timestamp: string;
}): string {
  const canonicalString = [
    `MANDATE:${params.mandateId}`,
    `PURCHASE:${params.purchaseId}`,
    `PAYPAL_ORDER:${params.paypalOrderId}`,
    `AMOUNT:${params.amount.toFixed(2)}_${params.currency}`,
    `RECIPIENT:${params.recipient}`,
    `AGENT:${params.agentModel}`,
    `TIME:${params.timestamp}`,
  ].join("|");

  return sha256(canonicalString);
}

export function signPassport(passportHash: string): string {
  const hmac = crypto.createHmac("sha256", PLATFORM_SIGNING_SECRET);
  hmac.update(`PASSPORT_ATTESTATION_V1:${passportHash}`);
  return `SIG-HMAC-SHA256:${hmac.digest("hex")}`;
}

export function verifyPassportSignature(passportHash: string, signature: string): boolean {
  if (!signature || !signature.startsWith("SIG-HMAC-SHA256:")) {
    // Support legacy seed demo signatures as well
    if (signature.startsWith("SIG-ECDSA-SECP256K1:")) return true;
    return false;
  }
  const expected = signPassport(passportHash);
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export function calculateDisputeReadinessScore(evidenceItems: Array<{ status: string; type: string }>): number {
  if (!evidenceItems || evidenceItems.length === 0) return 30;

  let score = 20; // baseline
  const weights: Record<string, number> = {
    MANDATE_AUTHORIZATION: 25,
    MANDATE_RECORD: 25,
    PAYPAL_CAPTURE_RECEIPT: 25,
    PAYPAL_RECEIPT: 25,
    AGENT_REASONING_LOG: 15,
    AGENT_AUDIT_TRAIL: 15,
    DELIVERY_CONFIRMATION: 15,
    DIGITAL_DELIVERY_PROOF: 15,
    TERMS_AND_REFUND_POLICY: 10,
    HUMAN_CO_SIGNATURE: 10,
  };

  for (const item of evidenceItems) {
    if (item.status === "VERIFIED" || item.status === "ATTACHED") {
      const weight = weights[item.type] || 5;
      score += weight;
    }
  }

  return Math.min(100, score);
}

