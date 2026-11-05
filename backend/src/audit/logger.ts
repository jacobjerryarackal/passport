import prisma from "../db/prisma";
import { sha256 } from "../verification/hasher";

export type AuditAction =
  | "MANDATE_CREATED"
  | "MANDATE_UPDATED"
  | "MANDATE_REVOKED"
  | "PURCHASE_PROPOSED"
  | "VALIDATION_PASSED"
  | "VALIDATION_BLOCKED"
  | "STEP_UP_APPROVED"
  | "PAYPAL_ORDER_CREATED"
  | "PAYPAL_ORDER_CAPTURED"
  | "PASSPORT_ISSUED"
  | "DISPUTE_RECEIVED"
  | "DISPUTE_CLASSIFIED"
  | "EVIDENCE_GATHERED"
  | "RESPONSE_DRAFTED"
  | "HUMAN_COSIGNED"
  | "DISPUTE_SUBMITTED"
  | "LLM_FALLBACK_ACTIVATED"
  | "MERCHANT_CHECKOUT_ACCEPTED"
  | "MERCHANT_CHECKOUT_REJECTED";

export type AuditActor =
  | "HUMAN_ADMIN"
  | "ACCOUNT_OWNER"
  | "PURCHASE_AGENT"
  | "SYSTEM_VALIDATOR"
  | "PAYPAL_API"
  | "PAYPAL_WEBHOOK"
  | "DISPUTE_AGENT"
  | "MERCHANT_PORTAL";

export async function logAuditEvent(params: {
  mandateId?: string;
  action: AuditAction;
  actor: AuditActor;
  actorModel?: string;
  details: Record<string, unknown> | string;
  simulated?: boolean;
}) {
  try {
    // Find latest audit log to establish Merkle parent link
    const latestLog = await prisma.auditLog.findFirst({
      orderBy: { timestamp: "desc" },
      select: { eventHash: true },
    });

    const parentHash =
      latestLog?.eventHash || "0000000000000000000000000000000000000000000000000000000000000000";

    const timestamp = new Date();
    const detailsStr = typeof params.details === "string" ? params.details : JSON.stringify(params.details);

    const eventHash = sha256(
      JSON.stringify({
        parentHash,
        action: params.action,
        actor: params.actor,
        actorModel: params.actorModel || "system",
        mandateId: params.mandateId || null,
        details: detailsStr,
        timestamp: timestamp.toISOString(),
      })
    );

    const record = await prisma.auditLog.create({
      data: {
        mandateId: params.mandateId,
        action: params.action,
        actor: params.actor,
        actorModel: params.actorModel || "system",
        details: detailsStr,
        eventHash,
        parentHash,
        simulated: Boolean(params.simulated),
        timestamp,
      },
    });

    return record;
  } catch (err) {
    console.error("Failed to append audit log:", err);
    return null;
  }
}

