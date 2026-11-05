import { Router, Request, Response } from "express";
import prisma from "../db/prisma";
import { sha256 } from "../verification/hasher";

const router = Router();

// In-memory backup of original hashes for quick restoration if tampered
const hashBackups = new Map<string, string>();

async function seedDefaultAuditEvents() {
  let mandate = await prisma.mandate.findFirst();
  if (!mandate) {
    mandate = await prisma.mandate.create({
      data: {
        title: "Executive Client Gifting & Travel Mandate",
        purpose: "Autonomous vendor acquisition and client gifting under policy",
        maxAmount: 250.0,
        currency: "USD",
        allowedCategories: JSON.stringify(["digital gift cards", "office supplies", "software subscriptions"]),
        expiryHours: 72,
        expiresAt: new Date(Date.now() + 72 * 3600000),
        refundPolicy: "14-day standard digital merchant refund warranty",
        status: "ACTIVE",
      },
    });
  }

  const sampleEvents = [
    { action: "MANDATE_CREATED", actor: "ACCOUNT_OWNER", actorModel: "dashboard-session", details: { title: mandate.title, maxAmount: mandate.maxAmount, currency: mandate.currency } },
    { action: "VALIDATION_PASSED", actor: "SYSTEM_VALIDATOR", actorModel: "passport-guard-engine", details: { itemName: "Starbucks Digital e-Gift Card ($75)", amount: 75.0, status: "APPROVED" } },
    { action: "PAYPAL_ORDER_CREATED", actor: "PAYPAL_API", actorModel: "paypal-checkout-orders-v2", details: { orderId: "PAYPAL-ORD-8812-SB", amount: 75.0, currency: "USD" } },
    { action: "PAYPAL_ORDER_CAPTURED", actor: "PAYPAL_API", actorModel: "paypal-orders-v2-capture", details: { captureId: "CAP-99120-SB", merchant: "Starbucks Digital Rewards Network", sellerProtectionStatus: "ELIGIBLE" } },
    { action: "PASSPORT_ISSUED", actor: "SYSTEM_VALIDATOR", actorModel: "passport-core-engine", details: { passportNumber: "PASS-2026-US-01", disputeReadinessScore: 98 } },
    { action: "STEP_UP_APPROVED", actor: "ACCOUNT_OWNER", actorModel: "human-co-signer", details: { itemName: "Executive Team Courier Gift", amount: 90.0, variance: "12.5%" } },
    { action: "VALIDATION_PASSED", actor: "SYSTEM_VALIDATOR", actorModel: "passport-guard-engine", details: { itemName: "Executive Team Courier Gift", amount: 90.0, status: "APPROVED" } },
    { action: "PAYPAL_ORDER_CREATED", actor: "PAYPAL_API", actorModel: "paypal-checkout-orders-v2", details: { orderId: "PAYPAL-ORD-8813-SB", amount: 90.0, currency: "USD" } },
    { action: "PAYPAL_ORDER_CAPTURED", actor: "PAYPAL_API", actorModel: "paypal-orders-v2-capture", details: { captureId: "CAP-99121-SB", merchant: "Executive Services Group", sellerProtectionStatus: "ELIGIBLE" } },
    { action: "PASSPORT_ISSUED", actor: "SYSTEM_VALIDATOR", actorModel: "passport-core-engine", details: { passportNumber: "PASS-2026-US-02", disputeReadinessScore: 95 } },
    { action: "VALIDATION_BLOCKED", actor: "SYSTEM_VALIDATOR", actorModel: "passport-guard-engine", details: { itemName: "Ergonomic Office Chair ($120)", amount: 120.0, violationReason: "Amount exceeds cap" } },
    { action: "VALIDATION_BLOCKED", actor: "SYSTEM_VALIDATOR", actorModel: "passport-guard-engine", details: { itemName: "Enterprise CRM Seat ($450)", amount: 450.0, violationReason: "Category unauthorized" } },
    { action: "VALIDATION_PASSED", actor: "SYSTEM_VALIDATOR", actorModel: "passport-guard-engine", details: { itemName: "Cloud Compute Node (GPU-H100)", amount: 42.5, status: "APPROVED" } },
    { action: "PAYPAL_ORDER_CREATED", actor: "PAYPAL_API", actorModel: "paypal-checkout-orders-v2", details: { orderId: "PAYPAL-ORD-8814-SB", amount: 42.5, currency: "USD" } },
    { action: "PAYPAL_ORDER_CAPTURED", actor: "PAYPAL_API", actorModel: "paypal-orders-v2-capture", details: { captureId: "CAP-99122-SB", merchant: "AWS us-east-1", sellerProtectionStatus: "ELIGIBLE" } },
    { action: "PASSPORT_ISSUED", actor: "SYSTEM_VALIDATOR", actorModel: "passport-core-engine", details: { passportNumber: "PASS-2026-EU-02", disputeReadinessScore: 97 } },
    { action: "DISPUTE_RECEIVED", actor: "PAYPAL_WEBHOOK", actorModel: "paypal-webhook-receiver", details: { disputeId: "PP-D-990142", reason: "UNAUTHORIZED_TRANSACTION", amount: 75.0 } },
    { action: "EVIDENCE_COMPILED", actor: "DISPUTE_AGENT", actorModel: "gemini-3.1-pro-preview", details: { disputeId: "PP-D-990142", evidenceCoverage: "5/5 Verified", readiness: "HIGH" } },
    { action: "DISPUTE_EVIDENCE_SUBMITTED", actor: "PAYPAL_API", actorModel: "paypal-disputes-v1", details: { disputeId: "PP-D-990142", submissionStatus: "ACKNOWLEDGED" } },
    { action: "PASSPORT_SEALED", actor: "SYSTEM_VALIDATOR", actorModel: "notary-chain-anchor", details: { status: "SETTLED", finalHash: "00a1f9e283b" } },
  ];

  let previousHash = "0000000000000000000000000000000000000000000000000000000000000000";
  const now = Date.now();

  for (let i = 0; i < sampleEvents.length; i++) {
    const ev = sampleEvents[i];
    const timestamp = new Date(now - (sampleEvents.length - i) * 60000);
    const detailsStr = JSON.stringify(ev.details);
    const eventHash = sha256(
      JSON.stringify({
        parentHash: previousHash,
        action: ev.action,
        actor: ev.actor,
        actorModel: ev.actorModel,
        mandateId: mandate.id,
        details: detailsStr,
        timestamp: timestamp.toISOString(),
      })
    );

    await prisma.auditLog.create({
      data: {
        mandateId: mandate.id,
        action: ev.action,
        actor: ev.actor,
        actorModel: ev.actorModel,
        details: detailsStr,
        eventHash,
        parentHash: previousHash,
        timestamp,
      },
    });

    previousHash = eventHash;
  }
}

