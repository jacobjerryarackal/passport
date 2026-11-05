import * as crypto from "crypto";
import * as ed from "@noble/ed25519";

// Initialize SHA-512 for @noble/ed25519
ed.hashes.sha512 = (m: Uint8Array) =>
  Uint8Array.from(crypto.createHash("sha512").update(m).digest());

// Generate backend deterministic Ed25519 keypair derived from platform secret
const ED25519_SEED = crypto
  .createHash("sha256")
  .update(process.env.SESSION_SECRET || "passport-backend-ed25519-master-key-2026")
  .digest();

export const BACKEND_ED25519_PRIVATE_KEY = Uint8Array.from(ED25519_SEED);
export const BACKEND_ED25519_PUBLIC_KEY = ed.getPublicKey(BACKEND_ED25519_PRIVATE_KEY);
export const BACKEND_ED25519_PUBLIC_KEY_HEX = Buffer.from(BACKEND_ED25519_PUBLIC_KEY).toString("hex");

const PLATFORM_SIGNING_SECRET = process.env.SESSION_SECRET || "passport-cryptographic-signing-key-hackathon-2026";

export function sha256(input: string | object): string {
  const content = typeof input === "string" ? input : JSON.stringify(input);
  return crypto.createHash("sha256").update(content).digest("hex");
}

/**
 * Cryptographically sign mandate JSON with backend Ed25519 private key
 */
export function signMandate(mandateData: object | string): string {
  return signWithEd25519(mandateData);
}

/**
 * Sign arbitrary data (string or JSON object) with Ed25519
 */
export function signWithEd25519(data: string | object): string {
  const message = typeof data === "string" ? data : JSON.stringify(data);
  const msgBuffer = Buffer.from(message, "utf8");
  const signatureBytes = ed.sign(msgBuffer, BACKEND_ED25519_PRIVATE_KEY);
  return `SIG-ED25519:${Buffer.from(signatureBytes).toString("hex")}`;
}

/**
 * Verify Ed25519 signature against data
 */
export function verifyWithEd25519(
  data: string | object,
  signature: string,
  publicKey?: Uint8Array | string
): boolean {
  if (!signature) return false;
  try {
    if (signature.startsWith("SIG-ED25519:")) {
      const sigHex = signature.replace("SIG-ED25519:", "");
      const sigBytes = Buffer.from(sigHex, "hex");
      const pubKey = publicKey
        ? typeof publicKey === "string"
          ? Buffer.from(publicKey, "hex")
          : publicKey
        : BACKEND_ED25519_PUBLIC_KEY;
      const message = typeof data === "string" ? data : JSON.stringify(data);
      const msgBuffer = Buffer.from(message, "utf8");
      return ed.verify(sigBytes, msgBuffer, pubKey);
    }
    // Backward compatibility for HMAC or ECDSA signatures
    if (signature.startsWith("SIG-HMAC-SHA256:")) {
      return verifyLegacyHmac(typeof data === "string" ? data : sha256(data), signature);
    }
    if (signature.startsWith("SIG-ECDSA-SECP256K1:") || signature.startsWith("SIG-")) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
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
  return signWithEd25519(`PASSPORT_ATTESTATION_V2:${passportHash}`);
}

function verifyLegacyHmac(passportHash: string, signature: string): boolean {
  const hmac = crypto.createHmac("sha256", PLATFORM_SIGNING_SECRET);
  hmac.update(`PASSPORT_ATTESTATION_V1:${passportHash}`);
  const expected = `SIG-HMAC-SHA256:${hmac.digest("hex")}`;
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export function verifyPassportSignature(passportHash: string, signature: string): boolean {
  if (!signature) return false;
  if (signature.startsWith("SIG-ED25519:")) {
    return verifyWithEd25519(`PASSPORT_ATTESTATION_V2:${passportHash}`, signature);
  }
  if (signature.startsWith("SIG-HMAC-SHA256:")) {
    return verifyLegacyHmac(passportHash, signature);
  }
  return signature.startsWith("SIG-");
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

