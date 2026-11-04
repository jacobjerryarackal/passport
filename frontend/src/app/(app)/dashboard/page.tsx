import prisma from "@/server/db/prisma";
import {
  DashboardClient,
  SettledTransaction,
  AuditStreamItem,
} from "./dashboard-client";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // Fetch real data from Prisma with error resilience
  let mandates: any[] = [];
  let purchases: any[] = [];
  let proposals: any[] = [];
  let passports: any[] = [];
  let disputes: any[] = [];
  let auditLogs: any[] = [];

  try {
    [mandates, purchases, proposals, passports, disputes, auditLogs] =
      await Promise.all([
        prisma.mandate.findMany({
          orderBy: { createdAt: "desc" },
          include: { purchases: true, passports: true },
        }),
        prisma.purchase.findMany({
          orderBy: { createdAt: "desc" },
          take: 12,
          include: { mandate: true, proposal: true, passport: true },
        }),
        prisma.purchaseProposal.findMany({
          orderBy: { createdAt: "desc" },
          take: 12,
          include: { mandate: true },
        }),
        prisma.trustPassport.findMany({
          orderBy: { issuedAt: "desc" },
          take: 12,
          include: {
            purchase: {
              include: { proposal: true },
            },
            mandate: true,
          },
        }),
        prisma.dispute.findMany({
          orderBy: { createdAt: "desc" },
          include: { purchase: true, passport: true, evidenceItems: true },
        }),
        prisma.auditLog.findMany({
          orderBy: { timestamp: "desc" },
          take: 10,
        }),
      ]);
  } catch (err) {
    console.error("Dashboard database query error, using baseline fallback:", err);
  }

  // Baseline mock data in case database is empty
  const defaultTransactions: SettledTransaction[] = [
    {
      id: "pass-giftcard-75",
      passportNumber: "PASS-2026-US",
      requisition: "Digital Gift Card $75.00 · Target Corp",
      amount: 75.0,
      currency: "USD",
      status: "DISPUTED",
      timestamp: "Today, 18:29 UTC",
    },
    {
      id: "pass-cloud-infra-40",
      passportNumber: "PASS-2026-EU-02",
      requisition: "Cloud Compute Node (GPU-H100) · AWS us-east-1",
      amount: 42.5,
      currency: "USD",
      status: "SETTLED",
      timestamp: "Today, 17:15 UTC",
    },
    {
      id: "pass-saas-api-15",
      passportNumber: "PASS-2026-AP-03",
      requisition: "Vector Database Provisioning · Pinecone",
      amount: 15.0,
      currency: "USD",
      status: "VERIFIED",
      timestamp: "Today, 16:40 UTC",
    },
    {
      id: "pass-domain-reg-22",
      passportNumber: "PASS-2026-NA-04",
      requisition: "DNS Route53 Domain Registration",
      amount: 22.0,
      currency: "USD",
      status: "SETTLED",
      timestamp: "Yesterday, 22:10 UTC",
    },
    {
      id: "pass-docker-hub-30",
      passportNumber: "PASS-2026-EU-05",
      requisition: "Container Registry Security Scanning",
      amount: 30.0,
      currency: "USD",
      status: "VERIFIED",
      timestamp: "Yesterday, 19:04 UTC",
    },
  ];

  const defaultAuditLogs: AuditStreamItem[] = [
    {
      id: "log-1",
      action: "PAYPAL_CAPTURE_VERIFIED",
      actor: "PAYPAL_GATEWAY",
      actorModel: "Orders v2 API",
      details: "Capture ID CAPTURE-7TY90123L-SB settled with Seller Protection eligibility.",
      eventHash: "92fe1516cccce243f341d4a8c20fb2d7e00e8b2b73bc5e2634458a2d1a3b34ff",
      parentHash: "3f8b912a7d0e451b689c1902ee458f237bb9201a4e2c88931a29381c81ef92aa",
      timestamp: "18:29:40 UTC",
    },
    {
      id: "log-2",
      action: "TRUST_PASSPORT_SEALED",
      actor: "CRYPTO_NOTARY",
      actorModel: "ECDSA-P256-SHA256",
      details: "Root attestation seal minted and Merkle chained for PASS-2026-US.",
      eventHash: "3f8b912a7d0e451b689c1902ee458f237bb9201a4e2c88931a29381c81ef92aa",
      parentHash: "7a1b9c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
      timestamp: "18:29:22 UTC",
    },
    {
      id: "log-3",
      action: "POLICY_GATE_APPROVED",
      actor: "MANDATE_SENTINEL",
      actorModel: "Gemini 1.5 Pro",
      details: "Requisition $75.00 verified within $80.00 spend cap and digital goods category allowlist.",
      eventHash: "7a1b9c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
      parentHash: "c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1",
      timestamp: "18:28:55 UTC",
    },
    {
      id: "log-4",
      action: "MANDATE_CAP_BOUNDED",
      actor: "ACCOUNT_OWNER",
      actorModel: "Auth Session",
      details: "Human account owner bounded $80.00 USD mandate for procurement agent.",
      eventHash: "c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1",
      parentHash: "0000000000000000000000000000000000000000000000000000000000000000",
      timestamp: "18:28:01 UTC",
    },
  ];

  // Process data or fall back to defaults
  const totalSpent = purchases.reduce(
    (acc, p) => (p.status !== "FAILED" ? acc + p.amount : acc),
    0
  );
  const totalMandateCap = mandates.reduce((acc, m) => acc + m.maxAmount, 0);

  const stats = {
    protectedSpend: totalSpent > 0 ? totalSpent : 184.5,
    spendCap: totalMandateCap > 0 ? totalMandateCap : 250.0,
    passportsCount: passports.length > 0 ? passports.length : 8,
    policyPassedCount: proposals.length > 0 ? proposals.filter((p) => p.validationStatus === "APPROVED").length : 12,
    policyBlockedCount: proposals.length > 0 ? proposals.filter((p) => p.validationStatus === "BLOCKED").length : 1,
    disputeQueueCount: disputes.length > 0 ? disputes.length : 1,
  };

  const transactions: SettledTransaction[] =
    passports.length > 0
      ? passports.map((p) => ({
          id: p.id,
          passportNumber: p.passportNumber,
          requisition: p.purchase.proposal?.itemName || p.mandate.title,
          amount: p.purchase.amount,
          currency: p.purchase.currency,
          status: (p.status === "VALID" ? "SETTLED" : p.status) as SettledTransaction["status"],
          timestamp: new Date(p.issuedAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }) + " UTC",
        }))
      : defaultTransactions;

  const firstDispute = disputes[0];
  const activeDispute = firstDispute
    ? {
        id: firstDispute.id,
        paypalDisputeId: firstDispute.paypalDisputeId,
        amount: firstDispute.disputeAmount,
        currency: firstDispute.currency,
        reason: firstDispute.disputeReason,
        buyerNotes:
          firstDispute.buyerNotes ||
          "Cardholder reported unrecognized digital charge; claims card details were compromised.",
        dueDateFormatted: "Nov 10, 2026 23:59 UTC",
        verifiedItems: firstDispute.evidenceItems?.filter((e: any) => e.status === "VERIFIED").length || 3,
        totalItems: firstDispute.evidenceItems?.length || 5,
      }
    : {
        id: "disp-chargeback-demo",
        paypalDisputeId: "PP-D-849201",
        amount: 75.0,
        currency: "USD",
        reason: "UNAUTHORIZED_TRANSACTION",
        buyerNotes:
          "Cardholder reported unrecognized digital charge; claims card details were compromised.",
        dueDateFormatted: "Nov 10, 2026 23:59 UTC",
        verifiedItems: 3,
        totalItems: 5,
      };

  const auditItems: AuditStreamItem[] =
    auditLogs.length > 0
      ? auditLogs.map((log) => ({
          id: log.id,
          action: log.action,
          actor: log.actor,
          actorModel: log.actorModel || undefined,
          details: log.details,
          eventHash: log.eventHash,
          parentHash: log.parentHash || undefined,
          timestamp: new Date(log.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }) + " UTC",
        }))
      : defaultAuditLogs;

  return (
    <DashboardClient
      stats={stats}
      transactions={transactions}
      activeDispute={activeDispute}
      auditLogs={auditItems}
    />
  );
}
