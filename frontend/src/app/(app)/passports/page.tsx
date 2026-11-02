import prisma from "@/server/db/prisma";
import Link from "next/link";
import { AppHeader } from "@/components/layout/app-header";
import { StatusPill } from "@/components/ui/status-pill";
import { HashInspector } from "@/components/ui/hash-inspector";
import { FintechButton } from "@/components/ui/fintech-button";
import {
  ScrollText,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
  Lock,
  Layers,
  AlertOctagon,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PassportsListPage() {
  const passports = await prisma.trustPassport.findMany({
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

  return (
    <>
      <AppHeader
        title="Trust Passports"
        subtitle="Cryptographically verifiable receipts, audit trails, and dispute readiness records."
      />

      <div className="space-y-6">
        {/* KPI Summary Header */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="fintech-card">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Issued Passports
            </span>
            <div className="text-2xl font-mono font-bold text-foreground mt-1 tabular-nums">
              {passports.length}
            </div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> 100% Cryptographically Bound
            </div>
          </div>

          <div className="fintech-card">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Average Dispute Readiness
            </span>
            <div className="text-2xl font-mono font-bold text-emerald-400 mt-1 tabular-nums">
              98/100
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              Pre-assembled Seller Protection evidence
            </div>
          </div>

          <div className="fintech-card">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Protection Status
            </span>
            <div className="text-2xl font-mono font-bold text-primary-400 mt-1">
              ELIGIBLE
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              PayPal Seller Protection Coverage
            </div>
          </div>
        </div>

        {/* Passport Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {passports.map((passport) => {
            const hasDispute = passport.purchase.disputes.length > 0;
            return (
              <div
                key={passport.id}
                className="fintech-card flex flex-col justify-between border-border hover:border-primary-500/40 group transition-all"
              >
                <div>
                  {/* Passport Badge Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-primary-500/10 text-primary-400 flex items-center justify-center">
                        <ScrollText className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-mono text-xs font-bold text-foreground">
                        {passport.passportNumber}
                      </span>
                    </div>

                    <StatusPill
                      status={hasDispute ? "disputed" : passport.status}
                      label={hasDispute ? "DISPUTED" : passport.status}
                    />
                  </div>

                  {/* Body Info */}
                  <div className="mt-4 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-mono font-bold text-base text-foreground tabular-nums">
                        {formatCurrency(passport.purchase.amount, passport.purchase.currency)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Governing Mandate:</span>
                      <span className="font-medium text-foreground truncate max-w-[150px]">
                        {passport.mandate.title}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Dispute Readiness:</span>
                      <span className="font-bold text-emerald-400 font-mono tabular-nums">
                        {passport.disputeReadinessScore}/100
                      </span>
                    </div>

                    <div className="flex items-center justify-between font-mono text-[11px]">
                      <span className="text-muted-foreground">SHA-256 Hash:</span>
                      <HashInspector hash={passport.passportHash} truncateLength={6} />
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="mt-5 pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {formatDate(passport.issuedAt)}
                  </span>
                  <Link
                    href={`/passports/${passport.id}`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary-400 group-hover:text-primary-300 transition-colors"
                  >
                    Inspect Credential <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
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
