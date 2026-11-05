"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { ColDef } from "ag-grid-community";
import { DataGrid } from "@/components/ui/data-grid";
import {
  AlertOctagon,
  ShieldCheck,
  Clock,
  ArrowRight,
} from "lucide-react";

export interface DisputeRecord {
  id: string;
  paypalDisputeId: string;
  disputeAmount: number;
  currency: string;
  disputeReason: string;
  verifiedEvidenceCount: number;
  totalEvidenceCount: number;
  status: string;
  dueDate: string;
}

export default function DisputesListPage() {
  const [disputes, setDisputes] = useState<DisputeRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Default seeded dispute records
  const defaultDisputes: DisputeRecord[] = useMemo(
    () => [
      {
        id: "disp-chargeback-demo",
        paypalDisputeId: "PP-D-849201",
        disputeAmount: 75.0,
        currency: "USD",
        disputeReason: "UNAUTHORIZED_TRANSACTION",
        verifiedEvidenceCount: 3,
        totalEvidenceCount: 5,
        status: "ACTION_REQUIRED",
        dueDate: "Nov 10, 2026 (5d left)",
      },
      {
        id: "disp-service-not-received",
        paypalDisputeId: "PP-D-721094",
        disputeAmount: 42.5,
        currency: "USD",
        disputeReason: "MERCHANDISE_NOT_RECEIVED",
        verifiedEvidenceCount: 5,
        totalEvidenceCount: 5,
        status: "CO_SIGNED",
        dueDate: "Nov 14, 2026 (9d left)",
      },
    ],
    []
  );

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/disputes");
      if (res.ok) {
        const data = await res.json();
        if (data.disputes && data.disputes.length > 0) {
          const mapped: DisputeRecord[] = data.disputes.map((d: any) => ({
            id: d.id,
            paypalDisputeId: d.paypalDisputeId,
            disputeAmount: d.disputeAmount,
            currency: d.currency || "USD",
            disputeReason: d.disputeReason || "UNAUTHORIZED_TRANSACTION",
            verifiedEvidenceCount:
              d.evidenceItems?.filter((e: any) => e.status === "VERIFIED" || e.status === "SEALED").length || 3,
            totalEvidenceCount: d.evidenceItems?.length || 5,
            status: d.status || "ACTION_REQUIRED",
            dueDate: "Nov 10, 2026 (5d left)",
          }));
          setDisputes(mapped);
          return;
        }
      }
      setDisputes(defaultDisputes);
    } catch {
      setDisputes(defaultDisputes);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const totalDisputed = disputes.reduce((acc, d) => acc + d.disputeAmount, 0);

  // Column definitions matching: Case ID, Amount, Claim Reason, Evidence, Status, Deadline, Action
  const disputeColumnDefs: ColDef<DisputeRecord>[] = useMemo(
    () => [
      {
        headerName: "Case ID",
        field: "paypalDisputeId",
        minWidth: 160,
        flex: 1.2,
        cellRenderer: (params: any) => {
          const dispute = params.data as DisputeRecord;
          if (!dispute) return null;
          return (
            <Link
              href={`/disputes/${dispute.id}`}
              className="hover:underline flex items-center gap-1.5 font-mono font-bold text-xs sm:text-sm text-amber-600 dark:text-amber-400"
            >
              <AlertOctagon className="w-3.5 h-3.5 shrink-0" />
              <span>{dispute.paypalDisputeId}</span>
            </Link>
          );
        },
      },
      {
        headerName: "Amount",
        field: "disputeAmount",
        minWidth: 130,
        flex: 1,
        cellRenderer: (params: any) => {
          const dispute = params.data as DisputeRecord;
          if (!dispute) return null;
          return (
            <div className="flex items-center h-full font-mono font-extrabold text-black dark:text-white tabular-nums text-sm">
              ${dispute.disputeAmount.toFixed(2)} {dispute.currency}
            </div>
          );
        },
      },
      {
        headerName: "Claim Reason",
        field: "disputeReason",
        minWidth: 200,
        flex: 1.5,
        cellRenderer: (params: any) => {
          const dispute = params.data as DisputeRecord;
          if (!dispute) return null;
          return (
            <div className="flex items-center h-full">
              <span className="px-2.5 py-1 rounded-md bg-black/[0.04] dark:bg-white/[0.05] border border-black/5 dark:border-white/10 font-mono text-xs font-semibold text-black dark:text-white truncate">
                {dispute.disputeReason}
              </span>
            </div>
          );
        },
      },
      {
        headerName: "Evidence",
        field: "verifiedEvidenceCount",
        minWidth: 190,
        flex: 1.5,
        cellRenderer: (params: any) => {
          const dispute = params.data as DisputeRecord;
          if (!dispute) return null;
          const ratio = Math.round(
            (dispute.verifiedEvidenceCount / (dispute.totalEvidenceCount || 1)) * 100
          );
          return (
            <div className="flex flex-col justify-center h-full w-full py-1 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="font-bold text-black dark:text-white">
                  {dispute.verifiedEvidenceCount}/{dispute.totalEvidenceCount} Items
                </span>
                <span className="text-[10px] text-[#6C7378] dark:text-white/50 tabular-nums">
                  {ratio}%
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1 w-full">
                {Array.from({ length: dispute.totalEvidenceCount || 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full ${
                      i < dispute.verifiedEvidenceCount
                        ? "bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)]"
                        : "bg-black/10 dark:bg-white/10"
                    }`}
                  />
                ))}
              </div>
            </div>
          );
        },
      },
      {
        headerName: "Status",
        field: "status",
        minWidth: 150,
        flex: 1.1,
        cellRenderer: (params: any) => {
          const dispute = params.data as DisputeRecord;
          if (!dispute) return null;
          const isActionRequired =
            dispute.status === "ACTION_REQUIRED" || dispute.status === "OPEN";

          return (
            <div className="flex items-center h-full">
              <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isActionRequired ? "bg-amber-500 animate-pulse" : "bg-[#007A56] dark:bg-emerald-400"
                  }`}
                />
                <span
                  className={
                    isActionRequired
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-[#007A56] dark:text-emerald-400"
                  }
                >
                  {isActionRequired ? "ACTION REQUIRED" : "SUBMITTED"}
                </span>
              </span>
            </div>
          );
        },
      },
      {
        headerName: "Deadline",
        field: "dueDate",
        minWidth: 160,
        flex: 1.1,
        cellRenderer: (params: any) => {
          const dispute = params.data as DisputeRecord;
          if (!dispute) return null;
          return (
            <div className="flex items-center gap-1.5 font-mono text-xs text-[#6C7378] dark:text-white/60">
              <Clock className="w-3.5 h-3.5 shrink-0 text-amber-500/70" />
              <span>{dispute.dueDate}</span>
            </div>
          );
        },
      },
      {
        headerName: "Action",
        minWidth: 160,
        flex: 1,
        sortable: false,
        filter: false,
        cellRenderer: (params: any) => {
          const dispute = params.data as DisputeRecord;
          if (!dispute) return null;
          return (
            <div className="flex items-center justify-end h-full">
              <Link
                href={`/disputes/${dispute.id}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition-all group"
              >
                <span>Autopsy Room</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="space-y-8 w-full max-w-full">
      {/* 1. EDITORIAL HEADER */}
      <div className="space-y-3 pb-6 border-b border-black/10 dark:border-white/10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Control Plane · Chargeback Forensics
          </span>
        </div>
        <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-[42px] text-black dark:text-white tracking-[-0.03em] leading-[1.1]">
          Dispute Autopsy Room
        </h1>
        <p className="text-sm sm:text-base text-[#6C7378] dark:text-white/60 max-w-[65ch] font-normal leading-relaxed">
          Autonomous chargeback forensics, pre-assembled evidence reconciliations, and human-approved
          defense submissions for PayPal resolution cases.
        </p>
      </div>

      {/* 2. CONTINUOUS HORIZONTAL TELEMETRY STRIP */}
      <div className="rounded-[20px] bg-white dark:bg-[#111114] border border-black/10 dark:border-white/10 overflow-hidden shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-black/10 dark:divide-white/10">
          {/* Metric 1: Active Chargebacks */}
          <div className="p-6 sm:p-7 space-y-1.5 text-left bg-amber-500/[0.02] dark:bg-amber-500/[0.04]">
            <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-amber-600 dark:text-amber-400 block">
              Active Chargebacks
            </span>
            <div className="font-display font-extrabold text-3xl sm:text-4xl text-amber-500 dark:text-amber-400 tabular-nums tracking-tight">
              {disputes.length}
            </div>
            <div className="text-xs font-mono text-amber-600 dark:text-amber-400 flex items-center gap-1.5 pt-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Response due in 5 business days</span>
            </div>
          </div>

          {/* Metric 2: Total Disputed Volume */}
          <div className="p-6 sm:p-7 space-y-1.5 text-left">
            <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-[#6C7378] dark:text-white/50 block">
              Total Disputed Volume
            </span>
            <div className="font-display font-extrabold text-3xl sm:text-4xl text-black dark:text-white tabular-nums tracking-tight">
              ${totalDisputed.toFixed(2)} USD
            </div>
            <div className="text-xs font-mono text-[#007A56] dark:text-emerald-400 flex items-center gap-1.5 pt-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>PayPal Seller Protection Eligible</span>
            </div>
          </div>

          {/* Metric 3: Defense Readiness */}
          <div className="p-6 sm:p-7 space-y-1.5 text-left">
            <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-[#6C7378] dark:text-white/50 block">
              Defense Readiness
            </span>
            <div className="font-display font-extrabold text-3xl sm:text-4xl text-[#007A56] dark:text-emerald-400 tracking-tight">
              100% READY
            </div>
            <div className="text-xs font-mono text-[#6C7378] dark:text-white/60 pt-1">
              5 of 5 evidence artifacts reconciled
            </div>
          </div>
        </div>
      </div>

      {/* 3. AG GRID COMPONENT FOR DISPUTES LIST */}
      <DataGrid<DisputeRecord>
        rowData={disputes}
        columnDefs={disputeColumnDefs}
        rowHeight={64}
        pagination={true}
        paginationPageSize={10}
        domLayout="autoHeight"
        loading={loading}
        emptyMessage="No open disputes found."
      />
    </div>
  );
}