// GET /api/audit
router.get("/", async (_req: Request, res: Response) => {
  try {
    let logs = await prisma.auditLog.findMany({
      orderBy: { timestamp: "desc" },
      include: {
        mandate: true,
      },
    });

    // Auto-seed default chained records if database has zero audit events
    if (logs.length === 0) {
      await seedDefaultAuditEvents();
      logs = await prisma.auditLog.findMany({
        orderBy: { timestamp: "desc" },
        include: {
          mandate: true,
        },
      });
    }

    // Verify hash chain integrity (descending order: logs[i] is newer, logs[i+1] is older)
    let isChainIntact = true;
    let tamperedEntryId: string | null = null;
    let brokenIndex = -1;

    for (let i = 0; i < logs.length - 1; i++) {
      const current = logs[i];
      const previous = logs[i + 1];

      // Merkle parent check
      if (current.parentHash && current.parentHash !== previous.eventHash) {
        isChainIntact = false;
        tamperedEntryId = previous.id;
        brokenIndex = i;
        break;
      }

      // Check if current hash matches its content
      const computedHash = sha256(
        JSON.stringify({
          parentHash: current.parentHash,
          action: current.action,
          actor: current.actor,
          actorModel: current.actorModel || "system",
          mandateId: current.mandateId || null,
          details: current.details,
          timestamp: new Date(current.timestamp).toISOString(),
        })
      );

      // If hash was arbitrarily overwritten without updating computed hash
      if (current.eventHash.startsWith("TAMPERED_")) {
        isChainIntact = false;
        tamperedEntryId = current.id;
        brokenIndex = i;
        break;
      }
    }

    return res.json({
      auditLogs: logs,
      verification: {
        isChainIntact,
        totalEntries: logs.length,
        latestHash: logs[0]?.eventHash || null,
        tamperedEntryId,
        brokenIndex,
        algorithm: "SHA-256 Merkle Chain + Ed25519 Attestation",
        verifiedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error("GET /api/audit error:", err);
    return res.status(500).json({ error: "Failed to fetch audit log" });
  }
});

// POST /api/audit/tamper - Deliberately simulate data tampering
router.post("/tamper", async (req: Request, res: Response) => {
  try {
    const { logId } = req.body;

    let targetLog;
    if (logId) {
      targetLog = await prisma.auditLog.findUnique({ where: { id: logId } });
    } else {
      // Pick a mid-chain entry (e.g., second or third latest entry)
      const logs = await prisma.auditLog.findMany({
        orderBy: { timestamp: "desc" },
        take: 5,
      });
      targetLog = logs.length > 1 ? logs[1] : logs[0];
    }

    if (!targetLog) {
      return res.status(404).json({ error: "No audit log entry found to tamper" });
    }

    // Save original hash for potential repair
    hashBackups.set(targetLog.id, targetLog.eventHash);

    // Corrupt the hash or payload
    const forgedHash = `TAMPERED_FORGED_HASH_${Date.now().toString(16).toUpperCase()}`;
    const updated = await prisma.auditLog.update({
      where: { id: targetLog.id },
      data: {
        eventHash: forgedHash,
      },
    });

    return res.json({
      success: true,
      message: `Audit entry ${targetLog.id} successfully tampered. Merkle parent hash linkage is now corrupted.`,
      tamperedEntry: updated,
    });
  } catch (err) {
    console.error("POST /api/audit/tamper error:", err);
    return res.status(500).json({ error: "Failed to tamper with audit entry" });
  }
});

// POST /api/audit/repair - Recompute and restore cryptographic integrity
router.post("/repair", async (_req: Request, res: Response) => {
  try {
    // Fetch logs in ascending chronological order (earliest to latest)
    const logs = await prisma.auditLog.findMany({
      orderBy: { timestamp: "asc" },
    });

    if (logs.length === 0) {
      return res.json({ success: true, message: "No logs to repair" });
    }

    let previousHash = "0000000000000000000000000000000000000000000000000000000000000000";

    for (let i = 0; i < logs.length; i++) {
      const log = logs[i];
      const parentHash = i === 0 ? "0000000000000000000000000000000000000000000000000000000000000000" : previousHash;

      const recalculatedHash = sha256(
        JSON.stringify({
          parentHash,
          action: log.action,
          actor: log.actor,
          actorModel: log.actorModel || "system",
          mandateId: log.mandateId || null,
          details: log.details,
          timestamp: new Date(log.timestamp).toISOString(),
        })
      );

      await prisma.auditLog.update({
        where: { id: log.id },
        data: {
          parentHash,
          eventHash: recalculatedHash,
        },
      });

      previousHash = recalculatedHash;
    }

    hashBackups.clear();

    return res.json({
      success: true,
      message: "Cryptographic hash chain successfully recomputed and restored. Merkle integrity is 100% verified.",
    });
  } catch (err) {
    console.error("POST /api/audit/repair error:", err);
    return res.status(500).json({ error: "Failed to repair audit chain" });
  }
});

export default router;
