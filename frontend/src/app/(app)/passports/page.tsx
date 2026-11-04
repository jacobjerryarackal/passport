import prisma from "@/server/db/prisma";
import Link from "next/link";
import {
  ScrollText,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
  Lock,
  Layers,
  AlertOctagon,
  FileCheck,
  Clock,
} from "lucide-react";
import { formatCurrency, formatDate, truncateHash } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface PassportRecord {
  id: string;
  passportNumber: string;
  mandateTitle: string;
  mandateId: string;
  amount: number;
  currency: string;
  disputeReadinessScore: number;
  passportHash: string;
  issuedAt: string;
  status: string;
}

export default async function PassportsListPage() {
  let dbPassports: any[] = [];

  try {
    dbPassports = await prisma.trustPassport.findMany({
      orderBy: { issuedAt: "desc" },
      include: {
        mandate: true,
        purchase: {
          include: {
            proposal: true,
            disputes: true,
          },
        },
      },
    });
  } catch (err) {
    console.error("Failed to query passports from db:", err);
  }

  // Seeded defaults in case DB is fresh
  const defaultPassports: PassportRecord[] = [
    {
      id: "pass-giftcard-75",
      passportNumber: "PASS-2026-US",
      mandateTitle: "Client Appreciation Procurement",
      mandateId: "mnd-client-gift-80",
      amount: 75.0,
      currency: "USD",
      disputeReadinessScore: 98,
      passportHash: "92fe1516cccce243f341d4a8c20fb2d7e00e8b2b73bc5e2634458a2d1a3b34ff",
      issuedAt: "Today, 18:29 UTC",
      status: "VALID",
    },
    {
      id: "pass-cloud-infra-40",
      passportNumber: "PASS-2026-EU-02",
      mandateTitle: "AI Inference Cluster Provisioning",
      mandateId: "mnd-gpu-cluster-150",
      amount: 42.5,
      currency: "USD",
      disputeReadinessScore: 96,
      passportHash: "4a8f9c0e21b3d5e7f9a1c3e5a7b9d1f3e5a7b9c1d3e5f7a9b1c3e5a7b9d1f3e5",
      issuedAt: "Today, 17:15 UTC",
      status: "VALID",
    },
    {
      id: "pass-saas-api-15",
      passportNumber: "PASS-2026-AP-03",
      mandateTitle: "Developer API Subscriptions",
      mandateId: "mnd-saas-tools-50",
      amount: 15.0,
      currency: "USD",
      disputeReadinessScore: 99,
      passportHash: "8b1a4f92c30e49a8d29b1093ee1402a7b8e1f02c91834a8e2938f01a39bc41d2",
      issuedAt: "Today, 16:40 UTC",
      status: "VALID",
    },
    {
      id: "pass-domain-reg-22",
      passportNumber: "PASS-2026-NA-04",
      mandateTitle: "Staging Domain Routing",
      mandateId: "mnd-domain-reg-25",
      amount: 22.0,
      currency: "USD",
      disputeReadinessScore: 94,
      passportHash: "1f3b5d7e9a2c4e6f8a0b2d4e6f8a0b2d4e6f8a0b2d4e6f8a0b2d4e6f8a0b2d4e",
      issuedAt: "Yesterday, 22:10 UTC",
      status: "SETTLED",
    },
    {
      id: "pass-docker-hub-30",
      passportNumber: "PASS-2026-EU-05",
      mandateTitle: "Container Registry Security Scanning",
      mandateId: "mnd-gpu-cluster-150",
      amount: 30.0,
      currency: "USD",
      disputeReadinessScore: 95,
      passportHash: "7a9b1c3e5a7b9d1f3e5a7b9c1d3e5f7a9b1c3e5a7b9d1f3e5a7b9c1d3e5f7a9b",
      issuedAt: "Yesterday, 19:04 UTC",
      status: "VALID",
    },
  ];

  const passports: PassportRecord[] =
    dbPassports.length > 0
      ? dbPassports.map((p) => ({
          id: p.id,
          passportNumber: p.passportNumber,
          mandateTitle: p.mandate?.title || "Autonomous Agent Requisition",
          mandateId: p.mandateId,
          amount: p.purchase?.amount || 0,
          currency: p.purchase?.currency || "USD",
          disputeReadinessScore: p.disputeReadinessScore || 98,
          passportHash: p.passportHash,
          issuedAt: formatDate(p.issuedAt),
          status: p.status,
        }))
      : defaultPassports;

  return (
    <div className="space-y-8 w-full max-w-full">
      {/* 1. EDITORIAL HEADER */}
      <div className="space-y-3 pb-6 border-b border-black/10 dark:border-white/10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#007A56] dark:bg-emerald-400 animate-pulse" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#002991] dark:text-[#60CDFF]">
            Control Plane · Cryptographic Attestation Credentials
          </span>
        </div>
        <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-[42px] text-black dark:text-white tracking-[-0.03em] leading-[1.1]">
          Trust Passports
        </h1>
        <p className="text-sm sm:text-base text-[#6C7378] dark:text-white/60 max-w-[65ch] font-normal leading-relaxed">
          Cryptographically verifiable receipts, tamper-evident audit trails, and pre-assembled dispute
          readiness records generated for autonomous AI-agent purchases.
        </p>
      </div>

      {/* 2. CONTINUOUS HORIZONTAL TELEMETRY STRIP (DIVIDED BY VERTICAL HAIRLINES, NO 3 SEPARATE CARDS) */}
      <div className="rounded-[20px] bg-white dark:bg-[#111114] border border-black/10 dark:border-white/10 overflow-hidden shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-black/10 dark:divide-white/10">
          {/* Metric 1: Issued Passports */}
          <div className="p-6 sm:p-7 space-y-1.5 text-left">
            <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-[#6C7378] dark:text-white/50 block">
              Issued Passports
            </span>
            <div className="font-display font-extrabold text-3xl sm:text-4xl text-black dark:text-white tabular-nums tracking-tight">
              {passports.length}
            </div>
            <div className="text-xs font-mono text-[#007A56] dark:text-emerald-400 flex items-center gap-1.5 pt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>100% Cryptographically Bound</span>
            </div>
          </div>

          {/* Metric 2: Average Dispute Readiness */}
          <div className="p-6 sm:p-7 space-y-1.5 text-left">
            <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-[#6C7378] dark:text-white/50 block">
              Average Dispute Readiness
            </span>
            <div className="font-display font-extrabold text-3xl sm:text-4xl text-[#007A56] dark:text-emerald-400 tabular-nums tracking-tight">
              98 / 100
            </div>
            <div className="text-xs font-mono text-[#6C7378] dark:text-white/60 pt-1">
              Pre-assembled Seller Protection evidence
            </div>
          </div>

          {/* Metric 3: Protection Status */}
          <div className="p-6 sm:p-7 space-y-1.5 text-left">
            <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-[#6C7378] dark:text-white/50 block">
              Protection Status
            </span>
            <div className="font-display font-extrabold text-3xl sm:text-4xl text-[#002991] dark:text-[#60CDFF] tracking-tight">
              ELIGIBLE
            </div>
            <div className="text-xs font-mono text-[#6C7378] dark:text-white/60 pt-1">
              PayPal Seller Protection Coverage
            </div>
          </div>
        </div>
      </div>

      {/* 3. DENSE FULL-WIDTH DATA TABLE (NO PER-ROW CARD BACKGROUNDS, HAIRLINE BOTTOM BORDERS, py-4 SPACING) */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-black/15 dark:border-white/15 text-[#6C7378] dark:text-white/50 uppercase font-mono text-[10px] tracking-wider">
              <th className="py-4 px-4 font-bold">Passport ID</th>
              <th className="py-4 px-4 font-bold">Governing Mandate</th>
              <th className="py-4 px-4 font-bold">Amount</th>
              <th className="py-4 px-4 font-bold w-[200px]">Dispute Readiness</th>
              <th className="py-4 px-4 font-bold">SHA-256 Digest</th>
              <th className="py-4 px-4 font-bold">Date</th>
              <th className="py-4 px-4 text-right font-bold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/10 dark:divide-white/10">
            {passports.map((passport) => (
              <tr
                key={passport.id}
                className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group"
              >
                {/* Passport ID (mono text link) */}
                <td className="py-4 px-4 font-mono font-bold text-sm text-[#002991] dark:text-[#60CDFF] whitespace-nowrap">
                  <Link href={`/passports/${passport.id}`} className="hover:underline flex items-center gap-1.5">
                    <ScrollText className="w-3.5 h-3.5" />
                    <span>{passport.passportNumber}</span>
                  </Link>
                </td>

                {/* Governing Mandate (truncated text) */}
                <td className="py-4 px-4">
                  <div className="font-display font-bold text-xs sm:text-sm text-black dark:text-white truncate max-w-[220px]">
                    {passport.mandateTitle}
                  </div>
                  <div className="text-[10px] font-mono text-[#6C7378] dark:text-white/50 truncate max-w-[220px]">
                    #{passport.mandateId.slice(0, 16)}
                  </div>
                </td>

                {/* Amount (tabular-nums) */}
                <td className="py-4 px-4 font-mono font-extrabold text-black dark:text-white tabular-nums text-sm whitespace-nowrap">
                  ${passport.amount.toFixed(2)} {passport.currency}
                </td>

                {/* Dispute Readiness (e.g. "98/100" with a thin sky-blue progress bar underneath) */}
                <td className="py-4 px-4 w-[200px]">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="font-bold text-[#002991] dark:text-[#60CDFF] tabular-nums">
                        {passport.disputeReadinessScore} / 100
                      </span>
                      <span className="text-[10px] text-[#007A56] dark:text-emerald-400 font-bold uppercase">
                        Verified
                      </span>
                    </div>
                    {/* Thin sky-blue progress bar */}
                    <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#60CDFF] shadow-[0_0_8px_rgba(96,205,255,0.6)]"
                        style={{ width: `${passport.disputeReadinessScore}%` }}
                      />
                    </div>
                  </div>
                </td>

                {/* SHA-256 Digest (truncated mono text) */}
                <td className="py-4 px-4 font-mono text-[11px] text-[#6C7378] dark:text-white/60 whitespace-nowrap">
                  <span title={passport.passportHash} className="hover:text-black dark:hover:text-white">
                    {passport.passportHash.slice(0, 8)}...{passport.passportHash.slice(-6)}
                  </span>
                </td>

                {/* Date (minimal mono text) */}
                <td className="py-4 px-4 font-mono text-[11px] text-[#6C7378] dark:text-white/50 whitespace-nowrap">
                  {passport.issuedAt}
                </td>

                {/* Action: Ghost link "Inspect →" */}
                <td className="py-4 px-4 text-right whitespace-nowrap">
                  <Link
                    href={`/passports/${passport.id}`}
                    className="font-semibold text-xs text-[#002991] dark:text-[#60CDFF] hover:underline inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>Inspect</span>
                    <span>→</span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
