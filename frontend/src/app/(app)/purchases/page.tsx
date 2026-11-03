"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { HashInspector } from "@/components/ui/hash-inspector";
import {
  Bot,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  AlertTriangle,
  RotateCcw,
  Zap,
  Lock,
  Layers,
  ScrollText,
  SlidersHorizontal,
  ChevronRight,
  BadgeAlert,
  Send,
} from "lucide-react";
import { formatCurrency, truncateHash } from "@/lib/utils";
import confetti from "canvas-confetti";

interface Mandate {
  id: string;
  title: string;
  purpose: string;
  maxAmount: number;
  currency: string;
  allowedCategories: string;
  expiresAt: string;
  status: string;
}

interface Proposal {
  id: string;
  itemName: string;
  itemCategory: string;
  amount: number;
  currency: string;
  recipient: string;
  reasoning: string;
  validationStatus: "APPROVED" | "BLOCKED";
  violationReason?: string;
  validationChecks: string;
}

export default function PurchasesPage() {
  const [mandates, setMandates] = useState<Mandate[]>([]);
  const [selectedMandateId, setSelectedMandateId] = useState<string>("");
  const [selectedPreset, setSelectedPreset] = useState<"approved" | "blocked" | "custom">("approved");
  const [customPrompt, setCustomPrompt] = useState(
    "Select a high-quality coffee gift card for client appreciation under the mandate budget."
  );

  const [proposing, setProposing] = useState(false);
  const [currentProposal, setCurrentProposal] = useState<Proposal | null>(null);
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<any | null>(null);

  const fetchMandates = async () => {
    try {
      const res = await fetch("/api/mandates");
      const data = await res.json();
      if (data.mandates && data.mandates.length > 0) {
        setMandates(data.mandates);
        setSelectedMandateId(data.mandates[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMandates();
  }, []);

  const handleRunAgent = async (presetType = selectedPreset) => {
    if (!selectedMandateId) return;
    setProposing(true);
    setCurrentProposal(null);
    setExecutionResult(null);

    const isBlocked = presetType === "blocked";

    try {
      const res = await fetch("/api/purchases/propose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mandateId: selectedMandateId,
          userPrompt: isBlocked
            ? "Buy an ergonomic office chair for the client"
            : customPrompt,
          forceBlockedScenario: isBlocked,
        }),
      });
      const data = await res.json();
      if (data.proposal) {
        setCurrentProposal(data.proposal);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProposing(false);
    }
  };

  const handleExecutePayPal = async () => {
    if (!currentProposal || currentProposal.validationStatus !== "APPROVED") return;
    setExecuting(true);
    try {
      const res = await fetch("/api/purchases/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposalId: currentProposal.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setExecutionResult(data);
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ["#0070BA", "#10B981", "#36A0F7"],
        });
      } else {
        alert(data.error || "Execution failed");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setExecuting(false);
    }
  };

  const selectedMandate = mandates.find((m) => m.id === selectedMandateId);

  let parsedChecks: any = {};
  if (currentProposal?.validationChecks) {
    try {
      parsedChecks = JSON.parse(currentProposal.validationChecks);
    } catch {
      parsedChecks = {};
    }
  }

  return (
    <>
      <AppHeader
        title="Agent Purchase Console"
        subtitle="Prompt autonomous AI agents to propose purchases under deterministic cryptographic mandate bounds."
      />

      <div className="space-y-6">
        {/* Mandate Boundary Bar */}
        <div className="fintech-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 font-mono">
              <Lock className="w-3.5 h-3.5 text-primary-400" />
              Active Governing Spend Mandate
            </span>
            <div className="flex items-center gap-3">
              <select
                value={selectedMandateId}
                onChange={(e) => {
                  setSelectedMandateId(e.target.value);
                  setCurrentProposal(null);
                  setExecutionResult(null);
                }}
                className="bg-background border border-border rounded-lg text-xs font-semibold py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-primary-500 text-foreground"
              >
                {mandates.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title} — Cap: ${m.maxAmount.toFixed(2)} {m.currency}
                  </option>
                ))}
              </select>
              {selectedMandate && (
                <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 tabular-nums">
                  Cap: ${selectedMandate.maxAmount.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {selectedMandate && (
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div>
                Authorized Category:{" "}
                <span className="font-mono text-foreground font-semibold">
                  {selectedMandate.allowedCategories.replace(/[\[\]"]/g, "")}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Requisition Scenario Cockpit */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Preset A: Authorized Micro-Requisition */}
          <div
            onClick={() => {
              setSelectedPreset("approved");
              handleRunAgent("approved");
            }}
            className={`p-5 rounded-xl border cursor-pointer transition-all ${
              selectedPreset === "approved"
                ? "border-emerald-500/60 bg-emerald-500/5 shadow-xs"
                : "border-border bg-card hover:border-emerald-500/30"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Scenario A: Compliant Requisition
                  </h3>
                  <span className="text-[11px] text-muted-foreground">
                    Autonomous Gift Card Procurement
                  </span>
                </div>
              </div>
              <StatusPill status="approved" label="POLICY COMPLIANT" />
            </div>
            <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
              Agent proposes a <strong className="text-foreground">$75 Digital Gift Card</strong> (Starbucks Select). Well within $80 cap, matching authorized &quot;digital gift cards&quot; category.
            </p>
            <div className="mt-4 flex items-center justify-between pt-3 border-t border-border/40">
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" /> Execute Compliant Flow
              </span>
              <span className="font-mono text-xs font-bold text-foreground tabular-nums">
                $75.00 USD
              </span>
            </div>
          </div>

          {/* Preset B: Non-Compliant Capital Requisition */}
          <div
            onClick={() => {
              setSelectedPreset("blocked");
              handleRunAgent("blocked");
            }}
            className={`p-5 rounded-xl border cursor-pointer transition-all ${
              selectedPreset === "blocked"
                ? "border-rose-500/60 bg-rose-500/5 shadow-xs"
                : "border-border bg-card hover:border-rose-500/30"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <XCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Scenario B: Non-Compliant Requisition
                  </h3>
                  <span className="text-[11px] text-muted-foreground">
                    Out-of-Scope Hardware Purchase
                  </span>
                </div>
              </div>
              <StatusPill status="blocked" label="POLICY BREACH" />
            </div>
            <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
              Agent proposes a <strong className="text-foreground">$120 Ergonomic Chair</strong>. Exceeds $80 limit ($120 &gt; $80) AND category &quot;physical equipment&quot; is outside authorization.
            </p>
            <div className="mt-4 flex items-center justify-between pt-3 border-t border-border/40">
              <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> Inspect Blocked Enforcement
              </span>
              <span className="font-mono text-xs font-bold text-rose-500 tabular-nums">
                $120.00 USD
              </span>
            </div>
          </div>
        </div>

        {/* Live Proposal & Policy Inspector */}
        {proposing && (
          <div className="fintech-card text-center py-12 space-y-3">
            <Bot className="w-8 h-8 text-primary-500 dark:text-primary-400 mx-auto animate-bounce" />
            <h4 className="text-sm font-semibold text-foreground">
              Agent Policy Evaluation Engine Active...
            </h4>
            <p className="text-xs text-muted-foreground">
              Evaluating purchase options against mandate parameters with Google Gemini 1.5 Pro...
            </p>
          </div>
        )}

        {currentProposal && !proposing && (
          <div className="space-y-6">
            <div
              className={`fintech-card border ${
                currentProposal.validationStatus === "APPROVED"
                  ? "border-emerald-500/40 bg-card"
                  : "border-rose-500/40 bg-rose-500/5"
              }`}
            >
              {/* Proposal Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-border gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      currentProposal.validationStatus === "APPROVED"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {currentProposal.validationStatus === "APPROVED" ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <XCircle className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      {currentProposal.itemName}
                      <StatusPill
                        status={currentProposal.validationStatus}
                        label={currentProposal.validationStatus}
                      />
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Recipient: <strong className="text-foreground">{currentProposal.recipient}</strong> · Category: <span className="font-mono text-primary-500 dark:text-primary-400">{currentProposal.itemCategory}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xl font-mono font-bold text-foreground tabular-nums">
                    {formatCurrency(currentProposal.amount, currentProposal.currency)}
                  </div>
                  <div className="text-[11px] text-muted-foreground font-mono">
                    Mandate Cap: ${selectedMandate?.maxAmount.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Agent Chain of Thought */}
              <div className="mt-4 p-3.5 rounded-lg bg-muted/40 border border-border text-xs space-y-1">
                <span className="text-[10px] uppercase font-mono font-bold text-muted-foreground tracking-wider block">
                  Agent Chain of Thought &amp; Selection Rationale
                </span>
                <p className="text-foreground/90 leading-relaxed italic">
                  &quot;{currentProposal.reasoning}&quot;
                </p>
              </div>

              {/* Policy Enforcement Breakdown */}
              <div className="mt-4 space-y-2">
                <span className="text-[10px] font-mono uppercase font-semibold text-muted-foreground block tracking-wider">
                  Mandate Policy Enforcement Checks
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Check 1: Budget Cap */}
                  <div
                    className={`p-3 rounded-lg border text-xs ${
                      parsedChecks?.amountCheck?.passed
                        ? "border-emerald-500/25 bg-emerald-500/5 text-emerald-800 dark:text-emerald-300"
                        : "border-rose-500/25 bg-rose-500/5 text-rose-800 dark:text-rose-300"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold mb-1">
                      {parsedChecks?.amountCheck?.passed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-rose-500" />
                      )}
                      1. Budget Cap Check
                    </div>
                    <div className="text-[11px] opacity-90 font-mono">
                      {parsedChecks?.amountCheck?.message || "Amount constraint verified"}
                    </div>
                  </div>

                  {/* Check 2: Category */}
                  <div
                    className={`p-3 rounded-lg border text-xs ${
                      parsedChecks?.categoryCheck?.passed
                        ? "border-emerald-500/25 bg-emerald-500/5 text-emerald-800 dark:text-emerald-300"
                        : "border-rose-500/25 bg-rose-500/5 text-rose-800 dark:text-rose-300"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold mb-1">
                      {parsedChecks?.categoryCheck?.passed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-rose-500" />
                      )}
                      2. Category Check
                    </div>
                    <div className="text-[11px] opacity-90 font-mono">
                      {parsedChecks?.categoryCheck?.message || "Category constraint verified"}
                    </div>
                  </div>

                  {/* Check 3: Expiry */}
                  <div
                    className={`p-3 rounded-lg border text-xs ${
                      parsedChecks?.expiryCheck?.passed
                        ? "border-emerald-500/25 bg-emerald-500/5 text-emerald-800 dark:text-emerald-300"
                        : "border-rose-500/25 bg-rose-500/5 text-rose-800 dark:text-rose-300"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold mb-1">
                      {parsedChecks?.expiryCheck?.passed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-rose-500" />
                      )}
                      3. Expiry Check
                    </div>
                    <div className="text-[11px] opacity-90 font-mono">
                      {parsedChecks?.expiryCheck?.message || "Mandate active and within time boundary"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Execution Actions */}
              <div className="mt-6 pt-4 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                {currentProposal.validationStatus === "APPROVED" ? (
                  <>
                    <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span>Ready for instant PayPal Sandbox order creation &amp; capture.</span>
                    </div>

                    <Button
                      variant="primary"
                      size="md"
                      onClick={handleExecutePayPal}
                      disabled={executing || Boolean(executionResult)}
                    >
                      <CreditCard className="w-4 h-4" />
                      {executing
                        ? "Executing PayPal Sandbox..."
                        : executionResult
                        ? "Settled & Issued!"
                        : `Execute via PayPal ($${currentProposal.amount.toFixed(2)})`}
                    </Button>
                  </>
                ) : (
                  <div className="w-full p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                    <XCircle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>
                      <strong>Execution Blocked:</strong> {currentProposal.violationReason}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Execution Result Banner (Trust Passport Created) */}
            {executionResult && (
              <div className="p-6 rounded-xl border border-emerald-500/40 bg-emerald-500/5 shadow-lg space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
                      <ScrollText className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">
                        Trust Passport Issued: {executionResult.passport?.passportNumber}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        PayPal Sandbox Capture ID: <strong className="font-mono text-foreground">{executionResult.purchase?.paypalCaptureId}</strong>
                      </p>
                    </div>
                  </div>

                  <Link href={`/passports/${executionResult.passport?.id}`}>
                    <Button variant="primary" size="sm">
                      <span>Inspect Credential</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-3 border-t border-border/60">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase block font-semibold font-mono">
                      Seller Protection
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                      ELIGIBLE
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase block font-semibold font-mono">
                      Dispute Readiness
                    </span>
                    <span className="text-foreground font-bold font-mono tabular-nums">
                      {executionResult.passport?.disputeReadinessScore || 98}/100
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase block font-semibold font-mono">
                      Cryptographic Hash
                    </span>
                    <HashInspector hash={executionResult.passport?.passportHash} truncateLength={6} />
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase block font-semibold font-mono">
                      Audit Trail
                    </span>
                    <span className="text-foreground font-medium font-mono text-[11px]">
                      Committed to Ledger
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
