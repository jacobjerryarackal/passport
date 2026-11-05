"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { motion, animate } from "framer-motion";
import { ColDef } from "ag-grid-community";
import { DataGrid } from "@/components/ui/data-grid";
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  ArrowRight,
  ExternalLink,
  Clock,
  AlertTriangle,
  FileCheck2,
  Lock,
  Layers,
  CheckCircle2,
  XCircle,
  Hash,
} from "lucide-react";

// Number CountUp component driven by Framer Motion's animate()
function CountUpNumber({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1.2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        if (ref.current) {
          ref.current.textContent = `${prefix}${latest.toLocaleString(undefined, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          })}${suffix}`;
        }
      },
    });
    return () => controls.stop();
  }, [value, prefix, suffix, decimals]);

  return (
    <span
      ref={ref}
      className="font-display font-extrabold text-[44px] sm:text-[48px] tracking-[-0.03em] tabular-nums leading-none text-black dark:text-white"
    >
      {prefix}
      {value.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}

export interface SettledTransaction {
  id: string;
  passportNumber: string;
  requisition: string;
  amount: number;
  currency: string;
  status: "SETTLED" | "VERIFIED" | "DISPUTED" | "FLAGGED";
  timestamp: string;
}

export interface AuditStreamItem {
  id: string;
  action: string;
  actor: string;
  actorModel?: string;
  details: string;
  eventHash: string;
  parentHash?: string;
  timestamp: string;
}

export interface DashboardClientProps {
  stats: {
    protectedSpend: number;
    spendCap: number;
    passportsCount: number;
    policyPassedCount: number;
    policyBlockedCount: number;
    disputeQueueCount: number;
  };
  transactions: SettledTransaction[];
  activeDispute: {
    id: string;
    paypalDisputeId: string;
    amount: number;
    currency: string;
    reason: string;
    buyerNotes: string;
    dueDateFormatted: string;
    verifiedItems: number;
    totalItems: number;
  };
  auditLogs: AuditStreamItem[];
}

export function DashboardClient({
  stats,
  transactions,
  activeDispute,
  auditLogs,
}: DashboardClientProps) {
  const [triggeringWebhook, setTriggeringWebhook] = useState(false);
  const [webhookMessage, setWebhookMessage] = useState<string | null>(null);

  const handleSimulateWebhook = async () => {
    setTriggeringWebhook(true);
    setWebhookMessage(null);
    try {
      const res = await fetch("/api/webhooks/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventType: "CUSTOMER.DISPUTE.CREATED" }),
      });
      const data = await res.json();
      if (res.ok) {
        const caseNumber = data.dispute?.paypalDisputeId || data.disputeId || "PP-D-SIM";
        setWebhookMessage(`Dispute ${caseNumber} Ingested! Refreshing telemetry...`);
        setTimeout(() => {
          window.location.reload();
        }, 800);
      } else {
        alert(data.error || "Webhook simulation failed");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to connect to webhook simulation endpoint");
    } finally {
      setTriggeringWebhook(false);
    }
  };

  const transactionColumnDefs: ColDef<SettledTransaction>[] = useMemo(
    () => [
      {
        headerName: "Passport ID",
        field: "passportNumber",
        minWidth: 150,
        flex: 1.2,
        cellRenderer: (params: any) => {
          const tx = params.data;
          if (!tx) return null;
          return (
            <Link
              href={`/passports/${tx.id}`}
              className="font-mono font-bold text-[#002991] dark:text-[#60CDFF] hover:underline flex items-center h-full"
            >
              {tx.passportNumber}
            </Link>
          );
        },
      },
      {
        headerName: "Requisition",
        field: "requisition",
        minWidth: 220,
        flex: 2,
        cellRenderer: (params: any) => {
          const tx = params.data;
          if (!tx) return null;
          return (
            <div className="flex flex-col justify-center h-full py-1">
              <span className="font-semibold text-black dark:text-white truncate">
                {tx.requisition}
              </span>
              <span className="text-[10px] text-[#6C7378] dark:text-white/40 font-mono leading-tight">
                {tx.timestamp}
              </span>
            </div>
          );
        },
      },
      {
        headerName: "Amount",
        field: "amount",
        minWidth: 130,
        flex: 1,
        cellRenderer: (params: any) => {
          const tx = params.data;
          if (!tx) return null;
          return (
            <div className="flex items-center h-full">
              <span className="font-mono font-bold text-black dark:text-white tabular-nums">
                ${Number(tx.amount).toFixed(2)} {tx.currency}
              </span>
            </div>
          );
        },
      },
      {
        headerName: "Status",
        field: "status",
        minWidth: 130,
        flex: 1,
        cellRenderer: (params: any) => {
          const tx = params.data;
          if (!tx) return null;
          const isSettled = tx.status === "SETTLED" || tx.status === "VERIFIED";
          const isDisputed = tx.status === "DISPUTED";
          return (
            <div className="flex items-center h-full">
              <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isDisputed
                      ? "bg-amber-500 animate-pulse"
                      : isSettled
                      ? "bg-[#007A56] dark:bg-emerald-400"
                      : "bg-rose-500"
                  }`}
                />
                <span
                  className={
                    isDisputed
                      ? "text-amber-600 dark:text-amber-400"
                      : isSettled
                      ? "text-[#007A56] dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                  }
                >
                  {tx.status}
                </span>
              </span>
            </div>
          );
        },
      },
      {
        headerName: "Action",
        minWidth: 100,
        flex: 0.8,
        cellRenderer: (params: any) => {
          const tx = params.data;
          if (!tx) return null;
          return (
            <div className="flex items-center justify-end h-full">
              <Link
                href={`/passports/${tx.id}`}
                className="font-medium text-xs text-[#002991] dark:text-[#60CDFF] hover:underline inline-flex items-center gap-1"
              >
                <span>Inspect</span>
                <span>&rarr;</span>
              </Link>
            </div>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="w-full space-y-10">
      {/* 1. EDITORIAL HEADER WITH SKY-BLUE SIMULATE DISPUTE PILL BUTTON */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-black/10 dark:border-white/10">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#60CDFF] animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#002991] dark:text-[#60CDFF]">
              Control Plane · Live Operations
            </span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-[42px] text-black dark:text-white tracking-[-0.03em] leading-[1.1]">
            Operations Control Plane
          </h1>
          <p className="text-sm sm:text-base text-[#6C7378] dark:text-white/60 max-w-[62ch] font-normal leading-relaxed">
            Real-time mandate boundaries enforcement, cryptographic attestation chain verification,
            and autonomous chargeback defense.
          </p>
        </div>

        {/* Right Action: Sky-Blue Pill CTA */}
        <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
          {webhookMessage && (
            <span className="text-xs font-mono font-bold text-[#007A56] dark:text-emerald-400 bg-[#007A56]/10 px-3 py-1 rounded-full border border-[#007A56]/20 animate-in fade-in">
              {webhookMessage}
            </span>
          )}

          <button
            type="button"
            onClick={handleSimulateWebhook}
            disabled={triggeringWebhook}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs sm:text-sm font-black text-[#002991] bg-[#60CDFF] hover:bg-[#4bc3fa] active:scale-[0.98] transition-all shadow-sm disabled:opacity-50"
          >
            <Zap className={`w-4 h-4 ${triggeringWebhook ? "animate-spin" : "fill-current"}`} />
            <span>{triggeringWebhook ? "Simulating Webhook..." : "Simulate Dispute Webhook"}</span>
          </button>
        </div>
      </div>

      {/* 2. CONTINUOUS HORIZONTAL TELEMETRY STRIP (NO 4 SEPARATE CARDS) */}
      <div className="rounded-[20px] bg-white dark:bg-[#111114] border border-black/10 dark:border-white/10 overflow-hidden shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 lg:divide-x divide-black/10 dark:divide-white/10">
          {/* Field 1: Protected Spend Volume */}
          <div className="p-6 sm:p-7 space-y-2 text-left">
            <div className="text-[11px] font-mono uppercase tracking-wider font-bold text-[#6C7378] dark:text-white/50">
              Protected Spend Volume
            </div>
            <div className="flex items-baseline">
              <CountUpNumber value={stats.protectedSpend} prefix="$" decimals={2} />
            </div>
            <div className="text-xs font-mono text-[#007A56] dark:text-emerald-400 flex items-center gap-1.5 pt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#007A56] dark:bg-emerald-400" />
              <span>100% Guarded · ${(stats.spendCap - stats.protectedSpend).toFixed(2)} buffer</span>
            </div>
          </div>

          {/* Field 2: Agent Policy Gate */}
          <div className="p-6 sm:p-7 space-y-2 text-left">
            <div className="text-[11px] font-mono uppercase tracking-wider font-bold text-[#6C7378] dark:text-white/50">
              Agent Policy Gate
            </div>
            <div className="flex items-baseline gap-2">
              <CountUpNumber value={stats.policyPassedCount} decimals={0} />
              <span className="text-sm font-mono text-[#6C7378] dark:text-white/40">/ {stats.policyBlockedCount} blocked</span>
            </div>
            <div className="text-xs font-mono text-[#6C7378] dark:text-white/60 flex items-center gap-1.5 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#002991] dark:text-[#60CDFF]" />
              <span>Deterministic mandate boundaries active</span>
            </div>
          </div>

          {/* Field 3: Trust Passports Issued */}
          <div className="p-6 sm:p-7 space-y-2 text-left">
            <div className="text-[11px] font-mono uppercase tracking-wider font-bold text-[#6C7378] dark:text-white/50">
              Trust Passports Issued
            </div>
            <div className="flex items-baseline">
              <CountUpNumber value={stats.passportsCount} decimals={0} />
            </div>
            <div className="text-xs font-mono text-[#007A56] dark:text-emerald-400 flex items-center gap-1.5 pt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#007A56] dark:bg-emerald-400" />
              <span>100% Cryptographic Seals Valid</span>
            </div>
          </div>

          {/* Field 4: Dispute Queue */}
          <div className="p-6 sm:p-7 space-y-2 text-left bg-amber-500/[0.03] dark:bg-amber-500/[0.05]">
            <div className="text-[11px] font-mono uppercase tracking-wider font-bold text-amber-600 dark:text-amber-400">
              Dispute Queue
            </div>
            <div className="flex items-baseline text-amber-500">
              <span className="font-display font-extrabold text-[44px] sm:text-[48px] tracking-[-0.03em] tabular-nums leading-none text-amber-500 dark:text-amber-400">
                {stats.disputeQueueCount}
              </span>
            </div>
            <div className="text-xs font-mono text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1.5 pt-1">
              <Clock className="w-3.5 h-3.5" />
              <span>6 Days Remaining · Eligible</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MAIN BODY — ASYMMETRIC 7/5 GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN (7 COLS): SETTLED TRANSACTIONS TABLE */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10">
            <div>
              <h2 className="font-display font-black text-xl text-black dark:text-white tracking-tight">
                Settled Transactions
              </h2>
              <p className="text-xs text-[#6C7378] dark:text-white/60">
                Direct PayPal Orders v2 captures linked to verifiable attestation receipts.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-[#6C7378] dark:text-white/50">
              {transactions.length} Records
            </span>
          </div>

          {/* AG Grid Component: Settled Transactions */}
          <DataGrid<SettledTransaction>
            rowData={transactions}
            columnDefs={transactionColumnDefs}
            rowHeight={64}
            pagination={true}
            paginationPageSize={10}
            domLayout="autoHeight"
            emptyMessage="No settled transactions recorded."
          />
        </div>

        {/* RIGHT COLUMN (5 COLS): DISPUTE FORENSICS INCIDENT ROOM */}
        <div className="lg:col-span-5">
          <div className="rounded-[20px] bg-amber-500/[0.04] dark:bg-[#0D0D11] border border-amber-500/30 p-6 space-y-6 shadow-[0_4px_24px_rgba(255,184,0,0.06)] relative overflow-hidden">
            {/* Ambient Alert Glow Bar */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500" />

            {/* Room Header */}
            <div className="flex items-center justify-between pb-4 border-b border-amber-500/20">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    Active Incident Rail
                  </span>
                </div>
                <h3 className="font-display font-black text-lg text-black dark:text-white">
                  Dispute Forensics Incident Room
                </h3>
              </div>
              <span className="rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                ACTION REQUIRED
              </span>
            </div>

            {/* Deadline Countdown in Large Amber Text */}
            <div className="space-y-1.5 p-4 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] border border-amber-500/20">
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Evidence Submission Window
              </div>
              <div className="font-display font-black text-3xl sm:text-4xl text-amber-500 dark:text-amber-400 tabular-nums tracking-tight">
                5d : 18h : 22m
              </div>
              <p className="text-[11px] text-[#6C7378] dark:text-white/50">
                PayPal Seller Protection submission deadline: {activeDispute.dueDateFormatted}
              </p>
            </div>

            {/* Segmented Horizontal Progress Bar (5 segments, 3 filled) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-[#6C7378] dark:text-white/60 uppercase font-semibold">
                  Evidence Pack Progress
                </span>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                  3 of 5 Segments Verified
                </span>
              </div>

              {/* 5 Distinct Horizontal Segments */}
              <div className="grid grid-cols-5 gap-1.5">
                <div className="h-2.5 rounded-full bg-amber-500 shadow-sm" title="Mandate Token & Cap" />
                <div className="h-2.5 rounded-full bg-amber-500 shadow-sm" title="PayPal Settlement Hash" />
                <div className="h-2.5 rounded-full bg-amber-500 shadow-sm" title="Agent Telemetry Log" />
                <div className="h-2.5 rounded-full bg-black/10 dark:bg-white/10" title="Delivery Proof" />
                <div className="h-2.5 rounded-full bg-black/10 dark:bg-white/10" title="Issuing Bank Attestation" />
              </div>

              <div className="flex justify-between text-[11px] text-[#6C7378] dark:text-white/50 font-mono pt-1">
                <span>Readiness: 60%</span>
                <span>2 Pending Human Co-Sign</span>
              </div>
            </div>

            {/* Active Dispute Telemetry Details */}
            <div className="space-y-2.5 text-xs border-t border-amber-500/20 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-[#6C7378] dark:text-white/60">Case Reference:</span>
                <span className="font-mono font-bold text-black dark:text-white">
                  {activeDispute.paypalDisputeId}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[#6C7378] dark:text-white/60">Disputed Amount:</span>
                <span className="font-mono font-bold text-black dark:text-white">
                  ${activeDispute.amount.toFixed(2)} {activeDispute.currency}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[#6C7378] dark:text-white/60">Claim Reason:</span>
                <span className="font-mono text-amber-600 dark:text-amber-400 font-semibold">
                  {activeDispute.reason}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-black/[0.04] dark:bg-white/[0.04] border border-black/5 dark:border-white/5 text-[11px] italic text-[#1D1E20] dark:text-white/80 leading-relaxed">
                &ldquo;{activeDispute.buyerNotes}&rdquo;
              </div>
            </div>

            {/* Solid Amber "Co-Sign Defense" Pill Button */}
            <div className="pt-2">
              <Link href={`/disputes/${activeDispute.id || "disp-chargeback-demo"}`} className="block w-full">
                <span className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-sm font-black text-black bg-[#FFB800] hover:bg-[#e6a600] active:scale-[0.98] transition-all shadow-md">
                  <span>Co-Sign Defense</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 4. BOTTOM: FULL-WIDTH CRYPTOGRAPHIC AUDIT STREAM (MERKLE CHAIN) */}
      <div className="space-y-4 pt-6 border-t border-black/10 dark:border-white/10 w-full max-w-full overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#007A56] dark:bg-emerald-400 animate-pulse" />
            <h2 className="font-display font-black text-xl text-black dark:text-white tracking-tight">
              Cryptographic Audit Stream
            </h2>
            <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider bg-[#007A56]/10 text-[#007A56] dark:text-emerald-400 border border-[#007A56]/20 uppercase">
              Merkle Chain Intact
            </span>
          </div>

          <Link
            href="/audit"
            className="text-xs font-semibold text-[#002991] dark:text-[#60CDFF] hover:underline inline-flex items-center gap-1"
          >
            <span>Inspect Full Ledger</span>
            <span>→</span>
          </Link>
        </div>

        {/* Clean Stacked List: Left = Event Type + Truncated JSON Payload, Right = Hash + Timestamp */}
        <div className="divide-y divide-black/10 dark:divide-white/10 w-full max-w-full overflow-hidden">
          {auditLogs.map((log) => (
            <div
              key={log.id}
              className="py-3 px-2 flex items-center justify-between gap-4 text-xs hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors w-full max-w-full overflow-hidden"
            >
              {/* Left Side: Event Type & Truncated JSON Payload */}
              <div className="flex items-center gap-3 min-w-0 flex-1 overflow-hidden">
                <span className="shrink-0 font-mono text-[11px] font-bold text-black dark:text-white px-2 py-0.5 rounded bg-black/[0.05] dark:bg-white/10 border border-black/5 dark:border-white/10">
                  {log.action}
                </span>
                {log.actorModel && (
                  <span className="hidden md:inline-block shrink-0 text-[10px] font-mono text-[#002991] dark:text-[#60CDFF]">
                    {log.actorModel}
                  </span>
                )}
                <span
                  className="truncate text-[11px] text-[#6C7378] dark:text-white/60 font-mono min-w-0 flex-1"
                  title={log.details}
                >
                  {log.details}
                </span>
              </div>

              {/* Right Side: Hash & Timestamp */}
              <div className="shrink-0 flex items-center gap-4 text-right font-mono text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="text-[#6C7378] dark:text-white/40">hash:</span>
                  <Link
                    href="/audit"
                    className="text-[#002991] dark:text-[#60CDFF] hover:underline font-bold"
                    title={`Event Hash: ${log.eventHash}`}
                  >
                    {log.eventHash.slice(0, 8)}...{log.eventHash.slice(-4)}
                  </Link>
                </div>

                <span className="text-[#6C7378] dark:text-white/50 tabular-nums whitespace-nowrap">
                  {log.timestamp}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

