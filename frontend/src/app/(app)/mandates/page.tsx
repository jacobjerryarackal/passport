"use client";

import React, { useEffect, useState } from "react";
import { AppHeader } from "@/components/layout/app-header";
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
        subtitle="Cryptographic authorization boundaries governing AI agent purchase powers."
      />

      <div className="space-y-6">
        {/* Top Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search mandates by title, purpose, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchMandates}
              className="p-2 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold shadow-sm transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              New Spend Mandate
            </button>
          </div>
        </div>

        {/* Mandates Ledger Table (Fintech AG Grid style) */}
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Mandate & Purpose</th>
                  <th className="py-3 px-4">Budget Cap</th>
                  <th className="py-3 px-4">Spent / Usage</th>
                  <th className="py-3 px-4">Allowed Categories</th>
                  <th className="py-3 px-4">Expiry</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      Loading mandates...
                    </td>
                  </tr>
                ) : filteredMandates.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      No mandates found. Click &quot;New Spend Mandate&quot; to authorize your first AI agent budget.
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
                      <tr key={mandate.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3.5 px-4 font-medium">
                          <div className="font-semibold text-foreground text-xs">
                            {mandate.title}
                          </div>
                          <div className="text-[11px] text-muted-foreground line-clamp-1">
                            {mandate.purpose}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                          {formatCurrency(mandate.maxAmount, mandate.currency)}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-semibold text-foreground">
                              {formatCurrency(spent, mandate.currency)}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              ({usagePercent.toFixed(0)}%)
                            </span>
                          </div>
                          <div className="w-24 bg-muted rounded-full h-1 mt-1 overflow-hidden">
                            <div
                              className="bg-primary-600 h-full rounded-full"
                              style={{ width: `${usagePercent}%` }}
                            />
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1">
                            {cats.map((c, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded bg-muted text-[10px] font-mono font-medium text-foreground border border-border"
                              >
                                {c}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-muted-foreground text-[11px]">
                          <div className="flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            {formatDate(mandate.expiresAt)}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`fintech-badge ${
                              mandate.status === "ACTIVE"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                mandate.status === "ACTIVE" ? "bg-emerald-500" : "bg-muted-foreground"
                              }`}
                            />
                            {mandate.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <a
                            href={`/purchases?mandateId=${mandate.id}`}
                            className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline"
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
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white">
                    <FileCheck2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">
                      Authorize New Spend Mandate
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Set cryptographic boundaries for an AI purchasing agent.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-muted-foreground hover:text-foreground text-sm font-semibold p-1"
                >
                  ✕
                </button>
              </div>

              {/* Natural Language AI Prompt Box */}
              <div className="p-4 rounded-xl bg-primary-500/5 border border-primary-500/20 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-primary-700 dark:text-primary-300">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-primary-500" />
                    Gemini Natural Language Mandate Parser
                  </span>
                  <button
                    type="button"
                    onClick={handleParsePrompt}
                    disabled={parsing}
                    className="px-2.5 py-1 rounded-md bg-primary-600 hover:bg-primary-700 text-white text-[11px] font-medium transition-colors disabled:opacity-50"
                  >
                    {parsing ? "Parsing Prompt..." : "Parse with Gemini"}
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={nlPrompt}
                  onChange={(e) => setNlPrompt(e.target.value)}
                  placeholder="e.g. Authorize my agent to buy a digital gift card for a client, up to $80, valid for 24 hours."
                  className="w-full text-xs p-2.5 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                      className="w-full text-xs p-2.5 rounded-lg border border-border bg-card text-foreground"
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
                      className="w-full text-xs p-2.5 rounded-lg border border-border bg-card text-foreground"
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
                      className="w-full text-xs p-2.5 rounded-lg border border-border bg-card text-foreground font-mono"
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
                      className="w-full text-xs p-2.5 rounded-lg border border-border bg-card text-foreground font-mono"
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
                      className="w-full text-xs p-2.5 rounded-lg border border-border bg-card text-foreground"
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
                      className="w-full text-xs p-2.5 rounded-lg border border-border bg-card text-foreground font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Refund & Dispute Policy
                  </label>
                  <input
                    type="text"
                    required
                    value={refundPolicy}
                    onChange={(e) => setRefundPolicy(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-border bg-card text-foreground"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-lg border border-border bg-card hover:bg-muted text-xs font-medium text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-5 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold shadow-sm transition-all hover:scale-[1.02] disabled:opacity-50"
                  >
                    {creating ? "Authorizing Mandate..." : "Authorize Mandate"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

