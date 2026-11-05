"use client";

import React, { useEffect, useState, useMemo } from "react";
import { ColDef } from "ag-grid-community";
import { DataGrid } from "@/components/ui/data-grid";
import { StatusPill } from "@/components/ui/status-pill";
import { HashInspector } from "@/components/ui/hash-inspector";
import {
  History,
  ShieldCheck,
  ShieldAlert,
  AlertOctagon,
  RefreshCw,
  Search,
  Wrench,
  Bug,
} from "lucide-react";
import { formatDate, truncateHash } from "@/lib/utils";

interface AuditLog {
  id: string;
  mandateId?: string;
  action: string;
  actor: string;
  actorModel?: string;
  details: string;
  eventHash: string;
  parentHash?: string;
  timestamp: string;
}

interface VerificationData {
  isChainIntact: boolean;
  totalEntries: number;
  latestHash: string | null;
  tamperedEntryId?: string | null;
  brokenIndex?: number;
  algorithm?: string;
  verifiedAt: string;
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [verification, setVerification] = useState<VerificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tampering, setTampering] = useState(false);
  const [repairing, setRepairing] = useState(false);
  const [search, setSearch] = useState("");

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/audit");
      const json = await res.json();
      if (json.auditLogs) {
        setLogs(json.auditLogs);
        setVerification(json.verification);
      }
    } catch (err) {
      console.error("Audit log fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleTamperRow = async () => {
    try {
      setTampering(true);
      const res = await fetch("/api/audit/tamper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        await fetchLogs();
      }
    } catch (err) {
      console.error("Tamper error:", err);
    } finally {
      setTampering(false);
    }
  };

  const handleRepairChain = async () => {
    try {
      setRepairing(true);
      const res = await fetch("/api/audit/repair", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        await fetchLogs();
      }
    } catch (err) {
      console.error("Repair error:", err);
    } finally {
      setRepairing(false);
    }
  };

  const filteredLogs = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.actor.toLowerCase().includes(search.toLowerCase()) ||
      l.eventHash.toLowerCase().includes(search.toLowerCase()) ||
      l.details.toLowerCase().includes(search.toLowerCase())
  );

  const auditColumnDefs: ColDef<AuditLog>[] = useMemo(
    () => [
      {
        headerName: "Action & Actor",
        field: "action",
        minWidth: 200,
        flex: 1.5,
        cellRenderer: (params: any) => {
          const log = params.data as AuditLog;
          if (!log) return null;
          const isTampered = log.eventHash.startsWith("TAMPERED_");
          return (
            <div className="flex flex-col justify-center h-full py-1">
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-black dark:text-white text-xs leading-tight">
                  {log.action}
                </span>
                {isTampered && (
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-black text-white bg-rose-600">
                    MUTATED
                  </span>
                )}
              </div>
              <span className="text-[11px] text-[#6C7378] dark:text-white/60">
                Actor: <strong className="text-black dark:text-white">{log.actor}</strong>
              </span>
            </div>
          );
        },
      },
      {
        headerName: "Model / Component",
        field: "actorModel",
        minWidth: 170,
        flex: 1.2,
        cellRenderer: (params: any) => {
          const log = params.data as AuditLog;
          if (!log) return null;
          return (
            <div className="flex items-center h-full font-mono text-[11px] text-[#002991] dark:text-[#60CDFF] truncate">
              {log.actorModel || "system-guard"}
            </div>
          );
        },
      },
      {
        headerName: "Event Details",
        field: "details",
        minWidth: 260,
        flex: 2,
        cellRenderer: (params: any) => {
          const log = params.data as AuditLog;
          if (!log) return null;
          return (
            <div className="flex items-center h-full">
              <span
                className="max-w-[340px] truncate text-[11px] text-[#1D1E20] dark:text-white/80 font-mono"
                title={log.details}
              >
                {log.details}
              </span>
            </div>
          );
        },
      },
      {
        headerName: "Parent Hash → Event Hash",
        field: "eventHash",
        minWidth: 240,
        flex: 1.8,
        cellRenderer: (params: any) => {
          const log = params.data as AuditLog;
          if (!log) return null;
          const isTampered = log.eventHash.startsWith("TAMPERED_");
          return (
            <div className="flex items-center gap-2 h-full font-mono text-[10px] whitespace-nowrap">
              <span className="text-[#6C7378] dark:text-white/50 font-mono">
                {truncateHash(log.parentHash || "ROOT", 6, 4)}
              </span>
              <span className="text-[#6C7378] dark:text-white/40 font-mono">&rarr;</span>
              {isTampered ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold text-rose-500 bg-rose-500/10 border border-rose-500/20">
                  {log.eventHash}
                </span>
              ) : (
                <HashInspector hash={log.eventHash} truncateLength={6} />
              )}
            </div>
          );
        },
      },
      {
        headerName: "Timestamp",
        field: "timestamp",
        minWidth: 160,
        flex: 1.1,
        cellRenderer: (params: any) => {
          const log = params.data as AuditLog;
          if (!log) return null;
          return (
            <div className="flex items-center justify-end h-full font-mono text-[11px] text-[#6C7378] dark:text-white/60 tabular-nums whitespace-nowrap">
              {formatDate(log.timestamp)}
            </div>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="space-y-8 w-full max-w-full">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-black/10 dark:border-white/10">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${verification?.isChainIntact === false ? "bg-rose-500" : "bg-[#007A56] dark:bg-emerald-400"} animate-pulse`} />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#002991] dark:text-[#60CDFF]">
              Cryptographic Audit Chain · Merkle Ledger &amp; Ed25519 Attestations
            </span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-[42px] text-black dark:text-white tracking-[-0.03em] leading-[1.1]">
            Tamper-Evident Audit Ledger
          </h1>
          <p className="text-sm sm:text-base text-[#6C7378] dark:text-white/60 max-w-[65ch] font-normal leading-relaxed">
            Cryptographically chained event ledger logging every mandate authorization, agent proposal,
            PayPal sandbox transaction, and chargeback defense event with Ed25519 digital signatures.
          </p>
        </div>

        {/* Live Merkle Tampering Testing Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleTamperRow}
            disabled={tampering}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500 hover:text-white border border-rose-500/20 shadow-xs transition-all active:scale-[0.98]"
          >
            <Bug className="w-3.5 h-3.5" />
            <span>{tampering ? "Tampering..." : "Tamper with Row"}</span>
          </button>

          <button
            type="button"
            onClick={handleRepairChain}
            disabled={repairing}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 shadow-xs transition-all active:scale-[0.98]"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>{repairing ? "Repairing..." : "Repair Chain"}</span>
          </button>

          <button
            type="button"
            onClick={fetchLogs}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-[#002991] dark:text-[#60CDFF] bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 transition-all shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Verify</span>
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Verification Status Banner / Merkle Broken Alert */}
        {verification?.isChainIntact === false ? (
          <div className="p-6 rounded-2xl border-2 border-rose-500/40 bg-rose-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-in fade-in duration-300">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-3 py-0.5 rounded-full text-xs font-mono font-black text-white bg-rose-600 tracking-wider">
                    MERKLE CHAIN BROKEN
                  </span>
                  <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
                    Cryptographic Hash Mismatch Detected
                  </span>
                </div>
                <p className="text-sm font-bold text-rose-900 dark:text-rose-100 font-sans">
                  Parent hash linkage discrepancy identified at entry #{verification.tamperedEntryId || "MID-CHAIN"}.
                </p>
                <p className="text-xs text-rose-800/80 dark:text-rose-200/80 font-mono mt-0.5">
                  The sequential SHA-256 hash does not match computed event content. Click &ldquo;Repair Chain&rdquo; to recompute and re-anchor integrity.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRepairChain}
              disabled={repairing}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-display font-black text-white bg-rose-600 hover:bg-rose-700 shadow-md transition-all shrink-0 active:scale-[0.98]"
            >
              <Wrench className="w-4 h-4" />
              <span>Repair &amp; Re-anchor Chain</span>
            </button>
          </div>
        ) : (
          <div className="p-5 rounded-2xl border border-emerald-500/25 bg-white dark:bg-[#111114] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-[#007A56] dark:text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-black dark:text-white">
                    Merkle Hash Chain Integrity
                  </h3>
                  <StatusPill status="approved" label="100% INTACT" />
                </div>
                <p className="text-xs text-[#6C7378] dark:text-white/60 mt-0.5">
                  All {logs.length} logged actions are cryptographically bound to their sequential parent hashes using SHA-256 and verified Ed25519 signatures.
                </p>
              </div>
            </div>

            <div className="text-right hidden sm:block">
              <span className="text-[10px] font-mono text-[#6C7378] block">Attestation Algorithm</span>
              <span className="text-xs font-mono font-bold text-[#002991] dark:text-[#60CDFF]">
                Ed25519 + SHA-256 Merkle Chain
              </span>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-[#6C7378] dark:text-white/50 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search audit records by action, actor, or hash..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-full border border-black/10 dark:border-white/10 bg-white dark:bg-[#111114] text-xs text-black dark:text-white placeholder:text-[#6C7378] dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#60CDFF]/30 transition-all"
          />
        </div>

        {/* AG GRID COMPONENT FOR CRYPTOGRAPHIC AUDIT STREAM */}
        <DataGrid<AuditLog>
          rowData={filteredLogs}
          columnDefs={auditColumnDefs}
          rowHeight={64}
          pagination={true}
          paginationPageSize={10}
          domLayout="autoHeight"
          loading={loading}
          emptyMessage="No matching cryptographic audit records found."
        />
      </div>
    </div>
  );
}
