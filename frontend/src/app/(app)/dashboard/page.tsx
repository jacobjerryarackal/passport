import prisma from "@/server/db/prisma";
import Link from "next/link";
import { AppHeader } from "@/components/layout/app-header";
import {
  ShieldCheck,
  FileCheck2,
  ScrollText,
  AlertOctagon,
  ArrowRight,
  Bot,
  PlusCircle,
  ExternalLink,
  Lock,
  Sparkles,
  CheckCircle2,
  XCircle,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { formatCurrency, formatDate, truncateHash } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const mandates = await prisma.mandate.findMany({
    orderBy: { createdAt: "desc" },
    include: { purchases: true, passports: true },
  });

  const purchases = await prisma.purchase.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { mandate: true, proposal: true, passport: true },
  });

  const passports = await prisma.trustPassport.findMany({
    orderBy: { issuedAt: "desc" },
    take: 4,
    include: { purchase: true, mandate: true },
  });

  const disputes = await prisma.dispute.findMany({
    orderBy: { createdAt: "desc" },
    include: { purchase: true, passport: true },
  });

  const auditLogs = await prisma.auditLog.findMany({
    orderBy: { timestamp: "desc" },
    take: 6,
  });

  const totalSpent = purchases.reduce((acc, p) => (p.status !== "FAILED" ? acc + p.amount : acc), 0);
  const totalMandateCap = mandates.reduce((acc, m) => acc + m.maxAmount, 0);

  return (
    <>
      <AppHeader
        title="Operations Dashboard"
        subtitle="Real-time mandate enforcement, PayPal sandbox settlement, and chargeback defense ledger."
      />

      <div className="space-y-6">
        {/* KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Protected Spend */}
          <div className="fintech-card">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Protected Spend Volume</span>
              <DollarSign className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-foreground font-mono">
                {formatCurrency(totalSpent)}
              </span>
              <span className="text-xs text-muted-foreground">
                of {formatCurrency(totalMandateCap)} cap
              </span>
            </div>
            <div className="mt-3 w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-primary-600 h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, totalMandateCap > 0 ? (totalSpent / totalMandateCap) * 100 : 0)}%`,
                }}
              />
            </div>
            <div className="mt-2 text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Bounded by active mandates
            </div>
          </div>

          {/* Card 2: Active Mandates */}
          <div className="fintech-card">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Active Mandates</span>
              <FileCheck2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-foreground font-mono">
                {mandates.filter((m) => m.status === "ACTIVE").length}
              </span>
              <span className="text-xs text-muted-foreground">
                active constraints
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Category constraint:</span>
              <span className="font-mono text-foreground font-medium truncate max-w-[120px]">
                digital gift cards
              </span>
            </div>
            <div className="mt-1 text-[11px] text-primary-600 dark:text-primary-400 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Auto-expiring in 24h
            </div>
          </div>

          {/* Card 3: Trust Passports */}
          <div className="fintech-card">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Trust Passports</span>
              <ScrollText className="w-4 h-4 text-primary-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-foreground font-mono">
                {passports.length}
              </span>
              <span className="text-xs text-emerald-500 font-medium">
                100% Cryptographic
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Verification Status:</span>
              <span className="text-emerald-500 font-mono font-medium">ECDSA + SHA-256</span>
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">
              Dispute Readiness Score: <strong className="text-foreground">98/100</strong>
            </div>
          </div>

          {/* Card 4: Chargeback Autopsy */}
          <div className="fintech-card border-amber-500/30 bg-amber-500/5">
            <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 text-xs font-medium">
              <span>Chargeback Autopsy</span>
              <AlertOctagon className="w-4 h-4 text-amber-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-foreground font-mono">
                {disputes.length}
              </span>
              <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                Action Required
              </span>
            </div>
            <div className="mt-3 text-[11px] text-muted-foreground">
              Protection: <strong className="text-emerald-500 font-medium">PayPal Seller Eligible</strong>
            </div>
            <div className="mt-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Defense package assembled
            </div>
          </div>
        </div>

        {/* Hackathon Flow Action Banners */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/mandates"
            className="p-5 rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-8 h-8 rounded-lg bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-3">
                <PlusCircle className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-foreground group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                1. Authorize Spend Mandate
              </h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Set purpose, budget cap ($80), allowed category, and refund terms using plain English parsed by Gemini.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-medium text-primary-600 dark:text-primary-400">
              Manage Mandates <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/purchases"
            className="p-5 rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                <Bot className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                2. Test Agent Purchase Console
              </h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Test the approved $75 digital gift card vs the blocked $120 physical office chair with real-time policy checks.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              Launch Agent Console <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/disputes/disp-chargeback-demo"
            className="p-5 rounded-xl border border-amber-500/30 bg-card hover:border-amber-500/60 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
                <AlertOctagon className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                3. Chargeback Autopsy & Co-Sign
              </h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Inspect Dispute PP-D-849201, review the AI-assembled evidence checklist, and human co-sign the response.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
              Open Autopsy Room <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* Two-column layout: Active Passports & Disputes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Trust Passports */}
          <div className="fintech-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Verifiable Trust Passports</h2>
                <p className="text-xs text-muted-foreground">
                  Cryptographic transaction receipts linked to parent mandates
                </p>
              </div>
              <Link
                href="/passports"
                className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1 font-medium"
              >
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {passports.map((p) => (
                <Link
                  key={p.id}
                  href={`/passports/${p.id}`}
                  className="block p-3.5 rounded-lg border border-border/80 bg-background/50 hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-foreground">
                        {p.passportNumber}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium">
                        Score: {p.disputeReadinessScore}/100
                      </span>
                    </div>
                    <span className="text-xs font-mono font-semibold text-foreground">
                      {formatCurrency(p.purchase.amount, p.purchase.currency)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="truncate max-w-[200px]">
                      Mandate: {p.mandate.title}
                    </span>
                    <span className="font-mono text-[10px] text-primary-500">
                      {truncateHash(p.passportHash, 6, 6)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Active Disputes & Chargeback Autopsy */}
          <div className="fintech-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Chargeback Defense Center</h2>
                <p className="text-xs text-muted-foreground">
                  Active disputes requiring human co-signature approval
                </p>
              </div>
              <Link
                href="/disputes"
                className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1 font-medium"
              >
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {disputes.map((d) => (
                <Link
                  key={d.id}
                  href={`/disputes/${d.id}`}
                  className="block p-3.5 rounded-lg border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                        {d.paypalDisputeId}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 font-semibold uppercase">
                        {d.disputeLifeCycleStage}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-foreground">
                      {formatCurrency(d.disputeAmount, d.currency)}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground line-clamp-1">
                    Reason: <strong className="text-foreground">{d.disputeReason}</strong> — {d.buyerNotes}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <span className="text-amber-600 dark:text-amber-400 font-medium">
                      Status: {d.status.replace("_", " ")}
                    </span>
                    <span className="text-primary-600 dark:text-primary-400 group-hover:underline flex items-center gap-1 font-medium">
                      Review Autopsy <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Live Immutable Audit Feed */}
        <div className="fintech-card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-foreground">Tamper-Evident Audit Ledger</h2>
              <span className="fintech-badge bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Merkle Chained
              </span>
            </div>
            <Link
              href="/audit"
              className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1 font-medium"
            >
              Full Ledger <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-border">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-2.5 flex items-center justify-between text-xs gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-2 h-2 rounded-full bg-primary-500 shrink-0" />
                  <div className="truncate">
                    <span className="font-semibold text-foreground font-mono">
                      {log.action}
                    </span>
                    <span className="text-muted-foreground ml-2 text-[11px]">
                      by <strong className="text-foreground">{log.actor}</strong> ({log.actorModel})
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono text-[11px] text-muted-foreground hidden sm:inline">
                    {truncateHash(log.eventHash, 6, 6)}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {formatDate(log.timestamp)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

