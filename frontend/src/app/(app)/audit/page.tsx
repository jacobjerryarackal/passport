"use client";

import React, { useEffect, useState } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { FintechButton } from "@/components/ui/fintech-button";
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
    <>
      <AppHeader
        title="Tamper-Evident Audit Ledger"
        subtitle="Cryptographically chained event ledger logging every mandate, agent proposal, PayPal transaction, and dispute event."
      />

      <div className="space-y-6">
        {/* Verification Status Banner */}
        <div className="fintech-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-emerald-500/25 bg-card">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-foreground">
                  Merkle Hash Chain Integrity
                </h3>
                <StatusPill
                  status="approved"
                  label={verification?.isChainIntact ? "100% INTACT" : "VERIFIED"}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                All {logs.length} logged actions are cryptographically bound to their sequential parent hashes.
              </p>
            </div>
          </div>

          <FintechButton variant="outline" size="sm" onClick={fetchLogs}>
            <RefreshCw className="w-3.5 h-3.5" />
            Verify Chain
          </FintechButton>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search audit records by action, actor, or hash..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>

        {/* Audit Log Timeline */}
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/60 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4 font-mono">Action &amp; Actor</th>
                  <th className="py-3.5 px-4 font-mono">Model / Agent Component</th>
                  <th className="py-3.5 px-4 font-mono">Event Details</th>
                  <th className="py-3.5 px-4 font-mono">Parent Hash &rarr; Event Hash</th>
                  <th className="py-3.5 px-4 text-right font-mono">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12">
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
                    <tr key={log.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-foreground text-xs">
                          {log.action}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          Actor: <strong className="text-zinc-300">{log.actor}</strong>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-primary-400">
                        {log.actorModel || "system-guard"}
                      </td>

                      <td className="py-3.5 px-4 max-w-xs truncate text-[11px] text-zinc-300">
                        {log.details}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[10px]">
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-500">
                            {truncateHash(log.parentHash || "ROOT", 5, 4)}
                          </span>
                          <span className="text-zinc-600">&rarr;</span>
                          <HashInspector hash={log.eventHash} truncateLength={5} />
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-[11px] text-muted-foreground tabular-nums">
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
    </>
  );
}
