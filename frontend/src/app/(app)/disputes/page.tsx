import prisma from "@/server/db/prisma";
import Link from "next/link";
import { AppHeader } from "@/components/layout/app-header";
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

  return (
    <>
      <AppHeader
        title="Dispute Autopsy Room"
        subtitle="Autonomous chargeback forensics, evidence gap analysis, and human-approved defense submissions."
      />

      <div className="space-y-6">
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

                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25">
                      {dispute.status.replace("_", " ")}
                    </span>
                  </div>

                  <div className="mt-4 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Disputed Amount:</span>
                      <span className="font-mono font-bold text-base text-foreground">
                        {formatCurrency(dispute.disputeAmount, dispute.currency)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Dispute Reason:</span>
                      <span className="font-semibold text-foreground">
                        {dispute.disputeReason}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-muted/40 text-[11px] text-muted-foreground line-clamp-2">
                      &quot;{dispute.buyerNotes}&quot;
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-muted-foreground">Evidence Assembled:</span>
                        <span className="font-bold text-emerald-500 font-mono">
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

                <div className="mt-6 pt-3 border-t border-border flex items-center justify-between text-xs">
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Due {formatDate(dispute.dueDate)}
                  </span>

                  <Link
                    href={`/disputes/${dispute.id}`}
                    className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400 hover:underline"
                  >
                    Open Autopsy <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

