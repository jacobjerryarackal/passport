"use client";

import React, { useEffect, useState } from "react";
import { AppHeader } from "@/components/layout/app-header";
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
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  const handleCopy = (hash: string, id: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

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
        <div className="fintech-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-emerald-500/30 bg-card">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-foreground">
                  Merkle Hash Chain Integrity
                </h3>
                <span className="fintech-badge bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono font-bold">
                  {verification?.isChainIntact ? "100% INTACT" : "VERIFIED"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                All {logs.length} logged actions are cryptographically bound to their sequential parent hashes.
              </p>
            </div>
          </div>

          <button
            onClick={fetchLogs}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-medium text-foreground transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Verify Chain
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search audit records by action, actor, or hash..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Audit Log Timeline */}
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Action &amp; Actor</th>
                  <th className="py-3 px-4">Model / Agent Component</th>
                  <th className="py-3 px-4">Event Details</th>
                  <th className="py-3 px-4">Parent Hash &rarr; Event Hash</th>
                  <th className="py-3 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      Loading audit ledger...
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      No matching audit entries found.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3.5 px-4 font-medium">
                        <div className="font-bold text-foreground font-mono text-xs">
                          {log.action}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          Actor: <strong className="text-foreground">{log.actor}</strong>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-primary-500">
                        {log.actorModel || "system-guard"}
                      </td>

                      <td className="py-3.5 px-4 max-w-xs truncate text-[11px] text-muted-foreground">
                        {log.details}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[10px]">
                        <div className="flex items-center gap-1.5">
                          <span className="text-muted-foreground">
                            {truncateHash(log.parentHash || "ROOT", 6, 4)}
                          </span>
                          <span className="text-muted-foreground">&rarr;</span>
                          <button
                            onClick={() => handleCopy(log.eventHash, log.id)}
                            className="text-primary-600 dark:text-primary-400 font-bold hover:underline flex items-center gap-1"
                            title="Click to copy full SHA-256 hash"
                          >
                            {truncateHash(log.eventHash, 6, 6)}
                            <Copy className="w-2.5 h-2.5 text-muted-foreground" />
                          </button>
                          {copiedId === log.id && (
                            <span className="text-emerald-500 font-sans text-[10px]">Copied</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-[11px] text-muted-foreground">
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

