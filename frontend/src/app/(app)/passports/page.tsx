import prisma from "@/server/db/prisma";
import Link from "next/link";
import { AppHeader } from "@/components/layout/app-header";
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
import { formatCurrency, formatDate, truncateHash } from "@/lib/utils";

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {passports.map((passport) => {
            const hasDispute = passport.purchase.disputes.length > 0;
            return (
              <div
                key={passport.id}
                className="fintech-card flex flex-col justify-between border-border hover:border-primary/40 group transition-all"
              >
                <div>
                  {/* Passport Badge Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-primary-600 text-white flex items-center justify-center">
                        <ScrollText className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-mono text-xs font-bold text-foreground">
                        {passport.passportNumber}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                        hasDispute
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                          : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      }`}
                    >
                      {hasDispute ? "DISPUTED" : passport.status}
                    </span>
                  </div>

                  {/* Body Info */}
                  <div className="mt-4 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-mono font-bold text-base text-foreground">
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
                      <span className="font-bold text-emerald-500 font-mono">
                        {passport.disputeReadinessScore}/100
                      </span>
                    </div>

                    <div className="flex items-center justify-between font-mono text-[11px]">
                      <span className="text-muted-foreground">SHA-256 Hash:</span>
                      <span className="text-primary-500">
                        {truncateHash(passport.passportHash, 6, 6)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-border flex items-center justify-between text-xs">
                  <span className="text-muted-foreground text-[11px]">
                    Issued {formatDate(passport.issuedAt)}
                  </span>
                  <Link
                    href={`/passports/${passport.id}`}
                    className="inline-flex items-center gap-1 font-semibold text-primary-600 dark:text-primary-400 group-hover:underline"
                  >
                    Inspect Passport <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
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

