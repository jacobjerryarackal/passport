"use client";

import React, { useEffect, useState } from "react";
import { AppHeader } from "@/components/layout/app-header";
import {
  Layers,
  Search,
  CheckCircle2,
  Clock,
  Download,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Bot,
  CreditCard,
  FileCheck,
} from "lucide-react";
import { formatDate, truncateHash } from "@/lib/utils";

interface EvidenceItem {
  id: string;
  disputeId: string;
  type: string;
  title: string;
  description: string;
  status: string;
  source: string;
  hash: string;
  createdAt: string;
  dispute?: {
    paypalDisputeId: string;
    purchase: {
      amount: number;
      currency: string;
      paypalOrderId: string;
    };
  };
}

export default function EvidenceTimelinePage() {
  const [items, setItems] = useState<EvidenceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterSource, setFilterSource] = useState("ALL");

  const fetchEvidence = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/evidence");
      const json = await res.json();
      if (json.evidenceItems) {
        setItems(json.evidenceItems);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvidence();
  }, []);

  const filtered = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.type.toLowerCase().includes(search.toLowerCase()) ||
      item.hash.toLowerCase().includes(search.toLowerCase());

    const matchesSource = filterSource === "ALL" || item.source === filterSource;
    return matchesSearch && matchesSource;
  });

  const exportCSV = () => {
    const header = ["ID", "Title", "Type", "Status", "Source", "SHA256 Hash", "Timestamp"].join(",");
    const rows = filtered.map((e) =>
      [
        e.id,
        `"${e.title}"`,
        e.type,
        e.status,
        e.source,
        e.hash,
        new Date(e.createdAt).toISOString(),
      ].join(",")
    );
    const csvContent = [header, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `passport-evidence-ledger-${Date.now()}.csv`;
    a.click();
  };

  return (
    <>
      <AppHeader
        title="Evidence Timeline Ledger"
        subtitle="Chronological, tamper-evident repository of all verifiable dispute artifacts across mandates."
      />

      <div className="space-y-6">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-3 max-w-lg">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search evidence by title, hash, or type..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="py-2 px-3 rounded-lg border border-border bg-card text-xs text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="ALL">All Sources</option>
              <option value="SYSTEM">System Engine</option>
              <option value="PAYPAL_API">PayPal Sandbox</option>
              <option value="GEMINI_AGENT">Gemini Agent</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchEvidence}
              className="p-2 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-border bg-card hover:bg-muted text-xs font-medium text-foreground transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV Ledger
            </button>
          </div>
        </div>

        {/* AG Grid style Evidence Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Artifact Title &amp; Description</th>
                  <th className="py-3 px-4">Evidence Type</th>
                  <th className="py-3 px-4">Source System</th>
                  <th className="py-3 px-4">Integrity Hash (SHA-256)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      Loading evidence ledger...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      No matching evidence items found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="font-bold text-foreground text-xs">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                          {item.description}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-primary-600 dark:text-primary-400">
                        {item.type}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="fintech-badge bg-muted text-foreground border border-border">
                          {item.source === "PAYPAL_API" ? (
                            <CreditCard className="w-3 h-3 text-primary-500" />
                          ) : item.source === "GEMINI_AGENT" ? (
                            <Bot className="w-3 h-3 text-primary-500" />
                          ) : (
                            <ShieldCheck className="w-3 h-3 text-emerald-500" />
                          )}
                          {item.source}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-muted-foreground">
                        {truncateHash(item.hash, 8, 8)}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="fintech-badge bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          {item.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right text-[11px] text-muted-foreground font-mono">
                        {formatDate(item.createdAt)}
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

