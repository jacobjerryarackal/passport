"use client";

import React, { useEffect, useState } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { FintechButton } from "@/components/ui/fintech-button";
import { StatusPill } from "@/components/ui/status-pill";
import { StateBoundary } from "@/components/ui/state-boundary";
import {
  FileCheck2,
  Plus,
  Sparkles,
  Lock,
  Clock,
  CheckCircle2,
  DollarSign,
  Layers,
  ArrowRight,
  RefreshCw,
  Search,
  X,
  ShieldCheck,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Mandate {
  id: string;
  title: string;
  purpose: string;
  maxAmount: number;
  currency: string;
  allowedCategories: string;
  expiryHours: number;
  expiresAt: string;
  refundPolicy: string;
  status: string;
  rawPrompt?: string;
  createdAt: string;
  purchases: Array<{ id: string; amount: number; status: string }>;
}

export default function MandatesPage() {
  const [mandates, setMandates] = useState<Mandate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // AI Prompt State
  const [nlPrompt, setNlPrompt] = useState(
    "Authorize my AI agent to buy a digital gift card for our client up to $80 valid for 24 hours."
  );
  const [parsing, setParsing] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("Client Appreciation Gift");
  const [purpose, setPurpose] = useState("Client appreciation gift");
  const [maxAmount, setMaxAmount] = useState("80.00");
  const [currency, setCurrency] = useState("USD");
  const [allowedCategories, setAllowedCategories] = useState("digital gift cards");
  const [expiryHours, setExpiryHours] = useState("24");
  const [refundPolicy, setRefundPolicy] = useState(
    "Refund allowed if purchase is incorrect or unauthorized"
  );

  const fetchMandates = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/mandates");
      const data = await res.json();
      if (data.mandates) setMandates(data.mandates);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMandates();
  }, []);

  const handleParsePrompt = async () => {
    if (!nlPrompt.trim()) return;
    setParsing(true);
    try {
      const res = await fetch("/api/mandates/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: nlPrompt }),
      });
      const data = await res.json();
      if (data.parsed) {
        setTitle(data.parsed.title);
        setPurpose(data.parsed.purpose);
        setMaxAmount(data.parsed.maxAmount.toString());
        setCurrency(data.parsed.currency || "USD");
        setAllowedCategories(data.parsed.allowedCategories.join(", "));
        setExpiryHours(data.parsed.expiryHours.toString());
        setRefundPolicy(data.parsed.refundPolicy);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setParsing(false);
    }
  };

  const handleCreateMandate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/mandates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          purpose,
          maxAmount: parseFloat(maxAmount),
          currency,
          allowedCategories: allowedCategories.split(",").map((c) => c.trim()),
          expiryHours: parseInt(expiryHours, 10),
          refundPolicy,
          rawPrompt: nlPrompt,
        }),
      });
      if (res.ok) {
        setShowCreateModal(false);
        fetchMandates();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create mandate");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const filteredMandates = mandates.filter(
    (m) =>
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.allowedCategories.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <AppHeader
        title="Spend Mandates"
        subtitle="Cryptographic authorization boundaries governing autonomous AI agent purchasing powers."
      />

      <div className="space-y-6">
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter mandates by title, purpose, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchMandates}
              className="p-2 rounded-lg border border-border bg-card hover:bg-zinc-800 text-muted-foreground hover:text-foreground transition-colors"
              title="Refresh Mandates"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <FintechButton
              variant="primary"
              size="sm"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="w-4 h-4" />
              New Spend Mandate
            </FintechButton>
          </div>
        </div>

        {/* Mandates Ledger Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/60 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4 font-mono">Mandate &amp; Purpose</th>
                  <th className="py-3.5 px-4 font-mono">Budget Cap</th>
                  <th className="py-3.5 px-4 font-mono">Usage / Spent</th>
                  <th className="py-3.5 px-4 font-mono">Allowed Categories</th>
                  <th className="py-3.5 px-4 font-mono">Expiry</th>
                  <th className="py-3.5 px-4 font-mono">Status</th>
                  <th className="py-3.5 px-4 text-right font-mono">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12">
                      <StateBoundary type="loading" message="Loading active spend mandates..." />
                    </td>
                  </tr>
                ) : filteredMandates.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12">
                      <StateBoundary
                        type="empty"
                        title="No Spend Mandates Found"
                        message="Authorize your first mandate with an enforced budget cap and category limits."
                        actionLabel="Create Mandate"
                        onAction={() => setShowCreateModal(true)}
                      />
                    </td>
                  </tr>
                ) : (
                  filteredMandates.map((mandate) => {
                    const spent = mandate.purchases.reduce(
                      (acc, p) => (p.status !== "FAILED" ? acc + p.amount : acc),
                      0
                    );
                    const usagePercent = Math.min(100, (spent / mandate.maxAmount) * 100);
                    let cats: string[] = [];
                    try {
                      cats = JSON.parse(mandate.allowedCategories);
                    } catch {
                      cats = [mandate.allowedCategories];
                    }

                    return (
                      <tr key={mandate.id} className="hover:bg-zinc-900/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-foreground text-xs">
                            {mandate.title}
                          </div>
                          <div className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                            {mandate.purpose}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono font-bold text-foreground tabular-nums">
                          {formatCurrency(mandate.maxAmount, mandate.currency)}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-semibold text-foreground tabular-nums">
                              {formatCurrency(spent, mandate.currency)}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              ({usagePercent.toFixed(0)}%)
                            </span>
                          </div>
                          <div className="w-24 bg-zinc-800 rounded-full h-1 mt-1.5 overflow-hidden">
                            <div
                              className="bg-primary-500 h-full rounded-full transition-all"
                              style={{ width: `${usagePercent}%` }}
                            />
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1">
                            {cats.map((c, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] font-mono font-medium text-zinc-300 border border-zinc-700/60"
                              >
                                {c}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-muted-foreground text-[11px]">
                          <div className="flex items-center gap-1 font-mono tabular-nums">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            {formatDate(mandate.expiresAt)}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <StatusPill status={mandate.status} />
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <a
                            href={`/purchases?mandateId=${mandate.id}`}
                            className="inline-flex items-center gap-1 text-xs font-medium text-primary-400 hover:underline"
                          >
                            Spend Console <ArrowRight className="w-3 h-3" />
                          </a>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Mandate Modal with Natural Language AI Parser */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-xl max-w-2xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary-500/10 text-primary-400 flex items-center justify-center">
                    <FileCheck2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">
                      Authorize New Spend Mandate
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Set cryptographic boundaries for an autonomous purchasing agent.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-muted-foreground hover:text-foreground text-sm font-semibold p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Natural Language AI Prompt Box */}
              <div className="p-4 rounded-lg bg-zinc-900 border border-border space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-zinc-300">
                    <Sparkles className="w-3.5 h-3.5 text-primary-400" />
                    Gemini Natural Language Mandate Parser
                  </span>
                  <FintechButton
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleParsePrompt}
                    disabled={parsing}
                    className="h-7 text-xs"
                  >
                    {parsing ? "Parsing..." : "Parse with Gemini"}
                  </FintechButton>
                </div>
                <textarea
                  rows={2}
                  value={nlPrompt}
                  onChange={(e) => setNlPrompt(e.target.value)}
                  placeholder="e.g. Authorize my agent to buy a digital gift card for a client, up to $80, valid for 24 hours."
                  className="w-full text-xs p-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              {/* Structured Parameters Form */}
              <form onSubmit={handleCreateMandate} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Mandate Title
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Purpose
                    </label>
                    <input
                      type="text"
                      required
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Maximum Spend Cap ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={maxAmount}
                      onChange={(e) => setMaxAmount(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-border bg-background text-foreground font-mono tabular-nums focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Currency
                    </label>
                    <input
                      type="text"
                      required
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                      className="w-full text-xs p-2.5 rounded-lg border border-border bg-background text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Authorized Categories (comma separated)
                    </label>
                    <input
                      type="text"
                      required
                      value={allowedCategories}
                      onChange={(e) => setAllowedCategories(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary-500"
                      placeholder="e.g. digital gift cards, subscriptions"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Expiry Duration (Hours)
                    </label>
                    <input
                      type="number"
                      required
                      value={expiryHours}
                      onChange={(e) => setExpiryHours(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-border bg-background text-foreground font-mono tabular-nums focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Refund &amp; Dispute Defense Policy
                  </label>
                  <input
                    type="text"
                    required
                    value={refundPolicy}
                    onChange={(e) => setRefundPolicy(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                  <FintechButton
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </FintechButton>
                  <FintechButton
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={creating}
                  >
                    {creating ? "Authorizing Mandate..." : "Authorize Mandate"}
                  </FintechButton>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
