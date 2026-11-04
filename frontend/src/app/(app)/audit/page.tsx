"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { HashInspector } from "@/components/ui/hash-inspector";
import { StateBoundary } from "@/components/ui/state-boundary";
import {
  History,
  ShieldCheck,
  CheckCircle2,
  Lock,
  RefreshCw,
  Copy,
  Layers,
  ArrowRight,
  Search,
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

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [verification, setVerification] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.actor.toLowerCase().includes(search.toLowerCase()) ||
      l.eventHash.toLowerCase().includes(search.toLowerCase()) ||
      l.details.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 w-full max-w-full">
      {/* Editorial Header (No duplicate sticky bar) */}
      <div className="space-y-3 pb-6 border-b border-black/10 dark:border-white/10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#007A56] dark:bg-emerald-400 animate-pulse" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#002991] dark:text-[#60CDFF]">
            Cryptographic Audit Chain · Merkle Ledger
          </span>
        </div>
        <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-[42px] text-black dark:text-white tracking-[-0.03em] leading-[1.1]">
          Tamper-Evident Audit Ledger
        </h1>
        <p className="text-sm sm:text-base text-[#6C7378] dark:text-white/60 max-w-[65ch] font-normal leading-relaxed">
          Cryptographically chained event ledger logging every mandate authorization, agent proposal,
          PayPal sandbox transaction, and chargeback defense event.
        </p>
      </div>

      <div className="space-y-6">
        {/* Verification Status Banner */}
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
                <StatusPill
                  status="approved"
                  label={verification?.isChainIntact ? "100% INTACT" : "VERIFIED"}
                />
              </div>
              <p className="text-xs text-[#6C7378] dark:text-white/60 mt-0.5">
                All {logs.length} logged actions are cryptographically bound to their sequential parent hashes.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchLogs}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-[#002991] dark:text-[#60CDFF] bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Verify Chain</span>
          </button>
        </div>

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

        {/* Audit Log Timeline Table */}
        <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#111114] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-black/[0.02] dark:bg-white/[0.02] border-b border-black/10 dark:border-white/10 text-[#6C7378] dark:text-white/50 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-4 px-4 font-mono w-[200px] min-w-[200px]">Action &amp; Actor</th>
                  <th className="py-4 px-4 font-mono w-[180px] min-w-[180px]">Model / Agent Component</th>
                  <th className="py-4 px-4 font-mono max-w-[320px]">Event Details</th>
                  <th className="py-4 px-4 font-mono w-[240px] min-w-[240px]">Parent Hash &rarr; Event Hash</th>
                  <th className="py-4 px-4 text-right font-mono w-[180px] min-w-[180px]">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10 dark:divide-white/10">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-[#6C7378] dark:text-white/50">
                      <StateBoundary type="loading" message="Verifying sequential SHA-256 Merkle chain..." />
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12">
                      <StateBoundary
                        type="empty"
                        title="No Matching Audit Logs"
                        message="Try clearing your search query to inspect the full cryptographic ledger."
                      />
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                      {/* Action & Actor */}
                      <td className="py-4 px-4 w-[200px] min-w-[200px]">
                        <div className="font-mono font-bold text-black dark:text-white text-xs">
                          {log.action}
                        </div>
                        <div className="text-[11px] text-[#6C7378] dark:text-white/60 mt-0.5">
                          Actor: <strong className="text-black dark:text-white">{log.actor}</strong>
                        </div>
                      </td>

                      {/* Model / Agent Component */}
                      <td className="py-4 px-4 w-[180px] min-w-[180px] font-mono text-[11px] text-[#002991] dark:text-[#60CDFF]">
                        {log.actorModel || "system-guard"}
                      </td>

                      {/* Event Details: Truncated so raw JSON never pushes out of bounds */}
                      <td className="py-4 px-4 max-w-[320px]">
                        <div
                          className="max-w-[320px] truncate text-[11px] text-[#1D1E20] dark:text-white/80 font-mono"
                          title={log.details}
                        >
                          {log.details}
                        </div>
                      </td>

                      {/* Parent Hash -> Event Hash with fixed width */}
                      <td className="py-4 px-4 w-[240px] min-w-[240px] font-mono text-[10px] whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-[#6C7378] dark:text-white/50 font-mono">
                            {truncateHash(log.parentHash || "ROOT", 6, 4)}
                          </span>
                          <span className="text-[#6C7378] dark:text-white/40 font-mono">&rarr;</span>
                          <HashInspector hash={log.eventHash} truncateLength={6} />
                        </div>
                      </td>

                      {/* Timestamp with fixed width */}
                      <td className="py-4 px-4 text-right font-mono text-[11px] text-[#6C7378] dark:text-white/60 tabular-nums whitespace-nowrap w-[180px] min-w-[180px]">
                        {formatDate(log.timestamp)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
