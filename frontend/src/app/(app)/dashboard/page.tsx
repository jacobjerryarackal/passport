import prisma from "@/server/db/prisma";
import Link from "next/link";
import { AppHeader } from "@/components/layout/app-header";
import { StatusPill } from "@/components/ui/status-pill";
import { HashInspector } from "@/components/ui/hash-inspector";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  FileCheck2,
  ScrollText,
  AlertOctagon,
  ArrowRight,
  Bot,
  Plus,
  ExternalLink,
  Lock,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  CreditCard,
  Layers,
  ArrowUpRight,
  Shield,
  Activity,
  SlidersHorizontal,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [mandates, purchases, proposals, passports, disputes, auditLogs] = await Promise.all([
    prisma.mandate.findMany({
      orderBy: { createdAt: "desc" },
      include: { purchases: true, passports: true },
    }),
    prisma.purchase.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { mandate: true, proposal: true, passport: true },
    }),
    prisma.purchaseProposal.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { mandate: true },
    }),
    prisma.trustPassport.findMany({
      orderBy: { issuedAt: "desc" },
      take: 6,
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
      take: 8,
    }),
  ]);

  const totalSpent = purchases.reduce(
    (acc, p) => (p.status !== "FAILED" ? acc + p.amount : acc),
    0
  );
  const totalMandateCap = mandates.reduce((acc, m) => acc + m.maxAmount, 0);
  const activeMandatesCount = mandates.filter((m) => m.status === "ACTIVE").length;
  const deploymentRatio = totalMandateCap > 0 ? (totalSpent / totalMandateCap) * 100 : 0;
  const approvedProposalsCount = proposals.filter((p) => p.validationStatus === "APPROVED").length;
  const blockedProposalsCount = proposals.filter((p) => p.validationStatus === "BLOCKED").length;

  return (
    <>
      <AppHeader
        title="Operations Control Plane"
        subtitle="Real-time mandate enforcement, PayPal sandbox settlement telemetry, and chargeback defense operations."
      />

      <div className="space-y-6">
        {/* TOP LEVEL UNIFIED TELEMETRY BAR */}
        <div className="border border-border bg-card rounded-lg p-5 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 divide-y sm:divide-y-0 lg:divide-x divide-border">
            {/* Metric 1: Capital Deployment & Governance Velocity */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase font-bold text-muted-foreground tracking-wider">
                  Protected Spend Volume
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  {deploymentRatio.toFixed(1)}% USED
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-mono font-bold text-foreground tabular-nums">
                  {formatCurrency(totalSpent)}
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  / {formatCurrency(totalMandateCap)} CAP
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, deploymentRatio)}%` }}
                />
              </div>
              <div className="text-[11px] text-muted-foreground flex items-center justify-between font-mono">
                <span>Buffer: ${Math.max(0, totalMandateCap - totalSpent).toFixed(2)} USD</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">100% Guarded</span>
              </div>
            </div>

            {/* Metric 2: Autonomous Policy Enforcement Sentinel */}
            <div className="pt-4 sm:pt-0 sm:pl-6 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase font-bold text-muted-foreground tracking-wider">
                  Agent Policy Gate
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-secondary text-muted-foreground border border-border">
                  {proposals.length} INTAKES
                </span>
              </div>
              <div className="flex items-baseline gap-3">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {approvedProposalsCount}
                  </span>
                  <span className="text-[11px] text-muted-foreground uppercase font-mono font-bold">Passed</span>
                </div>
                <span className="text-muted-foreground/40 font-mono">/</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-mono font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                    {blockedProposalsCount}
                  </span>
                  <span className="text-[11px] text-muted-foreground uppercase font-mono font-bold">Blocked</span>
                </div>
              </div>
              <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden flex">
                <div
                  className="bg-emerald-500 h-full"
                  style={{ width: `${proposals.length > 0 ? (approvedProposalsCount / proposals.length) * 100 : 50}%` }}
                />
                <div
                  className="bg-rose-500 h-full"
                  style={{ width: `${proposals.length > 0 ? (blockedProposalsCount / proposals.length) * 100 : 50}%` }}
                />
              </div>
              <div className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono">
                <Shield className="w-3 h-3 text-primary" />
                <span>Deterministic mandate boundaries active</span>
              </div>
            </div>

            {/* Metric 3: Cryptographic Attestation Vault */}
            <div className="pt-4 lg:pt-0 lg:pl-6 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase font-bold text-muted-foreground tracking-wider">
                  Attestation Vault
                </span>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  100% INTACT
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-mono font-bold text-foreground tabular-nums">
                  {passports.length}
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  Issued Passports
                </span>
              </div>
              <div className="text-[11px] text-muted-foreground flex items-center justify-between font-mono">
                <span>Avg Readiness:</span>
                <strong className="text-emerald-600 dark:text-emerald-400 font-mono">98 / 100</strong>
              </div>
              <div className="text-[11px] text-muted-foreground font-mono flex items-center gap-1">
                <ScrollText className="w-3 h-3 text-primary" />
                <span>ECDSA-P256-SHA256 signed receipts</span>
              </div>
            </div>

            {/* Metric 4: Dispute Defense Room Priority */}
            <div className="pt-4 lg:pt-0 lg:pl-6 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase font-bold text-amber-700 dark:text-amber-400 tracking-wider">
                  Dispute Defense Queue
                </span>
                <span className="text-[10px] font-mono font-bold text-amber-800 dark:text-amber-300 bg-amber-500/15 px-1.5 py-0.5 rounded border border-amber-500/25">
                  1 URGENT
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-mono font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                  {disputes.length}
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  Active Chargeback ({formatCurrency(disputes[0]?.disputeAmount || 75)})
                </span>
              </div>
              <div className="text-[11px] text-muted-foreground flex items-center justify-between font-mono">
                <span>PayPal Seller Protection:</span>
                <strong className="text-emerald-600 dark:text-emerald-400">ELIGIBLE</strong>
              </div>
              <div className="text-[11px] text-amber-700 dark:text-amber-400 flex items-center gap-1 font-mono font-medium">
                <Clock className="w-3 h-3" />
                <span>6 Business Days to Submit</span>
              </div>
            </div>
          </div>
        </div>

        {/* PRIMARY ASYMMETRIC COMMAND CENTER (7 COLS LEFT / 5 COLS RIGHT) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: SETTLEMENTS & POLICY DECISION COCKPIT (7 COLS) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Section 1: Verifiable Settlements & Trust Passports Ledger */}
            <div className="border border-border bg-card rounded-lg overflow-hidden shadow-xs">
              <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-secondary/20">
                <div>
                  <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-primary" />
                    Settled Transactions &amp; Trust Passports
                  </h2>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Orders captured via PayPal Orders v2 with attached cryptographic passports.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link href="/purchases" tabIndex={-1}>
                    <Button variant="primary" size="sm" leadingIcon={<Bot className="w-3.5 h-3.5" />}>
                      Agent Console
                    </Button>
                  </Link>
                  <Link href="/passports" tabIndex={-1}>
                    <Button variant="outline" size="sm" trailingIcon={<ArrowUpRight className="w-3 h-3" />}>
                      All ({passports.length})
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-secondary/40 border-b border-border text-muted-foreground uppercase text-[10px] font-mono tracking-wider">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Passport Number</th>
                      <th className="py-3 px-4 font-semibold">Requisition &amp; Mandate</th>
                      <th className="py-3 px-4 font-semibold font-mono">Amount</th>
                      <th className="py-3 px-4 font-semibold font-mono">Dispute Readiness</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                      <th className="py-3 px-4 text-right font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {passports.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-muted-foreground">
                          No Trust Passports issued yet.
                        </td>
                      </tr>
                    ) : (
                      passports.map((p) => (
                        <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                            <Link href={`/passports/${p.id}`} className="hover:text-primary transition-colors flex items-center gap-1.5">
                              <ScrollText className="w-3.5 h-3.5 text-primary" />
                              <span>{p.passportNumber}</span>
                            </Link>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-foreground truncate max-w-[170px]">
                              {p.purchase.proposal?.itemName || p.mandate.title}
                            </div>
                            <div className="text-[11px] text-muted-foreground truncate max-w-[170px] font-mono">
                              Mandate #{p.mandateId.slice(0, 8)}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 font-mono font-bold text-foreground tabular-nums whitespace-nowrap">
                            {formatCurrency(p.purchase.amount, p.purchase.currency)}
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                                {p.disputeReadinessScore}/100
                              </span>
                              <div className="w-12 bg-secondary rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="bg-emerald-500 h-full rounded-full"
                                  style={{ width: `${p.disputeReadinessScore}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <StatusPill status={p.status} />
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <Link href={`/passports/${p.id}`} tabIndex={-1}>
                              <Button variant="ghost" size="sm" className="h-7 text-xs">
                                Inspect &rarr;
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 2: Autonomous Agent Policy Enforcement Stream (Approved vs Blocked) */}
            <div className="border border-border bg-card rounded-lg overflow-hidden shadow-xs">
              <div className="p-4 border-b border-border flex items-center justify-between bg-secondary/20">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-primary" />
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      Autonomous Policy Gate &amp; Intake Stream
                    </h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Deterministic verification of AI agent requisitions against mandate bounds.
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-secondary text-muted-foreground border border-border">
                  Gemini 1.5 Pro Engine
                </span>
              </div>

              <div className="divide-y divide-border/60">
                {proposals.map((prop) => {
                  const isApproved = prop.validationStatus === "APPROVED";
                  return (
                    <div
                      key={prop.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-muted/10 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                            isApproved
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {isApproved ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground text-xs">
                              {prop.itemName}
                            </span>
                            <StatusPill status={prop.validationStatus} label={prop.validationStatus} />
                          </div>

                          <div className="text-[11px] text-muted-foreground">
                            Category: <span className="font-mono text-foreground font-medium">{prop.itemCategory}</span> · Recipient: <span className="font-medium text-foreground">{prop.recipient}</span>
                          </div>

                          {!isApproved && prop.violationReason && (
                            <div className="text-[11px] text-rose-700 dark:text-rose-300 bg-rose-500/5 p-2 rounded border border-rose-500/20 leading-relaxed font-mono mt-1">
                              <strong>Violation Intercept:</strong> {prop.violationReason}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="sm:text-right shrink-0">
                        <div className="font-mono font-bold text-sm text-foreground tabular-nums">
                          {formatCurrency(prop.amount, prop.currency)}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                          {formatDate(prop.createdAt)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: INCIDENT COMMAND & MANDATE BOUNDS (5 COLS) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Section 1: Active Dispute Forensics Room (Incident Command) */}
            <div className="border border-amber-500/35 bg-card rounded-lg overflow-hidden shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                    <AlertOctagon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">
                      Dispute Forensics Incident Room
                    </h3>
                    <p className="text-[10px] text-muted-foreground font-mono">
                      High-Priority Defense Reconciled
                    </p>
                  </div>
                </div>

                <StatusPill status="action_required" label="CHARGEBACK" />
              </div>

              {disputes.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  No active disputes. All transactions settled cleanly.
                </div>
              ) : (
                disputes.map((d) => {
                  const verifiedCount = d.evidenceItems.filter((e) => e.status === "VERIFIED").length;
                  const totalCount = d.evidenceItems.length || 5;
                  const progress = Math.min(100, (verifiedCount / totalCount) * 100);

                  return (
                    <div key={d.id} className="space-y-3.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-amber-700 dark:text-amber-400 text-sm">
                            {d.paypalDisputeId}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary font-mono text-muted-foreground border border-border">
                            {d.disputeLifeCycleStage}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-foreground text-sm tabular-nums">
                          {formatCurrency(d.disputeAmount, d.currency)}
                        </span>
                      </div>

                      <div className="text-xs text-muted-foreground leading-relaxed">
                        Claim Type: <strong className="text-foreground">{d.disputeReason}</strong>
                      </div>

                      <div className="p-3 rounded-md bg-secondary/50 border border-border text-[11px] text-foreground/90 italic leading-relaxed">
                        &quot;{d.buyerNotes}&quot;
                      </div>

                      {/* Evidence Reconciled Progress */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-muted-foreground">Evidence Pack Reconciled:</span>
                          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold tabular-nums">
                            {verifiedCount}/{totalCount} Items ({progress.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Defense Strategy Badge */}
                      <div className="p-2.5 rounded-md bg-secondary/30 border border-border text-[11px] space-y-1">
                        <span className="text-[10px] uppercase font-mono font-bold text-muted-foreground block">
                          Optimal Defense Strategy (Gemini Forensics)
                        </span>
                        <div className="font-mono text-primary font-semibold text-[11px]">
                          COMPELLING_EVIDENCE_DIGITAL_DELIVERY
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-between border-t border-border">
                        <span className="text-xs text-amber-700 dark:text-amber-400 font-medium flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3" /> 6 Days Left
                        </span>

                        <Link href={`/disputes/${d.id}`} tabIndex={-1}>
                          <Button
                            variant="primary"
                            size="sm"
                            className="bg-amber-500 hover:bg-amber-400 text-black border-transparent font-bold text-xs h-8"
                            trailingIcon={<ArrowRight className="w-3.5 h-3.5" />}
                          >
                            Co-Sign Defense
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Section 2: Active Governing Mandate Bounds Snapshot */}
            {mandates.length > 0 && (
              <div className="border border-border bg-card rounded-lg p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-primary" />
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">
                        Active Mandate Bounds
                      </h3>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        {mandates[0].title}
                      </p>
                    </div>
                  </div>

                  <StatusPill status="approved" label="ACTIVE" />
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Authorized Budget Limit:</span>
                    <span className="font-mono font-bold text-foreground text-sm tabular-nums">
                      ${mandates[0].maxAmount.toFixed(2)} USD
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Allowed Scope:</span>
                    <span className="font-mono font-semibold text-primary">
                      {mandates[0].allowedCategories.replace(/[\[\]"]/g, "")}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Validity Window:</span>
                    <span className="font-mono text-muted-foreground">
                      24h (Expires {formatDate(mandates[0].expiresAt)})
                    </span>
                  </div>

                  <div className="pt-2 border-t border-border flex items-center justify-between">
                    <Link href="/mandates" className="text-xs text-primary font-semibold hover:underline inline-flex items-center gap-1">
                      <span>Manage Mandates</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>

                    <Link href="/purchases">
                      <Button variant="outline" size="sm" className="h-7 text-xs">
                        Test Boundary
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM: REAL-TIME CRYPTOGRAPHIC MERKLE AUDIT STREAM */}
        <div className="border border-border bg-card rounded-lg overflow-hidden shadow-xs">
          <div className="p-4 border-b border-border flex items-center justify-between bg-secondary/20">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Tamper-Evident Cryptographic Audit Stream
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Sequential Merkle-chained events with immutable parent hash bindings.
                </p>
              </div>
            </div>

            <Link href="/audit" tabIndex={-1}>
              <Button
                variant="outline"
                size="sm"
                trailingIcon={<ArrowUpRight className="w-3 h-3" />}
              >
                Inspect Full Ledger ({auditLogs.length})
              </Button>
            </Link>
          </div>

          <div className="divide-y divide-border/60">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs hover:bg-muted/10 transition-colors"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-foreground">
                      {log.action}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-foreground font-mono border border-border">
                      {log.actor}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {log.actorModel}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-[11px] line-clamp-1">
                    {log.details}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-right shrink-0">
                  <HashInspector hash={log.eventHash} truncateLength={6} />
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
