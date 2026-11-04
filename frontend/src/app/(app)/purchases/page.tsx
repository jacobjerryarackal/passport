"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bot,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Zap,
  Lock,
  Layers,
  ScrollText,
  Clock,
  Sparkles,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export interface CompliantProposal {
  id: string;
  reqId: string;
  itemName: string;
  category: string;
  amount: number;
  currency: string;
  recipient: string;
  mandateName: string;
  mandateCap: number;
  paypalCaptureId: string;
  passportId: string;
  passportNumber: string;
  timestamp: string;
}

export interface BlockedProposal {
  id: string;
  reqId: string;
  itemName: string;
  category: string;
  amount: number;
  currency: string;
  recipient: string;
  mandateName: string;
  mandateCap: number;
  violationMessage: string;
  violationDetail: string;
  timestamp: string;
}

export default function PurchasesPage() {
  const [testingStatus, setTestingStatus] = useState<string | null>(null);

  // 3 Approved Compliant Proposals
  const compliantProposals: CompliantProposal[] = [
    {
      id: "prop-compl-01",
      reqId: "REQ-9102",
      itemName: "Digital Gift Card $75.00 · Target Corp",
      category: "digital gift cards",
      amount: 75.0,
      currency: "USD",
      recipient: "client-vip-delivery@external.com",
      mandateName: "Client Appreciation Procurement",
      mandateCap: 80.0,
      paypalCaptureId: "CAPTURE-7TY90123L-SB",
      passportId: "pass-giftcard-75",
      passportNumber: "PASS-2026-US",
      timestamp: "Today, 18:29 UTC",
    },
    {
      id: "prop-compl-02",
      reqId: "REQ-9088",
      itemName: "Elastic Cloud GPU Compute (1x H100 Node)",
      category: "cloud compute",
      amount: 42.5,
      currency: "USD",
      recipient: "aws-instance-provisioner@internal.infra",
      mandateName: "AI Inference Cluster Provisioning",
      mandateCap: 150.0,
      paypalCaptureId: "CAPTURE-3LK88120P-SB",
      passportId: "pass-cloud-infra-40",
      passportNumber: "PASS-2026-EU-02",
      timestamp: "Today, 17:15 UTC",
    },
    {
      id: "prop-compl-03",
      reqId: "REQ-9041",
      itemName: "Vector Database Index Query Tier",
      category: "api subscriptions",
      amount: 15.0,
      currency: "USD",
      recipient: "pinecone-accounts@billing.api",
      mandateName: "Developer API Subscriptions",
      mandateCap: 50.0,
      paypalCaptureId: "CAPTURE-9MM44211Q-SB",
      passportId: "pass-saas-api-15",
      passportNumber: "PASS-2026-AP-03",
      timestamp: "Today, 16:40 UTC",
    },
  ];

  // 2 Blocked Out-of-Bounds Proposals
  const blockedProposals: BlockedProposal[] = [
    {
      id: "prop-block-01",
      reqId: "REQ-8314",
      itemName: "Herman Miller Aeron Ergonomic Desk Chair",
      category: "office furniture",
      amount: 120.0,
      currency: "USD",
      recipient: "furniture-direct@external-office.com",
      mandateName: "Client Appreciation Procurement",
      mandateCap: 80.0,
      violationMessage: "Blocked: $120.00 exceeds $80.00 mandate cap",
      violationDetail:
        "Category 'office furniture' is not in allowed allowlist [digital gift cards]. Deterministic pre-spend intercept executed.",
      timestamp: "Today, 18:04 UTC",
    },
    {
      id: "prop-block-02",
      reqId: "REQ-8290",
      itemName: "Enterprise SaaS CRM Annual Seat License",
      category: "enterprise software",
      amount: 450.0,
      currency: "USD",
      recipient: "enterprise-crm@saas-sales.com",
      mandateName: "Developer API Subscriptions",
      mandateCap: 50.0,
      violationMessage: "Blocked: $450.00 exceeds $50.00 limit",
      violationDetail:
        "Requested single-transaction volume surpasses authorized mandate headroom by $400.00 USD.",
      timestamp: "Today, 15:20 UTC",
    },
  ];

  const handleSimulateInteractive = (type: "compliant" | "blocked") => {
    setTestingStatus(
      type === "compliant"
        ? "Evaluating Agent Intent -> Policy Validated ($75.00 <= $80.00) -> PayPal Sandbox Captured!"
        : "Evaluating Agent Intent -> Policy Violation Intercepted ($120.00 > $80.00) -> Spend Denied."
    );
    setTimeout(() => setTestingStatus(null), 5000);
  };

  return (
    <div className="space-y-10 w-full max-w-full">
      {/* 1. EDITORIAL HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-black/10 dark:border-white/10">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#007A56] dark:bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#002991] dark:text-[#60CDFF]">
              Control Plane · Transaction Decision Cockpit
            </span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-[42px] text-black dark:text-white tracking-[-0.03em] leading-[1.1]">
            Agent Purchases
          </h1>
          <p className="text-sm sm:text-base text-[#6C7378] dark:text-white/60 max-w-[65ch] font-normal leading-relaxed">
            Deterministic pre-spend validation stream. Autonomous AI agent requisitions evaluated
            against human spend mandates in real-time prior to PayPal settlement execution.
          </p>
        </div>

        {/* Live Policy Sentinel Stats */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#007A56]/10 text-[#007A56] dark:text-emerald-400 border border-[#007A56]/20">
            <span className="w-2 h-2 rounded-full bg-[#007A56] dark:bg-emerald-400" />
            3 APPROVED
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            2 BLOCKED
          </span>
        </div>
      </div>

      {/* Optional Interactive Test Flash Banner */}
      {testingStatus && (
        <div className="p-4 rounded-2xl bg-black/[0.04] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 flex items-center justify-between text-xs font-mono font-bold text-black dark:text-white animate-in fade-in">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#60CDFF]" />
            <span>{testingStatus}</span>
          </div>
          <button
            type="button"
            onClick={() => setTestingStatus(null)}
            className="text-[#6C7378] hover:text-black dark:hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2. SPLIT LAYOUT (COMPLIANT LEFT 6 COLS / BLOCKED RIGHT 6 COLS) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* LEFT COLUMN: COMPLIANT PROPOSALS (APPROVED) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10">
            <div>
              <h2 className="font-display font-black text-xl text-black dark:text-white tracking-tight flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#007A56] dark:text-emerald-400" />
                <span>Compliant Proposals &amp; Settlements</span>
              </h2>
              <p className="text-xs text-[#6C7378] dark:text-white/60">
                Validated against human spend mandate bounds and executed via PayPal Orders v2.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-[#007A56] dark:text-emerald-400">
              3 Passed
            </span>
          </div>

          {/* Flat rows with hairline dividers */}
          <div className="divide-y divide-black/10 dark:divide-white/10">
            {compliantProposals.map((tx) => (
              <div
                key={tx.id}
                className="py-5 space-y-3 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
              >
                {/* Row Header: Item + Amount */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-0.5">
                    <div className="font-display font-bold text-sm text-black dark:text-white">
                      {tx.itemName}
                    </div>
                    <div className="text-[11px] text-[#6C7378] dark:text-white/50">
                      Mandate: <span className="font-medium text-black dark:text-white">{tx.mandateName}</span> · Recipient: {tx.recipient}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono font-extrabold text-sm text-black dark:text-white tabular-nums">
                      ${tx.amount.toFixed(2)} {tx.currency}
                    </div>
                    <div className="text-[10px] font-mono text-[#6C7378] dark:text-white/40">
                      {tx.timestamp}
                    </div>
                  </div>
                </div>

                {/* Technical Visual Flow: Agent Intent -> Policy Check (Passed) -> PayPal Capture (Emerald green badge) */}
                <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 space-y-1.5">
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6C7378] dark:text-white/50">
                    Execution Decision Pipeline
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[11px] flex-wrap">
                    {/* Step 1: Agent Intent */}
                    <span className="text-[#002991] dark:text-[#60CDFF] font-semibold">
                      [{tx.reqId}]
                    </span>
                    <span className="text-[#6C7378] dark:text-white/40">&rarr;</span>

                    {/* Step 2: Policy Check (Passed) */}
                    <span className="text-[#007A56] dark:text-emerald-400 font-bold bg-[#007A56]/10 px-2 py-0.5 rounded border border-[#007A56]/20">
                      POLICY CHECK: PASSED (≤ ${tx.mandateCap.toFixed(2)}) ✓
                    </span>
                    <span className="text-[#6C7378] dark:text-white/40">&rarr;</span>

                    {/* Step 3: PayPal Capture (Emerald green badge) */}
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-[#007A56] text-white dark:bg-emerald-500 dark:text-black shadow-xs">
                      {tx.paypalCaptureId}
                    </span>
                  </div>
                </div>

                {/* Passport Link & Inspect Action */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <Link
                    href={`/passports/${tx.passportId}`}
                    className="font-mono text-xs text-[#002991] dark:text-[#60CDFF] hover:underline flex items-center gap-1.5 font-bold"
                  >
                    <ScrollText className="w-3.5 h-3.5" />
                    <span>Attestation: {tx.passportNumber}</span>
                  </Link>

                  <Link
                    href={`/passports/${tx.passportId}`}
                    className="text-[#6C7378] dark:text-white/60 hover:text-black dark:hover:text-white inline-flex items-center gap-1 text-[11px] font-semibold transition-colors"
                  >
                    <span>View Receipt</span>
                    <span>&rarr;</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: BLOCKED PROPOSALS (POLICY BREACHES) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10">
            <div>
              <h2 className="font-display font-black text-xl text-black dark:text-white tracking-tight flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                <span>Policy Breaches &amp; Intercepts</span>
              </h2>
              <p className="text-xs text-[#6C7378] dark:text-white/60">
                Blocked at deterministic policy gate. Zero funds captured and zero merchant chargeback exposure.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
              2 Blocked
            </span>
          </div>

          {/* Flat rows with hairline dividers */}
          <div className="divide-y divide-black/10 dark:divide-white/10">
            {blockedProposals.map((tx) => (
              <div
                key={tx.id}
                className="py-5 space-y-3 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
              >
                {/* Row Header: Item + Amount */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-0.5">
                    <div className="font-display font-bold text-sm text-black dark:text-white">
                      {tx.itemName}
                    </div>
                    <div className="text-[11px] text-[#6C7378] dark:text-white/50">
                      Mandate: <span className="font-medium text-black dark:text-white">{tx.mandateName}</span> · Recipient: {tx.recipient}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono font-extrabold text-sm text-rose-600 dark:text-rose-400 tabular-nums">
                      ${tx.amount.toFixed(2)} {tx.currency}
                    </div>
                    <div className="text-[10px] font-mono text-[#6C7378] dark:text-white/40">
                      {tx.timestamp}
                    </div>
                  </div>
                </div>

                {/* Muted Crimson Highlight for Policy Breach */}
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 space-y-1">
                  <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-rose-700 dark:text-rose-300">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{tx.violationMessage}</span>
                  </div>
                  <p className="text-[11px] text-rose-800/80 dark:text-rose-200/80 font-mono leading-relaxed">
                    {tx.violationDetail}
                  </p>
                </div>

                {/* Technical Visual Flow: Breaking at Policy Check Step */}
                <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 space-y-1.5">
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6C7378] dark:text-white/50">
                    Intercept Flow Analysis
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[11px] flex-wrap">
                    {/* Step 1: Agent Intent */}
                    <span className="text-[#6C7378] dark:text-white/60 font-semibold">
                      [{tx.reqId}]
                    </span>
                    <span className="text-[#6C7378] dark:text-white/40">&rarr;</span>

                    {/* Step 2: Policy Check (REJECTED) */}
                    <span className="text-rose-600 dark:text-rose-400 font-bold bg-rose-500/15 px-2 py-0.5 rounded border border-rose-500/30">
                      POLICY CHECK: BREACH DETECTED ✗
                    </span>
                    <span className="text-[#6C7378] dark:text-white/40">&rarr;</span>

                    {/* Step 3: PayPal Capture Broken / Blocked */}
                    <span className="text-black/35 dark:text-white/35 line-through font-mono text-[10px] px-2 py-0.5 border border-dashed border-black/20 dark:border-white/20 rounded">
                      PAYPAL CAPTURE BLOCKED
                    </span>
                  </div>
                </div>

                {/* Audit & Details link */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-[11px] font-mono text-rose-600 dark:text-rose-400 font-semibold">
                    [ INTERCEPT LOGGED TO MERKLE CHAIN ]
                  </span>

                  <Link
                    href="/audit"
                    className="text-[#6C7378] dark:text-white/60 hover:text-black dark:hover:text-white inline-flex items-center gap-1 text-[11px] font-semibold transition-colors"
                  >
                    <span>Inspect Ledger</span>
                    <span>&rarr;</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. INTERACTIVE SIMULATION TESTING DECK */}
      <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#111114] p-6 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h3 className="font-display font-bold text-base text-black dark:text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#60CDFF]" />
              <span>Autonomous Commerce Simulator</span>
            </h3>
            <p className="text-xs text-[#6C7378] dark:text-white/60">
              Trigger instant synthetic agent requisitions to test the deterministic policy gate.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleSimulateInteractive("compliant")}
              className="px-5 py-2.5 rounded-full text-xs font-bold text-[#002991] bg-[#60CDFF] hover:bg-[#4bc3fa] active:scale-[0.98] transition-all shadow-sm"
            >
              Simulate Compliant ($75.00)
            </button>
            <button
              type="button"
              onClick={() => handleSimulateInteractive("blocked")}
              className="px-5 py-2.5 rounded-full text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 active:scale-[0.98] transition-all"
            >
              Simulate Breach ($120.00)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
