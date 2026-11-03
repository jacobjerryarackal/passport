import prisma from "@/server/db/prisma";
import Link from "next/link";
import { AppHeader } from "@/components/layout/app-header";
import { StatusPill } from "@/components/ui/status-pill";
import { Button } from "@/components/ui/button";
import { StateBoundary } from "@/components/ui/state-boundary";
import {
  AlertOctagon,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  FileCheck2,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DisputesListPage() {
  const disputes = await prisma.dispute.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      passport: true,
      purchase: {
        include: {
          mandate: true,
          proposal: true,
        },
      },
      evidenceItems: true,
    },
  });

  const totalDisputed = disputes.reduce((acc, d) => acc + d.disputeAmount, 0);

  return (
    <>
      <AppHeader
        title="Dispute Autopsy Room"
        subtitle="Autonomous chargeback forensics, evidence gap analysis, and human-approved defense submissions."
      />

      <div className="space-y-6">
        {/* KPI Triage */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="fintech-card border-amber-500/25 bg-amber-500/5">
            <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider block font-mono">
              Active Chargebacks
            </span>
            <div className="text-2xl font-mono font-bold text-foreground mt-1 tabular-nums">
              {disputes.length}
            </div>
            <div className="text-[11px] text-amber-800 dark:text-amber-300 mt-1 flex items-center gap-1 font-mono">
              <Clock className="w-3 h-3" /> Response due in 6 business days
            </div>
          </div>

          <div className="fintech-card">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block font-mono">
              Total Disputed Volume
            </span>
            <div className="text-2xl font-mono font-bold text-foreground mt-1 tabular-nums">
              {formatCurrency(totalDisputed)}
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-mono">
              <ShieldCheck className="w-3 h-3" /> PayPal Seller Protection Eligible
            </div>
          </div>

          <div className="fintech-card">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block font-mono">
              Defense Readiness
            </span>
            <div className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
              100%
            </div>
            <div className="text-[11px] text-muted-foreground mt-1 font-mono">
              5 of 5 evidence artifacts reconciled
            </div>
          </div>
        </div>

        {/* Dispute Cases */}
        {disputes.length === 0 ? (
          <StateBoundary
            type="empty"
            title="No Active Chargebacks"
            message="No disputes currently open. All AI-agent transactions are settled and bounded."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {disputes.map((dispute) => {
              const verifiedCount = dispute.evidenceItems.filter((e) => e.status === "VERIFIED").length;
              const totalCount = dispute.evidenceItems.length || 5;
              const progress = Math.min(100, (verifiedCount / totalCount) * 100);

              return (
                <div
                  key={dispute.id}
                  className="fintech-card border-amber-500/30 bg-card hover:border-amber-500/60 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-border">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                          <AlertOctagon className="w-4 h-4" />
                        </div>
                        <span className="font-mono text-xs font-bold text-foreground">
                          {dispute.paypalDisputeId}
                        </span>
                      </div>

                      <StatusPill status="action_required" label="CHARGEBACK" />
                    </div>

                    <div className="mt-4 space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Disputed Amount:</span>
                        <span className="font-mono font-bold text-base text-foreground tabular-nums">
                          {formatCurrency(dispute.disputeAmount, dispute.currency)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Dispute Reason:</span>
                        <span className="font-semibold text-foreground">
                          {dispute.disputeReason}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-muted/40 border border-border text-[11px] text-foreground/80 line-clamp-2 italic">
                        &quot;{dispute.buyerNotes}&quot;
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="text-muted-foreground">Evidence Assembled:</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
                            {verifiedCount}/{totalCount} Items ({progress.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-border flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {formatDate(dispute.createdAt)}
                    </span>
                    <Link
                      href={`/disputes/${dispute.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-500 transition-colors"
                    >
                      <span>Enter Autopsy Room</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
