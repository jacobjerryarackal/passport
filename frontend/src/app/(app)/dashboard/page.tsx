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
  DollarSign,
  TrendingUp,
  Clock,
  UserCheck,
  CreditCard,
  Layers,
  ArrowUpRight,
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
    take: 6,
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
  const deploymentRatio = totalMandateCap > 0 ? (totalSpent / totalMandateCap) * 100 : 0;

  return (
    <>
      <AppHeader
        title="Operations Control Plane"
        subtitle="Real-time mandate enforcement, PayPal sandbox settlement telemetry, and chargeback defense operations."
      />

      <div className="space-y-6">
        {/* UNIFIED FINANCIAL TELEMETRY LEDGER (NO GENERIC 4-CARD CLUSTER) */}
        <div className="border border-border bg-card rounded-lg p-5 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x divide-border">
            {/* Col 1: Capital Deployment */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase font-bold text-muted-foreground tracking-wider block">
                Protected Spend Volume
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-mono font-bold text-foreground tabular-nums">
                  {formatCurrency(totalSpent)}
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  / {formatCurrency(totalMandateCap)}
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, deploymentRatio)}%` }}
                />
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>{deploymentRatio.toFixed(1)}% bounded by active mandates</span>
              </div>
            </div>

            {/* Col 2: Active Constraints */}
            <div className="pt-4 md:pt-0 md:pl-6 space-y-2">
              <span className="text-[10px] font-mono uppercase font-bold text-muted-foreground tracking-wider block">
                Enforceable Mandates
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-mono font-bold text-foreground tabular-nums">
                  {activeMandatesCount}
                </span>
                <span className="text-xs text-muted-foreground">Active Policy Constraints</span>
              </div>
              <div className="text-[11px] text-muted-foreground">
                Category: <strong className="text-foreground font-mono">digital gift cards</strong>
              </div>
              <div className="text-[11px] text-primary flex items-center gap-1 font-medium font-mono">
                <Lock className="w-3 h-3" />
                <span>24h Automated Expiry</span>
              </div>
            </div>

            {/* Col 3: Attestation Vault */}
            <div className="pt-4 md:pt-0 md:pl-6 space-y-2">
              <span className="text-[10px] font-mono uppercase font-bold text-muted-foreground tracking-wider block">
                Issued Trust Passports
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-mono font-bold text-foreground tabular-nums">
                  {passports.length}
                </span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">100% Cryptographic</span>
              </div>
              <div className="text-[11px] text-muted-foreground">
                Readiness Index: <strong className="text-foreground font-mono">98 / 100</strong>
              </div>
              <div className="text-[11px] text-muted-foreground font-mono">
                Attestation: <span className="text-foreground">ECDSA-P256-SHA256</span>
              </div>
            </div>

            {/* Col 4: Dispute Case Room Priority */}
            <div className="pt-4 md:pt-0 md:pl-6 space-y-2">
              <span className="text-[10px] font-mono uppercase font-bold text-amber-600 dark:text-amber-400 tracking-wider block">
                Dispute Defense Queue
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-mono font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                  {disputes.length}
                </span>
                <span className="text-xs text-amber-800 dark:text-amber-300 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/25">
                  Action Required
                </span>
              </div>
              <div className="text-[11px] text-muted-foreground">
                Protection: <strong className="text-emerald-600 dark:text-emerald-400">PayPal Seller Eligible</strong>
              </div>
              <div className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium">
                <Clock className="w-3 h-3" />
                <span>6 Business Days to Submit</span>
              </div>
            </div>
          </div>
        </div>

        {/* ASYMMETRIC TWO-COLUMN OPERATIONS COCKPIT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: SETTLEMENT & PASSPORT LEDGER (8 COLS) */}
          <div className="lg:col-span-8 border border-border bg-card rounded-lg overflow-hidden shadow-xs">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-foreground">
                  Verifiable Settlement &amp; Credential Ledger
                </h2>
                <p className="text-[11px] text-muted-foreground">
                  Transactions captured via PayPal Orders v2 with attached cryptographic passports.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link href="/purchases" tabIndex={-1}>
                  <Button
                    variant="primary"
                    size="sm"
                    leadingIcon={<Bot className="w-3.5 h-3.5" />}
                  >
                    Agent Console
                  </Button>
                </Link>
                <Link href="/passports" tabIndex={-1}>
                  <Button
                    variant="outline"
                    size="sm"
                    trailingIcon={<ArrowUpRight className="w-3 h-3" />}
                  >
                    All Passports
                  </Button>
                </Link>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-secondary/40 border-b border-border text-muted-foreground uppercase text-[10px] font-mono tracking-wider">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Passport Number</th>
                    <th className="py-3 px-4 font-semibold">Item &amp; Mandate</th>
                    <th className="py-3 px-4 font-semibold font-mono">Amount</th>
                    <th className="py-3 px-4 font-semibold font-mono">Dispute Readiness</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 text-right font-semibold">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {passports.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-muted-foreground">
                        No Trust Passports issued yet. Run an authorized proposal in the purchase console.
                      </td>
                    </tr>
                  ) : (
                    passports.map((p) => (
                      <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                          <Link href={`/passports/${p.id}`} className="hover:text-primary transition-colors">
                            {p.passportNumber}
                          </Link>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-foreground truncate max-w-[200px]">
                            {p.purchase.proposal?.itemName || p.mandate.title}
                          </div>
                          <div className="text-[11px] text-muted-foreground truncate max-w-[200px]">
                            {p.mandate.purpose}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono font-bold text-foreground tabular-nums">
                          {formatCurrency(p.purchase.amount, p.purchase.currency)}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                              {p.disputeReadinessScore}/100
                            </span>
                            <div className="w-14 bg-secondary rounded-full h-1 overflow-hidden">
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

          {/* RIGHT: DISPUTE DEFENSE URGENCY ROOM (4 COLS) */}
          <div className="lg:col-span-4 border border-amber-500/35 bg-card rounded-lg overflow-hidden shadow-xs space-y-4 p-5">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <AlertOctagon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Dispute Autopsy Room
                  </h3>
                  <p className="text-[10px] text-muted-foreground font-mono">
                    High Priority Defense
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
                  <div key={d.id} className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                        {d.paypalDisputeId}
                      </span>
                      <span className="font-mono font-bold text-foreground tabular-nums">
                        {formatCurrency(d.disputeAmount, d.currency)}
                      </span>
                    </div>

                    <div className="text-xs text-muted-foreground leading-relaxed">
                      Reason: <strong className="text-foreground">{d.disputeReason}</strong>
                    </div>

                    <div className="p-3 rounded-md bg-secondary/50 border border-border text-[11px] text-foreground italic">
                      &quot;{d.buyerNotes}&quot;
                    </div>

                    {/* Evidence Assembled Progress */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground">Evidence Reconciled:</span>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold tabular-nums">
                          {verifiedCount}/{totalCount} Items ({progress.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-border">
                      <span className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1 font-mono">
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
        </div>

        {/* BOTTOM: REAL-TIME CRYPTOGRAPHIC AUDIT STREAM */}
        <div className="border border-border bg-card rounded-lg overflow-hidden shadow-xs">
          <div className="p-4 border-b border-border flex items-center justify-between">
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
                Inspect Ledger ({auditLogs.length})
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
                  </div>
                  <p className="text-muted-foreground text-[11px] line-clamp-1">
                    {log.details}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-right">
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
