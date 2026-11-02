"use client";

import React, { useEffect, useState } from "react";
import { AppHeader } from "@/components/layout/app-header";
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
        subtitle="Prompt autonomous AI agents to propose purchases under strict cryptographic mandate guardrails."
      />

      <div className="space-y-6">
        {/* Mandate Selector Header */}
        <div className="fintech-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-primary-500" />
              Active Governing Mandate
            </span>
            <div className="flex items-center gap-3">
              <select
                value={selectedMandateId}
                onChange={(e) => {
                  setSelectedMandateId(e.target.value);
                  setCurrentProposal(null);
                  setExecutionResult(null);
                }}
                className="bg-background border border-border rounded-lg text-sm font-semibold py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {mandates.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title} — Cap: ${m.maxAmount.toFixed(2)} {m.currency}
                  </option>
                ))}
              </select>
              {selectedMandate && (
                <span className="fintech-badge bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Cap: ${selectedMandate.maxAmount.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {selectedMandate && (
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div>
                Allowed Category:{" "}
                <span className="font-mono text-foreground font-semibold">
                  {selectedMandate.allowedCategories.replace(/[\[\]"]/g, "")}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Preset Scenarios Selector (Exact Hackathon Vertical Showcase) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Preset A: Approved $75 Gift Card */}
          <div
            onClick={() => {
              setSelectedPreset("approved");
              handleRunAgent("approved");
            }}
            className={`p-5 rounded-xl border cursor-pointer transition-all ${
              selectedPreset === "approved"
                ? "border-emerald-500/60 bg-emerald-500/5 shadow-sm"
                : "border-border bg-card hover:border-emerald-500/30"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                  Scenario A: Authorized Proposal
                </h3>
              </div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                Will Approve
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Agent proposes a <strong>$75 Digital Gift Card</strong> (Starbucks Select). Well within $80 cap, matching authorized &quot;digital gift cards&quot; category.
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <Zap className="w-3.5 h-3.5" /> Test Approved Flow
            </div>
          </div>

          {/* Preset B: Blocked $120 Physical Chair */}
          <div
            onClick={() => {
              setSelectedPreset("blocked");
              handleRunAgent("blocked");
            }}
            className={`p-5 rounded-xl border cursor-pointer transition-all ${
              selectedPreset === "blocked"
                ? "border-destructive/60 bg-destructive/5 shadow-sm"
                : "border-border bg-card hover:border-destructive/30"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center">
                  <XCircle className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                  Scenario B: Policy-Violating Proposal
                </h3>
              </div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-destructive/10 text-destructive font-bold border border-destructive/20">
                Will Block
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Agent proposes a <strong>$120 Ergonomic Chair</strong>. Exceeds $80 limit ($120 &gt; $80) AND category &quot;physical equipment&quot; is outside authorization.
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-destructive">
              <AlertTriangle className="w-3.5 h-3.5" /> Test Blocked Flow
            </div>
          </div>
        </div>

        {/* Live Proposal & Policy Inspector */}
        {proposing && (
          <div className="fintech-card text-center py-12 space-y-3 animate-pulse">
            <Bot className="w-8 h-8 text-primary-500 mx-auto animate-bounce" />
            <h4 className="text-sm font-semibold text-foreground">
              Agent Reasoning in Progress...
            </h4>
            <p className="text-xs text-muted-foreground">
              Evaluating purchase options against mandate parameters with Gemini...
            </p>
          </div>
        )}

        {currentProposal && !proposing && (
          <div className="space-y-6">
            <div
              className={`fintech-card border-2 ${
                currentProposal.validationStatus === "APPROVED"
                  ? "border-emerald-500/50 bg-card"
                  : "border-destructive/50 bg-destructive/5"
              }`}
            >
              {/* Proposal Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-border gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      currentProposal.validationStatus === "APPROVED"
                        ? "bg-emerald-500 text-white"
                        : "bg-destructive text-white"
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
                      <span
                        className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                          currentProposal.validationStatus === "APPROVED"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : "bg-destructive/10 text-destructive border border-destructive/20"
                        }`}
                      >
                        {currentProposal.validationStatus}
                      </span>
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Recipient: <strong className="text-foreground">{currentProposal.recipient}</strong> · Category: <span className="font-mono text-primary-500">{currentProposal.itemCategory}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xl font-mono font-bold text-foreground">
                    {formatCurrency(currentProposal.amount, currentProposal.currency)}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Mandate Cap: ${selectedMandate?.maxAmount.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Agent Chain of Thought */}
              <div className="mt-4 p-3.5 rounded-lg bg-muted/40 border border-border/60 text-xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                  Agent Chain of Thought &amp; Selection Rationale
                </span>
                <p className="text-foreground leading-relaxed italic">
                  &quot;{currentProposal.reasoning}&quot;
                </p>
              </div>

              {/* Policy Enforcement Breakdown */}
              <div className="mt-4 space-y-2">
                <span className="text-[11px] font-semibold text-muted-foreground block uppercase tracking-wider">
                  Mandate Policy Enforcement Checks
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Check 1: Budget Cap */}
                  <div
                    className={`p-3 rounded-lg border text-xs ${
                      parsedChecks?.amountCheck?.passed
                        ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300"
                        : "border-destructive/20 bg-destructive/5 text-destructive"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold mb-1">
                      {parsedChecks?.amountCheck?.passed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-destructive" />
                      )}
                      1. Budget Cap Check
                    </div>
                    <div className="text-[11px] opacity-90">
                      {parsedChecks?.amountCheck?.message || "Amount constraint verified"}
                    </div>
                  </div>

                  {/* Check 2: Category */}
                  <div
                    className={`p-3 rounded-lg border text-xs ${
                      parsedChecks?.categoryCheck?.passed
                        ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300"
                        : "border-destructive/20 bg-destructive/5 text-destructive"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold mb-1">
                      {parsedChecks?.categoryCheck?.passed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-destructive" />
                      )}
                      2. Category Check
                    </div>
                    <div className="text-[11px] opacity-90">
                      {parsedChecks?.categoryCheck?.message || "Category constraint verified"}
                    </div>
                  </div>

                  {/* Check 3: Expiry */}
                  <div
                    className={`p-3 rounded-lg border text-xs ${
                      parsedChecks?.expiryCheck?.passed
                        ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300"
                        : "border-destructive/20 bg-destructive/5 text-destructive"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold mb-1">
                      {parsedChecks?.expiryCheck?.passed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-destructive" />
                      )}
                      3. Expiry Check
                    </div>
                    <div className="text-[11px] opacity-90">
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

                    <button
                      onClick={handleExecutePayPal}
                      disabled={executing || Boolean(executionResult)}
                      className="px-5 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold shadow-md shadow-primary/20 transition-all hover:scale-[1.02] flex items-center gap-2 disabled:opacity-50"
                    >
                      <CreditCard className="w-4 h-4" />
                      {executing
                        ? "Executing PayPal Sandbox..."
                        : executionResult
                        ? "Settled & Issued!"
                        : `Execute via PayPal ($${currentProposal.amount.toFixed(2)})`}
                    </button>
                  </>
                ) : (
                  <div className="w-full p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-center gap-2">
                    <XCircle className="w-4 h-4 shrink-0" />
                    <span>
                      <strong>Execution Blocked:</strong> {currentProposal.violationReason}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Execution Result Banner (Trust Passport Created) */}
            {executionResult && (
              <div className="p-6 rounded-2xl border border-emerald-500/40 bg-emerald-500/5 shadow-lg space-y-4 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
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

                  <a
                    href={`/passports/${executionResult.passport?.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium shadow-sm"
                  >
                    View Trust Passport <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2 border-t border-border/50">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase block font-semibold">
                      Seller Protection
                    </span>
                    <span className="text-emerald-500 font-bold font-mono">
                      ELIGIBLE
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase block font-semibold">
                      Dispute Readiness
                    </span>
                    <span className="text-foreground font-bold font-mono">
                      {executionResult.passport?.disputeReadinessScore || 98}/100
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase block font-semibold">
                      Cryptographic Hash
                    </span>
                    <span className="font-mono text-primary-500 text-[11px]">
                      {truncateHash(executionResult.passport?.passportHash, 6, 6)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase block font-semibold">
                      Audit Trail
                    </span>
                    <span className="text-foreground font-medium">
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

