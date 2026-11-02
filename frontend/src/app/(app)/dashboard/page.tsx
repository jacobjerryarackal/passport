import prisma from "@/server/db/prisma";
import Link from "next/link";
import { AppHeader } from "@/components/layout/app-header";
import { MetricCockpit } from "@/components/ui/metric-cockpit";
import { StatusPill } from "@/components/ui/status-pill";
import { HashInspector } from "@/components/ui/hash-inspector";
import { FintechButton } from "@/components/ui/fintech-button";
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
  Clock,
  UserCheck,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

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
    include: {
      purchase: {
        include: { proposal: true },
      },
      mandate: true,
    },
  });

  const disputes = await prisma.dispute.findMany({
    orderBy: { createdAt: "desc" },
    include: { purchase: true, passport: true, evidenceItems: true },
  });

  const auditLogs = await prisma.auditLog.findMany({
    orderBy: { timestamp: "desc" },
    take: 6,
  });

  const totalSpent = purchases.reduce(
    (acc, p) => (p.status !== "FAILED" ? acc + p.amount : acc),
    0
  );
  const totalMandateCap = mandates.reduce((acc, m) => acc + m.maxAmount, 0);
  const activeMandatesCount = mandates.filter((m) => m.status === "ACTIVE").length;

  return (
    <>
      <AppHeader
        title="Operations Cockpit"
        subtitle="Real-time mandate enforcement, PayPal sandbox settlement telemetry, and chargeback defense operations."
      />

      <div className="space-y-6">
        {/* KPI METRIC COCKPIT */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Metric 1: Protected Spend */}
          <MetricCockpit
            label="Protected Spend Volume"
            value={totalSpent}
            isCurrency={true}
            sublabel={`Bounded by ${formatCurrency(totalMandateCap)} cap`}
            badge={<StatusPill status="approved" label="Mandate Bounded" />}
            icon={<DollarSign className="w-4 h-4 text-primary-400" />}
          />

          {/* Metric 2: Active Mandates */}
          <MetricCockpit
            label="Active Mandates"
            value={activeMandatesCount}
            sublabel="Autonomous spend limits"
            badge={<StatusPill status="active" label="24h TTL" />}
            icon={<FileCheck2 className="w-4 h-4 text-emerald-400" />}
          />

          {/* Metric 3: Trust Passports */}
          <MetricCockpit
            label="Trust Passports"
            value={passports.length}
            sublabel="100% Cryptographic"
            badge={<StatusPill status="verified" label="ECDSA+SHA256" />}
            icon={<ScrollText className="w-4 h-4 text-primary-400" />}
          />

          {/* Metric 4: Chargeback Case Room */}
          <MetricCockpit
            label="Dispute Case Room"
            value={disputes.length}
            sublabel="Action required (6d left)"
            badge={<StatusPill status="action_required" label="Human Co-Sign" />}
            icon={<AlertOctagon className="w-4 h-4 text-amber-400" />}
          />
        </div>

        {/* OPERATIONS FLOW QUICK ACTION TRIAGE */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/mandates"
            className="p-5 rounded-xl border border-border bg-card hover:border-primary-500/40 hover:bg-zinc-900/60 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-8 h-8 rounded-lg bg-primary-500/10 text-primary-400 flex items-center justify-center mb-3">
                <PlusCircle className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-foreground group-hover:text-primary-400 transition-colors">
                1. Authorize Spend Mandate
              </h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Set purpose, budget cap ($80), allowed category, and refund terms using plain English parsed by Gemini.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-primary-400">
              <span>Manage Mandates</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/purchases"
            className="p-5 rounded-xl border border-border bg-card hover:border-emerald-500/40 hover:bg-zinc-900/60 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
                <Bot className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-foreground group-hover:text-emerald-400 transition-colors">
                2. Test Agent Purchase Console
              </h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Simulate the approved $75 digital gift card vs the blocked $120 physical office chair with real-time policy checks.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-emerald-400">
              <span>Launch Agent Console</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/disputes/disp-chargeback-demo"
            className="p-5 rounded-xl border border-amber-500/30 bg-card hover:border-amber-500/60 hover:bg-zinc-900/60 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3">
                <AlertOctagon className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-foreground group-hover:text-amber-400 transition-colors">
                3. Chargeback Autopsy &amp; Co-Sign
              </h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Inspect Dispute PP-D-849201, review the AI-assembled evidence checklist, and human co-sign before PayPal submission.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-amber-400">
              <span>Open Autopsy Room</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* TWO-COLUMN TRIAGE MATRIX */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* COLUMN 1: Active Trust Passports */}
          <div className="fintech-card space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div>
                <h2 className="text-sm font-semibold text-foreground">
                  Verifiable Trust Passports
                </h2>
                <p className="text-xs text-muted-foreground">
                  Cryptographic transaction credentials linked to governing mandates
                </p>
              </div>
              <Link
                href="/passports"
                className="text-xs text-primary-400 hover:underline flex items-center gap-1 font-medium"
              >
                View all ({passports.length}) <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {passports.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  No Trust Passports issued yet. Run an authorized purchase in the console.
                </div>
              ) : (
                passports.map((p) => (
                  <Link
                    key={p.id}
                    href={`/passports/${p.id}`}
                    className="block p-3.5 rounded-lg border border-border bg-background/50 hover:bg-zinc-800/40 hover:border-primary-500/30 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-foreground group-hover:text-primary-400 transition-colors">
                          {p.passportNumber}
                        </span>
                        <StatusPill status={p.status} />
                      </div>
                      <span className="font-mono text-sm font-bold text-foreground tabular-nums">
                        {formatCurrency(p.purchase.amount, p.purchase.currency)}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span className="truncate max-w-[200px]">
                        {p.purchase.proposal?.itemName || p.mandate.title}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px]">Readiness:</span>
                        <span className="font-mono text-emerald-400 font-bold tabular-nums">
                          {p.disputeReadinessScore}/100
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                      <HashInspector hash={p.passportHash} truncateLength={6} />
                      <span className="text-primary-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 text-[10px]">
                        Inspect Credential &rarr;
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* COLUMN 2: Dispute Defense Urgency (Case Room) */}
          <div className="fintech-card space-y-4 border-amber-500/25">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div>
                <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <span>Dispute Defense Case Room</span>
                  <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                </h2>
                <p className="text-xs text-muted-foreground">
                  Active chargebacks requiring evidence reconciliation &amp; human co-signature
                </p>
              </div>
              <Link
                href="/disputes"
                className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-medium"
              >
                View all ({disputes.length}) <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {disputes.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  No open disputes. All transactions settled cleanly.
                </div>
              ) : (
                disputes.map((d) => {
                  const verifiedCount = d.evidenceItems.filter(
                    (e) => e.status === "VERIFIED"
                  ).length;
                  const totalCount = d.evidenceItems.length || 5;
                  const progress = Math.min(100, (verifiedCount / totalCount) * 100);

                  return (
                    <div
                      key={d.id}
                      className="p-4 rounded-lg border border-amber-500/25 bg-amber-500/5 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-amber-300">
                            {d.paypalDisputeId}
                          </span>
                          <StatusPill status="action_required" label="CHARGEBACK" />
                        </div>
                        <span className="font-mono text-sm font-bold text-foreground tabular-nums">
                          {formatCurrency(d.disputeAmount, d.currency)}
                        </span>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        Reason: <strong className="text-foreground">{d.disputeReason}</strong>
                      </div>

                      {/* Evidence Reconciliation Bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-muted-foreground">
                            Evidence Assembled:
                          </span>
                          <span className="font-mono text-emerald-400 font-bold tabular-nums">
                            {verifiedCount}/{totalCount} Items ({progress.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div className="pt-2 flex items-center justify-between border-t border-amber-500/20 text-xs">
                        <span className="text-amber-400 font-medium text-[11px] flex items-center gap-1">
                          <Clock className="w-3 h-3" /> 6 Days Left to Respond
                        </span>
                        <Link href={`/disputes/${d.id}`}>
                          <FintechButton variant="outline" size="sm" className="h-7 text-xs border-amber-500/30 text-amber-300 hover:bg-amber-500/10">
                            Enter Autopsy Room &rarr;
                          </FintechButton>
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* TAMPER-EVIDENT AUDIT FEED */}
        <div className="fintech-card space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <div>
                <h2 className="text-sm font-semibold text-foreground">
                  Tamper-Evident Audit Feed
                </h2>
                <p className="text-xs text-muted-foreground">
                  Cryptographically chained events with parent hash bindings
                </p>
              </div>
            </div>
            <Link
              href="/audit"
              className="text-xs text-primary-400 hover:underline flex items-center gap-1 font-medium"
            >
              Full Ledger ({auditLogs.length}) <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-border/60">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-foreground">
                      {log.action}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">
                      {log.actor}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-[11px] line-clamp-1">
                    {log.details}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <HashInspector hash={log.eventHash} truncateLength={5} />
                  <span className="text-[11px] text-muted-foreground whitespace-nowrap font-mono tabular-nums">
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
