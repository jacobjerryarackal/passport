import prisma from "@/server/db/prisma";
import { sha256 } from "@/server/verification/hasher";

export type AuditAction =
  | "MANDATE_CREATED"
  | "MANDATE_UPDATED"
  | "MANDATE_REVOKED"
  | "PURCHASE_PROPOSED"
  | "VALIDATION_PASSED"
  | "VALIDATION_BLOCKED"
  | "PAYPAL_ORDER_CREATED"
  | "PAYPAL_ORDER_CAPTURED"
  | "PASSPORT_ISSUED"
  | "DISPUTE_RECEIVED"
  | "DISPUTE_CLASSIFIED"
  | "EVIDENCE_GATHERED"
  | "RESPONSE_DRAFTED"
  | "HUMAN_COSIGNED"
  | "DISPUTE_SUBMITTED";

export type AuditActor =
  | "HUMAN_ADMIN"
  | "PURCHASE_AGENT"
  | "SYSTEM_VALIDATOR"
  | "PAYPAL_API"
  | "PAYPAL_WEBHOOK"
  | "DISPUTE_AGENT";

export async function logAuditEvent(params: {
  mandateId?: string;
  action: AuditAction;
  actor: AuditActor;
  actorModel?: string;
  details: Record<string, unknown> | string;
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
        timestamp,
      },
    });

    return record;
  } catch (err) {
    console.error("Failed to append audit log:", err);
    return null;
  }
}

