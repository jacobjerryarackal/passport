"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { ColDef } from "ag-grid-community";
import { DataGrid } from "@/components/ui/data-grid";
import {
  FileCheck2,
  Plus,
  Search,
  X,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  ExternalLink,
  Lock,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export interface Mandate {
  id: string;
  title: string;
  purpose: string;
  maxAmount: number;
  currency: string;
  allowedCategories: string; // JSON string or comma-separated
  expiryHours: number;
  expiresAt: string;
  refundPolicy: string;
  status: string; // ACTIVE, EXHAUSTED, EXPIRED
  spentAmount?: number;
  createdAt?: string;
  purchases?: Array<{ id: string; amount: number; status: string }>;
}

export default function MandatesPage() {
  const [mandates, setMandates] = useState<Mandate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states for Create Mandate
  const [title, setTitle] = useState("");
  const [purpose, setPurpose] = useState("");
  const [maxAmount, setMaxAmount] = useState("80.00");
  const [allowedCategories, setAllowedCategories] = useState("digital gift cards, software subscriptions");
  const [expiryHours, setExpiryHours] = useState("24");
  const [creating, setCreating] = useState(false);

  // Default high-end seeded mandates in case DB is fresh
  const defaultMandates: Mandate[] = [
    {
      id: "mnd-client-gift-80",
      title: "Client Appreciation Procurement",
      purpose: "Authorized procurement of digital reward gift cards for quarterly VIP clients",
      maxAmount: 80.0,
      currency: "USD",
      allowedCategories: "digital gift cards",
      expiryHours: 24,
      expiresAt: new Date(Date.now() + 18 * 3600000).toISOString(),
      refundPolicy: "Full refund within 24 hours if unused",
      status: "ACTIVE",
      spentAmount: 75.0, // 93.75% -> triggers amber progress bar
    },
    {
      id: "mnd-gpu-cluster-150",
      title: "AI Inference Cluster Provisioning",
      purpose: "Elastic GPU compute node allocation for batch document dispute parsing",
      maxAmount: 150.0,
      currency: "USD",
      allowedCategories: "cloud compute, gpu instances",
      expiryHours: 48,
      expiresAt: new Date(Date.now() + 36 * 3600000).toISOString(),
      refundPolicy: "Pay-as-you-go per minute allocation",
      status: "ACTIVE",
      spentAmount: 42.5, // 28.3% -> green bar
    },
    {
      id: "mnd-saas-tools-50",
      title: "Developer API Subscriptions",
      purpose: "Monthly recurring sandbox test keys and vector index querying",
      maxAmount: 50.0,
      currency: "USD",
      allowedCategories: "api subscriptions, software",
      expiryHours: 72,
      expiresAt: new Date(Date.now() + 60 * 3600000).toISOString(),
      refundPolicy: "Merchant terms apply",
      status: "ACTIVE",
      spentAmount: 15.0, // 30% -> green bar
    },
    {
      id: "mnd-domain-reg-25",
      title: "Staging Domain Routing",
      purpose: "Automated TLS certificate renewal and sandbox endpoint domain registration",
      maxAmount: 25.0,
      currency: "USD",
      allowedCategories: "domain registration, dns",
      expiryHours: 12,
      expiresAt: new Date(Date.now() - 4 * 3600000).toISOString(),
      refundPolicy: "Non-refundable domain registry policy",
      status: "EXHAUSTED",
      spentAmount: 25.0, // 100% -> amber / red
    },
  ];

  const fetchMandates = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/mandates");
      const data = await res.json();
      if (data.mandates && data.mandates.length > 0) {
        setMandates(data.mandates);
      } else {
        setMandates(defaultMandates);
      }
    } catch (err) {
      console.error("Failed to fetch mandates, falling back to defaults:", err);
      setMandates(defaultMandates);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMandates();
  }, []);

  const handleCreateMandate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    const categoriesArray = allowedCategories
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);

    try {
      const res = await fetch("/api/mandates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title || "Autonomous Agent Spend Mandate",
          purpose: purpose || "Authorized agent commercial operations",
          maxAmount: parseFloat(maxAmount) || 80.0,
          currency: "USD",
          allowedCategories: categoriesArray,
          expiryHours: parseInt(expiryHours, 10) || 24,
          refundPolicy: "Standard refund terms apply",
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setTitle("");
        setPurpose("");
        fetchMandates();
      } else {
        // Fallback local update if API is mock
        const newMandate: Mandate = {
          id: `mnd-${Date.now().toString().slice(-6)}`,
          title: title || "Autonomous Agent Spend Mandate",
          purpose: purpose || "Authorized agent commercial operations",
          maxAmount: parseFloat(maxAmount) || 80.0,
          currency: "USD",
          allowedCategories: JSON.stringify(categoriesArray),
          expiryHours: parseInt(expiryHours, 10) || 24,
          expiresAt: new Date(Date.now() + parseInt(expiryHours, 10) * 3600000).toISOString(),
          refundPolicy: "Standard refund terms apply",
          status: "ACTIVE",
          spentAmount: 0,
        };
        setMandates([newMandate, ...mandates]);
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error("Creation error:", err);
    } finally {
      setCreating(false);
    }
  };

  const filteredMandates = mandates.filter((m) => {
    const q = searchQuery.toLowerCase();
    return (
      m.title.toLowerCase().includes(q) ||
      m.purpose.toLowerCase().includes(q) ||
      m.allowedCategories.toLowerCase().includes(q)
    );
  });

  const mandateColumnDefs: ColDef<Mandate>[] = useMemo(
    () => [
      {
        headerName: "Mandate Name",
        field: "title",
        minWidth: 260,
        flex: 2,
        cellRenderer: (params: any) => {
          const mandate = params.data as Mandate;
          if (!mandate) return null;
          return (
            <div className="flex flex-col justify-center h-full py-1">
              <span className="font-display font-bold text-sm text-black dark:text-white leading-tight">
                {mandate.title}
              </span>
              <span className="text-[11px] text-[#6C7378] dark:text-white/50 truncate max-w-[280px]">
                {mandate.purpose}
              </span>
              <span className="text-[10px] font-mono text-[#002991] dark:text-[#60CDFF] leading-tight">
                #{mandate.id.slice(0, 14)}
              </span>
            </div>
          );
        },
      },
      {
        headerName: "Category",
        field: "allowedCategories",
        minWidth: 160,
        flex: 1.2,
        cellRenderer: (params: any) => {
          const mandate = params.data as Mandate;
          if (!mandate) return null;
          let categoriesClean = mandate.allowedCategories;
          try {
            if (categoriesClean.startsWith("[")) {
              categoriesClean = JSON.parse(categoriesClean).join(", ");
            }
          } catch {}
          return (
            <div className="flex items-center h-full">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider text-[#002991] dark:text-[#60CDFF] bg-[#002991]/5 dark:bg-[#60CDFF]/10 border border-[#002991]/10 dark:border-[#60CDFF]/20 truncate">
                [ {categoriesClean} ]
              </span>
            </div>
          );
        },
      },
      {
        headerName: "Max Budget",
        field: "maxAmount",
        minWidth: 130,
        flex: 1,
        cellRenderer: (params: any) => {
          const mandate = params.data as Mandate;
          if (!mandate) return null;
          return (
            <div className="flex items-center h-full font-mono font-extrabold text-black dark:text-white tabular-nums text-sm">
              ${mandate.maxAmount.toFixed(2)} {mandate.currency}
            </div>
          );
        },
      },
      {
        headerName: "Current Burn",
        field: "spentAmount",
        minWidth: 220,
        flex: 1.6,
        cellRenderer: (params: any) => {
          const mandate = params.data as Mandate;
          if (!mandate) return null;
          let spent = mandate.spentAmount ?? 0;
          if (mandate.purchases && mandate.purchases.length > 0) {
            spent = mandate.purchases.reduce(
              (acc, p) => (p.status !== "FAILED" ? acc + p.amount : acc),
              0
            );
          }
          const burnRatio = mandate.maxAmount > 0 ? (spent / mandate.maxAmount) * 100 : 0;
          const isOver80 = burnRatio >= 80;

          return (
            <div className="flex flex-col justify-center h-full w-full py-1 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-[#6C7378] dark:text-white/60 tabular-nums">
                  ${spent.toFixed(2)} / ${mandate.maxAmount.toFixed(2)}
                </span>
                <span
                  className={`font-bold tabular-nums ${
                    isOver80
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-[#007A56] dark:text-emerald-400"
                  }`}
                >
                  {burnRatio.toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isOver80
                      ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                      : "bg-[#007A56] dark:bg-emerald-400"
                  }`}
                  style={{ width: `${Math.min(100, burnRatio)}%` }}
                />
              </div>
            </div>
          );
        },
      },
      {
        headerName: "Expiry",
        field: "expiresAt",
        minWidth: 150,
        flex: 1.2,
        cellRenderer: (params: any) => {
          const mandate = params.data as Mandate;
          if (!mandate) return null;
          return (
            <div className="flex flex-col justify-center h-full font-mono text-[11px] text-[#6C7378] dark:text-white/60">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#6C7378] dark:text-white/40" />
                <span>{mandate.expiryHours}h validity</span>
              </div>
              <div className="text-[10px] text-[#6C7378] dark:text-white/40 mt-0.5">
                {formatDate(mandate.expiresAt)}
              </div>
            </div>
          );
        },
      },
      {
        headerName: "Status",
        field: "status",
        minWidth: 120,
        flex: 0.9,
        cellRenderer: (params: any) => {
          const mandate = params.data as Mandate;
          if (!mandate) return null;
          let spent = mandate.spentAmount ?? 0;
          if (mandate.purchases && mandate.purchases.length > 0) {
            spent = mandate.purchases.reduce(
              (acc, p) => (p.status !== "FAILED" ? acc + p.amount : acc),
              0
            );
          }
          const burnRatio = mandate.maxAmount > 0 ? (spent / mandate.maxAmount) * 100 : 0;
          const isExhausted = mandate.status === "EXHAUSTED" || burnRatio >= 100;
          const isActive = mandate.status === "ACTIVE";

          return (
            <div className="flex items-center h-full">
              <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isExhausted
                      ? "bg-amber-500"
                      : isActive
                      ? "bg-[#007A56] dark:bg-emerald-400"
                      : "bg-black/30 dark:bg-white/30"
                  }`}
                />
                <span
                  className={
                    isExhausted
                      ? "text-amber-600 dark:text-amber-400"
                      : isActive
                      ? "text-[#007A56] dark:text-emerald-400"
                      : "text-[#6C7378] dark:text-white/50"
                  }
                >
                  {isExhausted ? "EXHAUSTED" : mandate.status}
                </span>
              </span>
            </div>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="space-y-8 w-full max-w-full">
      {/* 1. TOP EDITORIAL HEADER WITH SKY-BLUE PILL BUTTON */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-black/10 dark:border-white/10">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#60CDFF] animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#002991] dark:text-[#60CDFF]">
              Policy Management Console · Pre-Spend Gates
            </span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-[42px] text-black dark:text-white tracking-[-0.03em] leading-[1.1]">
            Spend Mandates
          </h1>
          <p className="text-sm sm:text-base text-[#6C7378] dark:text-white/60 max-w-[65ch] font-normal leading-relaxed">
            Cryptographic authorization boundaries governing autonomous AI agent purchasing powers.
            Every transaction must deterministically prove compliance before payment execution.
          </p>
        </div>

        {/* Sky-Blue Pill Button: Create Mandate */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs sm:text-sm font-black text-[#002991] bg-[#60CDFF] hover:bg-[#4bc3fa] active:scale-[0.98] transition-all shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Create Mandate</span>
        </button>
      </div>

      {/* 2. SEARCH & CONTROLS */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 text-[#6C7378] dark:text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search mandates by title, scope, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-full border border-black/10 dark:border-white/10 bg-white dark:bg-[#111114] text-xs text-black dark:text-white placeholder:text-[#6C7378] dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#60CDFF]/30 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#6C7378] dark:text-white/50">
          <span>{filteredMandates.length} Policies Active</span>
        </div>
      </div>

      {/* 3. AG GRID COMPONENT FOR SPEND MANDATES */}
      <DataGrid<Mandate>
        rowData={filteredMandates}
        columnDefs={mandateColumnDefs}
        rowHeight={64}
        pagination={true}
        paginationPageSize={10}
        domLayout="autoHeight"
        emptyMessage="No spend mandates found matching your query."
      />

      {/* 4. SLEEK THEMED MODAL FOR "CREATE MANDATE" */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#111114] border border-black/10 dark:border-white/15 p-6 sm:p-8 shadow-2xl space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10">
              <div className="space-y-1">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#002991] dark:text-[#60CDFF]">
                  New Authorization Boundary
                </div>
                <h3 className="font-display font-black text-xl text-black dark:text-white">
                  Create Spend Mandate
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full border border-black/10 dark:border-white/15 flex items-center justify-center text-[#6C7378] dark:text-white/60 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateMandate} className="space-y-4 text-left">
              {/* Mandate Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold uppercase text-[#6C7378] dark:text-white/60">
                  Mandate Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VIP Client Gift Procurement"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-black/10 dark:border-white/15 bg-black/[0.02] dark:bg-white/[0.04] text-xs text-black dark:text-white placeholder:text-[#6C7378] dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#60CDFF]/40 font-medium"
                />
              </div>

              {/* Purpose */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold uppercase text-[#6C7378] dark:text-white/60">
                  Business Purpose &amp; Rationale
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Approved incentive for customer retention campaign"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-black/10 dark:border-white/15 bg-black/[0.02] dark:bg-white/[0.04] text-xs text-black dark:text-white placeholder:text-[#6C7378] dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#60CDFF]/40 font-medium"
                />
              </div>

              {/* Amount & Expiry Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold uppercase text-[#6C7378] dark:text-white/60">
                    Max Budget (USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="80.00"
                    value={maxAmount}
                    onChange={(e) => setMaxAmount(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-black/10 dark:border-white/15 bg-black/[0.02] dark:bg-white/[0.04] text-xs text-black dark:text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#60CDFF]/40"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold uppercase text-[#6C7378] dark:text-white/60">
                    Validity (Hours)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="24"
                    value={expiryHours}
                    onChange={(e) => setExpiryHours(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-black/10 dark:border-white/15 bg-black/[0.02] dark:bg-white/[0.04] text-xs text-black dark:text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#60CDFF]/40"
                  />
                </div>
              </div>

              {/* Allowed Categories */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold uppercase text-[#6C7378] dark:text-white/60">
                  Allowed Category Allowlist (Comma Separated)
                </label>
                <input
                  type="text"
                  required
                  placeholder="digital gift cards, software, cloud compute"
                  value={allowedCategories}
                  onChange={(e) => setAllowedCategories(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-black/10 dark:border-white/15 bg-black/[0.02] dark:bg-white/[0.04] text-xs text-black dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-[#60CDFF]/40"
                />
                <p className="text-[10px] text-[#6C7378] dark:text-white/40 font-mono">
                  Any agent call outside these categories will be blocked pre-spend.
                </p>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/10 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-full text-xs font-bold text-[#6C7378] dark:text-white/70 hover:text-black dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-2.5 rounded-full text-xs font-black text-[#002991] bg-[#60CDFF] hover:bg-[#4bc3fa] active:scale-[0.98] transition-all shadow-sm disabled:opacity-50"
                >
                  {creating ? "Minting Mandate..." : "Authorize Mandate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
