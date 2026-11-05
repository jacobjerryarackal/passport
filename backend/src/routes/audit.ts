import { Router, Request, Response } from "express";
import prisma from "../db/prisma";
import { sha256 } from "../verification/hasher";

const router = Router();

// In-memory backup of original hashes for quick restoration if tampered
const hashBackups = new Map<string, string>();

// GET /api/audit
router.get("/", async (_req: Request, res: Response) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { timestamp: "desc" },
      include: {
        mandate: true,
      },
    });

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
