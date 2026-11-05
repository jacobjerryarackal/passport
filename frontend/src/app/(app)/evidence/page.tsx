"use client";

import React, { useEffect, useState, useMemo } from "react";
import { ColDef } from "ag-grid-community";
import { DataGrid } from "@/components/ui/data-grid";
import {
  Search,
  RefreshCw,
  Download,
  ShieldCheck,
  Bot,
  CreditCard,
  Copy,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

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

const defaultEvidenceItems: EvidenceItem[] = [
  {
    id: "evi-tls-notary-902",
    disputeId: "disp-pp-882190",
    type: "TLS_SESSION_PROOF",
    title: "TLS Notary Session Key Exchange Attestation",
    description: "Cryptographic proof of HTTPS handshake with merchant gift card fulfillment endpoint",
    status: "SEALED",
    source: "SYSTEM",
    hash: "0x89f4b7a21cd6804e1329ff08da22c54bc90a887b",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    dispute: {
      paypalDisputeId: "PP-D-882190",
      purchase: {
        amount: 80.0,
        currency: "USD",
        paypalOrderId: "ORD-99120",
      },
    },
  },
  {
    id: "evi-agent-chain-441",
    disputeId: "disp-pp-882190",
    type: "AGENT_REASONING_TRACE",
    title: "Gemini 1.5 Pro Execution Reasoning Graph",
    description: "Deterministic trace logs confirming mandate policy boundary adherence prior to dispatch",
    status: "SEALED",
    source: "GEMINI_AGENT",
    hash: "0x3e18a902bf87410099cd32ab91fe302cba897611",
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    dispute: {
      paypalDisputeId: "PP-D-882190",
      purchase: {
        amount: 80.0,
        currency: "USD",
        paypalOrderId: "ORD-99120",
      },
    },
  },
  {
    id: "evi-pp-order-capture-119",
    disputeId: "disp-pp-882190",
    type: "PAYPAL_WEBHOOK_DIGEST",
    title: "PayPal Orders v2 Order Capture Confirmation",
    description: "Webhook SHA-256 payload digest verified against PayPal signing certificate authority",
    status: "VERIFIED",
    source: "PAYPAL_API",
    hash: "0xbc5578a109fe82674319ffea097103ca78b87162",
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    dispute: {
      paypalDisputeId: "PP-D-882190",
      purchase: {
        amount: 80.0,
        currency: "USD",
        paypalOrderId: "ORD-99120",
      },
    },
  },
  {
    id: "evi-receipt-merkle-332",
    disputeId: "disp-pp-441092",
    type: "MERKLE_RECEIPT_LEAF",
    title: "Merchant Electronic Delivery Voucher & Merkle Leaf",
    description: "Signed leaf commitment in Passport Ledger Root 0x77c2b confirming zero non-receipt",
    status: "SEALED",
    source: "SYSTEM",
    hash: "0x77c2b55a01bc89fe42398da1c54b3309aef88210",
    createdAt: new Date(Date.now() - 3600000 * 14).toISOString(),
    dispute: {
      paypalDisputeId: "PP-D-441092",
      purchase: {
        amount: 150.0,
        currency: "USD",
        paypalOrderId: "ORD-44910",
      },
    },
  },
  {
    id: "evi-mandate-cosign-011",
    disputeId: "disp-pp-441092",
    type: "MANDATE_PRE_COMMIT",
    title: "Mandate ECDSA Spend Signature Authorization",
    description: "Hardware token signing envelope bound to maxBudget $150.00 and category restrictions",
    status: "VERIFIED",
    source: "SYSTEM",
    hash: "0x12bb9930fca56641e78044bc4892ca88019ab723",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    dispute: {
      paypalDisputeId: "PP-D-441092",
      purchase: {
        amount: 150.0,
        currency: "USD",
        paypalOrderId: "ORD-44910",
      },
    },
  },
];

function HashCell({ hash }: { hash: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const truncated =
    hash.length > 20 ? `${hash.slice(0, 10)}...${hash.slice(-8)}` : hash;

  return (
    <div className="flex items-center gap-2">
      <code className="font-mono text-[11px] text-black/80 dark:text-white/80 bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded border border-black/5 dark:border-white/10 select-all tracking-tight">
        {truncated}
      </code>
      <button
        type="button"
        onClick={handleCopy}
        className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 text-[#6C7378] dark:text-white/40 hover:text-black dark:hover:text-white transition-colors"
        title={copied ? "Copied to clipboard" : "Copy full hash"}
        aria-label="Copy full hash"
      >
        {copied ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-[#007A56] dark:text-[#60CDFF]" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
      </button>
    </div>
  );
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
      if (json.evidenceItems && json.evidenceItems.length > 0) {
        setItems(json.evidenceItems);
      } else {
        setItems(defaultEvidenceItems);
      }
    } catch (err) {
      console.error("Failed to fetch evidence, using fallback data:", err);
      setItems(defaultEvidenceItems);
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
    const header = [
      "ID",
      "Title",
      "Type",
      "Status",
      "Source",
      "SHA256 Hash",
      "Timestamp",
    ].join(",");
    const rows = filtered.map((e) =>
      [
        e.id,
        `"${e.title.replace(/"/g, '""')}"`,
        e.type,
        e.status,
        e.source,
        e.hash,
        new Date(e.createdAt).toISOString(),
      ].join(",")
    );
    const csvContent = [header, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `passport-evidence-ledger-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const evidenceColumnDefs: ColDef<EvidenceItem>[] = useMemo(
    () => [
      {
        headerName: "Artifact Title & Description",
        field: "title",
        minWidth: 280,
        flex: 2,
        cellRenderer: (params: any) => {
          const item = params.data as EvidenceItem;
          if (!item) return null;
          return (
            <div className="flex flex-col justify-center h-full py-1">
              <span
                className="font-bold text-black dark:text-white text-xs truncate leading-tight"
                title={item.title}
              >
                {item.title}
              </span>
              <span
                className="text-[11px] text-[#6C7378] dark:text-white/50 truncate max-w-[340px]"
                title={item.description}
              >
                {item.description}
              </span>
            </div>
          );
        },
      },
      {
        headerName: "Evidence Type",
        field: "type",
        minWidth: 170,
        flex: 1.2,
        cellRenderer: (params: any) => {
          const item = params.data as EvidenceItem;
          if (!item) return null;
          return (
            <div className="flex items-center h-full font-mono text-[11px] font-bold text-[#0070BA] dark:text-[#60CDFF] truncate">
              {item.type}
            </div>
          );
        },
      },
      {
        headerName: "Source System",
        field: "source",
        minWidth: 150,
        flex: 1,
        cellRenderer: (params: any) => {
          const item = params.data as EvidenceItem;
          if (!item) return null;
          return (
            <div className="flex items-center h-full">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/5 text-[10px] font-mono font-semibold text-black dark:text-white border border-black/5 dark:border-white/10">
                {item.source === "PAYPAL_API" ? (
                  <CreditCard className="w-3 h-3 text-[#0070BA] dark:text-[#60CDFF]" />
                ) : item.source === "GEMINI_AGENT" ? (
                  <Bot className="w-3 h-3 text-[#007A56] dark:text-[#60CDFF]" />
                ) : (
                  <ShieldCheck className="w-3 h-3 text-[#007A56] dark:text-[#60CDFF]" />
                )}
                {item.source}
              </span>
            </div>
          );
        },
      },
      {
        headerName: "Integrity Hash (SHA-256)",
        field: "hash",
        minWidth: 220,
        flex: 1.5,
        cellRenderer: (params: any) => {
          const item = params.data as EvidenceItem;
          if (!item) return null;
          return (
            <div className="flex items-center h-full">
              <HashCell hash={item.hash} />
            </div>
          );
        },
      },
      {
        headerName: "Status",
        field: "status",
        minWidth: 110,
        flex: 0.8,
        cellRenderer: (params: any) => {
          const item = params.data as EvidenceItem;
          if (!item) return null;
          return (
            <div className="flex items-center h-full">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#007A56] dark:text-[#60CDFF]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#007A56] dark:bg-[#60CDFF]" />
                {item.status}
              </span>
            </div>
          );
        },
      },
      {
        headerName: "Timestamp",
        field: "createdAt",
        minWidth: 140,
        flex: 1,
        cellRenderer: (params: any) => {
          const item = params.data as EvidenceItem;
          if (!item) return null;
          return (
            <div className="flex items-center justify-end h-full text-[11px] text-[#6C7378] dark:text-white/50 font-mono tabular-nums">
              {formatDate(item.createdAt)}
            </div>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="space-y-8 w-full max-w-full">
      {/* 1. TOP EDITORIAL HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-black/10 dark:border-white/10">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#60CDFF] animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#002991] dark:text-[#60CDFF]">
              Cryptographic Repository · Verifiable Artifacts
            </span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-[42px] text-black dark:text-white tracking-[-0.03em] leading-[1.1]">
            Evidence Timeline Ledger
          </h1>
          <p className="text-sm sm:text-base text-[#6C7378] dark:text-white/60 max-w-[65ch] font-normal leading-relaxed">
            Chronological, tamper-evident repository of all verifiable dispute artifacts across mandates.
            Each artifact is anchored with an immutable cryptographic digest for PayPal dispute resolution.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#6C7378] dark:text-white/50 shrink-0">
          <span className="px-3.5 py-1.5 rounded-full border border-black/10 dark:border-white/10 bg-white dark:bg-[#111114]">
            {filtered.length} Artifacts Sealed
          </span>
        </div>
      </div>

      {/* 2. SEARCH & CONTROLS (FLUSH WITH TABLE WIDTH) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 w-full">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#6C7378] dark:text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search evidence by title, hash, type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-black/10 dark:border-white/10 bg-white dark:bg-[#111114] text-xs text-black dark:text-white placeholder:text-[#6C7378] dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#60CDFF]/30 transition-all"
            />
          </div>

          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="py-2.5 px-4 rounded-full border border-black/10 dark:border-white/10 bg-white dark:bg-[#111114] text-xs text-black dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#60CDFF]/30 transition-all cursor-pointer"
          >
            <option value="ALL">All Sources</option>
            <option value="SYSTEM">System Engine</option>
            <option value="PAYPAL_API">PayPal Sandbox</option>
            <option value="GEMINI_AGENT">Gemini Agent</option>
          </select>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
          <button
            type="button"
            onClick={fetchEvidence}
            aria-label="Refresh Ledger"
            title="Refresh Ledger"
            className="w-10 h-10 rounded-full border border-black/10 dark:border-white/10 bg-white dark:bg-[#111114] text-[#1D1E20] dark:text-white flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <RefreshCw
              className={`w-4 h-4 ${loading ? "animate-spin text-[#60CDFF]" : ""}`}
            />
          </button>

          <button
            type="button"
            onClick={exportCSV}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold text-[#002991] dark:text-white bg-[#60CDFF]/20 dark:bg-white/10 hover:bg-[#60CDFF]/30 dark:hover:bg-white/15 border border-[#60CDFF]/40 dark:border-white/15 transition-all shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export RFC 4180 CSV</span>
          </button>
        </div>
      </div>

      {/* 3. AG GRID COMPONENT FOR EVIDENCE TIMELINE */}
      <DataGrid<EvidenceItem>
        rowData={filtered}
        columnDefs={evidenceColumnDefs}
        rowHeight={64}
        pagination={true}
        paginationPageSize={10}
        domLayout="autoHeight"
        loading={loading}
        emptyMessage="No matching evidence artifacts found."
      />
    </div>
  );
}
