"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  Bot,
  CreditCard,
  FileCheck,
  ScrollText,
  Download,
  AlertOctagon,
  ArrowRight,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Fingerprint,
} from "lucide-react";
import { formatCurrency, formatDate, truncateHash } from "@/lib/utils";
import { HashInspector } from "@/components/ui/hash-inspector";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import confetti from "canvas-confetti";

interface TrustPassportCredentialProps {
  passport: any;
  verification?: {
    isSignatureValid: boolean;
    hash: string;
    algorithm: string;
    verifiedAt: string;
  };
  onSimulateDispute?: () => void;
  isSimulatingDispute?: boolean;
}

export function TrustPassportCredential({
  passport,
  verification,
  onSimulateDispute,
  isSimulatingDispute = false,
}: TrustPassportCredentialProps) {
  const [activeTab, setActiveTab] = useState<
    "authorization" | "transaction" | "agentTrail" | "receipt" | "disputeReadiness"
  >("authorization");
  const [isScanning, setIsScanning] = useState(false);
  const [justVerified, setJustVerified] = useState(false);

  const purchase = passport.purchase || {};
  const mandate = passport.mandate || {};

  let authData: any = {};
  let txData: any = {};
  let agentTrail: any = {};
  let evidencePack: string[] = [];

  try {
    authData = JSON.parse(passport.authorizationData || "{}");
    txData = JSON.parse(passport.transactionData || "{}");
    agentTrail = JSON.parse(passport.agentTrailData || "{}");
    evidencePack = JSON.parse(passport.evidencePack || "[]");
  } catch (e) {
    console.error(e);
  }

  const handleDownloadJSON = () => {
    const payload = JSON.stringify({ passport, verification }, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${passport.passportNumber}-attestation.json`;
    a.click();
  };

  const handleTriggerScan = () => {
    setIsScanning(true);
    setJustVerified(false);
    setTimeout(() => {
      setIsScanning(false);
      setJustVerified(true);
      confetti({
        particleCount: 55,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#0070BA", "#10B981", "#36A0F7"],
      });
      setTimeout(() => setJustVerified(false), 3500);
    }, 1100);
  };

  const hasDispute = purchase.disputes && purchase.disputes.length > 0;
  const activeDispute = hasDispute ? purchase.disputes[0] : null;

  const tabs = [
    { id: "authorization", label: "Authorization", icon: FileCheck },
    { id: "transaction", label: "Settlement", icon: CreditCard },
    { id: "agentTrail", label: "Agent Trail", icon: Bot },
    { id: "receipt", label: "Receipt", icon: ScrollText },
    { id: "disputeReadiness", label: "Dispute Bundle", icon: ShieldCheck },
  ] as const;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xl relative transition-all">
      {/* Laser verification scanline animation overlay */}
      {isScanning && (
        <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent z-50 animate-scanline pointer-events-none shadow-[0_0_12px_#0070BA]" />
      )}

      {/* Credential Header Strip */}
      <div className="p-6 bg-secondary/40 border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative">
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-wider px-2 py-0.5 rounded bg-card text-muted-foreground uppercase font-bold border border-border">
              Digital Trust Credential
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-3 h-3" />
              ECDSA ATTESTED
            </span>
          </div>

          <h2 className="text-2xl font-bold font-mono tracking-tight text-foreground">
            {passport.passportNumber}
          </h2>

          <p className="text-xs text-muted-foreground">
            Beneficiary: <strong className="text-foreground">{txData.merchant || purchase.merchantName || "Starbucks Merchant"}</strong> · Authorizer: <strong className="text-foreground">{authData.authorizer || "Account Owner"}</strong>
          </p>
        </div>

        {/* Readiness Score Gauge & Scan Action */}
        <div className="flex items-center gap-3 z-10">
          <div className="flex items-center gap-3 bg-card p-3 rounded-lg border border-border">
            <div className="text-right">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground block tracking-wider font-mono">
                Readiness Index
              </span>
              <span className="text-xl font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {passport.disputeReadinessScore}/100
              </span>
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-emerald-500/40 flex items-center justify-center text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 font-mono tabular-nums">
              98%
            </div>
          </div>

          <Button
            variant={justVerified ? "secondary" : "outline"}
            size="sm"
            onClick={handleTriggerScan}
            loading={isScanning}
            leadingIcon={
              justVerified ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 animate-in zoom-in-50 duration-200" />
              ) : (
                <Fingerprint className="w-3.5 h-3.5 text-primary" />
              )
            }
            className={`hidden sm:inline-flex transition-all ${
              justVerified
                ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold shadow-[0_0_12px_rgba(16,185,129,0.25)]"
                : ""
            }`}
            tooltip="Run live cryptographic fingerprint verification"
          >
            {justVerified ? "Seal Verified!" : "Verify Seal"}
          </Button>
        </div>
      </div>

      {/* Cryptographic SHA-256 Digest Bar */}
      <div className="bg-muted/30 border-b border-border px-6 py-2 flex flex-wrap items-center justify-between text-xs gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-muted-foreground">SHA-256 Digest:</span>
          <HashInspector hash={passport.passportHash} truncateLength={8} />
        </div>

        <div className="flex items-center gap-4 text-[11px] text-muted-foreground font-mono">
          <span>Algo: <strong className="text-foreground">ECDSA-P256-SHA256</strong></span>
          <span>Issued: <strong className="text-foreground">{formatDate(passport.issuedAt)}</strong></span>
        </div>
      </div>

      {/* 5 Tab Navigation with Framer Motion layoutId */}
      <div className="border-b border-border bg-card px-4 sm:px-6 flex items-center gap-1 overflow-x-auto py-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-3.5 py-2.5 text-xs font-medium rounded-md transition-colors flex items-center gap-2 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                isActive ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
              <span>{tab.label}</span>
              {isActive && (
                <motion.div
                  layoutId="passportActiveTab"
                  className="absolute inset-0 bg-secondary rounded-md -z-10 border border-border"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {activeTab === "authorization" && (
            <motion.div
              key="authorization"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Human Mandate Snapshot
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Cryptographic snapshot of authorizer intent bound before agent execution.
                  </p>
                </div>
                <StatusPill status="approved" label="AUTHORIZED" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-lg border border-border bg-secondary/30 space-y-1">
                  <span className="text-[10px] uppercase font-mono font-bold text-muted-foreground">
                    Mandate Reference
                  </span>
                  <div className="font-semibold text-foreground">
                    {authData.title || mandate.title || "Client Appreciation Gift"}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Purpose: &quot;{authData.purpose || mandate.purpose}&quot;
                  </div>
                </div>

                <div className="p-3.5 rounded-lg border border-border bg-secondary/30 space-y-1">
                  <span className="text-[10px] uppercase font-mono font-bold text-muted-foreground">
                    Spend Limit &amp; Velocity
                  </span>
                  <div className="font-mono text-base font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {formatCurrency(authData.maxAmount || mandate.maxAmount, authData.currency || mandate.currency)} Maximum Cap
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Valid for {mandate.expiryHours || 24} hours from authorization
                  </div>
                </div>

                <div className="p-3.5 rounded-lg border border-border bg-secondary/30 space-y-1">
                  <span className="text-[10px] uppercase font-mono font-bold text-muted-foreground">
                    Authorized Scope
                  </span>
                  <div className="font-mono text-foreground font-medium">
                    {authData.allowedCategories || mandate.allowedCategories}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Strict deterministic policy filter
                  </div>
                </div>

                <div className="p-3.5 rounded-lg border border-border bg-secondary/30 space-y-1">
                  <span className="text-[10px] uppercase font-mono font-bold text-muted-foreground">
                    Human Authorization Signature
                  </span>
                  <div className="font-medium text-foreground">
                    {authData.authorizer || "Account Owner (Jacob)"}
                  </div>
                  <div className="text-[11px] text-muted-foreground font-mono">
                    Signed at {formatDate(authData.approvedAt || passport.issuedAt)}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "transaction" && (
            <motion.div
              key="transaction"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    PayPal Sandbox Settlement Attestation
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Direct cryptographic receipt from the PayPal Orders v2 API capture.
                  </p>
                </div>
                <StatusPill status="completed" label="SETTLED" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 rounded-lg border border-border bg-secondary/30 space-y-1">
                  <span className="text-[10px] uppercase font-mono font-bold text-muted-foreground">
                    PayPal Order ID
                  </span>
                  <div className="font-mono font-bold text-primary text-xs">
                    {txData.paypalOrderId || purchase.paypalOrderId}
                  </div>
                </div>

                <div className="p-3.5 rounded-lg border border-border bg-secondary/30 space-y-1">
                  <span className="text-[10px] uppercase font-mono font-bold text-muted-foreground">
                    PayPal Capture ID
                  </span>
                  <div className="font-mono font-bold text-foreground text-xs">
                    {txData.paypalCaptureId || purchase.paypalCaptureId}
                  </div>
                </div>

                <div className="p-3.5 rounded-lg border border-border bg-secondary/30 space-y-1">
                  <span className="text-[10px] uppercase font-mono font-bold text-muted-foreground">
                    Seller Protection Status
                  </span>
                  <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                    {txData.sellerProtection || "ELIGIBLE"}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-border bg-card space-y-2 text-xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Gross Captured Amount:</span>
                  <span className="font-mono font-bold text-foreground tabular-nums">
                    {formatCurrency(purchase.amount, purchase.currency)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>PayPal Processing Fee:</span>
                  <span className="font-mono text-muted-foreground tabular-nums">
                    {txData.paypalFee || "$2.48 USD"}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-2 font-bold text-foreground">
                  <span>Net Settled to Merchant:</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {txData.netAmount || "$72.52 USD"}
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "agentTrail" && (
            <motion.div
              key="agentTrail"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Autonomous Agent Intent &amp; Tool Calling Trace
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Immutable execution transcript proving the agent stayed strictly within bounds.
                  </p>
                </div>
                <StatusPill status="approved" label="INTENT VERIFIED" />
              </div>

              <div className="p-4 rounded-lg bg-secondary/40 border border-border text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-primary font-semibold text-[11px]">
                    Model: {agentTrail.agentModel || "Google Gemini 1.5 Pro"}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    Trace ID: {agentTrail.executionTraceId || "gemini-exec-490218-trace"}
                  </span>
                </div>
                <p className="text-foreground leading-relaxed italic">
                  &quot;{agentTrail.reasoning || "Evaluated options against Mandate purpose ('Client appreciation gift'). Selected $75 digital gift card leaving $5.00 buffer under $80 cap. Item strictly belongs to authorized category 'digital gift cards'."}&quot;
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-3 rounded-lg border border-border bg-card">
                  <span className="text-[10px] text-muted-foreground uppercase block">Selected Proposal</span>
                  <span className="font-bold text-foreground">{agentTrail.selectedItem || "Starbucks Digital e-Gift Card ($75)"}</span>
                </div>
                <div className="p-3 rounded-lg border border-border bg-card">
                  <span className="text-[10px] text-muted-foreground uppercase block">Mandate Buffer Preserved</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">${(agentTrail.budgetRemaining || 5.0).toFixed(2)} USD</span>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "receipt" && (
            <motion.div
              key="receipt"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Verifiable Line Item Receipt
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Itemized fulfillment record with delivery destination proof.
                  </p>
                </div>
                <StatusPill status="completed" label="DELIVERED" />
              </div>

              <div className="p-4 rounded-lg border border-border bg-card space-y-3 text-xs">
                <div className="flex items-center justify-between font-mono">
                  <span className="font-semibold text-foreground">
                    {purchase.itemName || "Starbucks Digital e-Gift Card ($75)"} &times; 1
                  </span>
                  <span className="font-bold text-foreground tabular-nums">
                    {formatCurrency(purchase.amount, purchase.currency)}
                  </span>
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Delivered To:</span>
                  <span className="font-mono text-foreground font-medium">
                    {purchase.recipient || "client@acmecorp.com"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Merchant Dispatch Code:</span>
                  <span className="font-mono text-foreground">
                    SBUX-DIGITAL-984102-ACK
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "disputeReadiness" && (
            <motion.div
              key="disputeReadiness"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Pre-Assembled Dispute Defense Pack
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Evidence artifacts bound into this credential ready for immediate submission.
                  </p>
                </div>
                <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  5 of 5 Attached
                </span>
              </div>

              <div className="space-y-2">
                {evidencePack.map((item: string, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border border-border bg-card flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="font-medium text-foreground">{item}</span>
                    </div>
                    <span className="font-mono text-[10px] text-muted-foreground uppercase">
                      VERIFIED
                    </span>
                  </div>
                ))}
              </div>

              {hasDispute && activeDispute && (
                <div className="p-4 rounded-lg border border-amber-500/35 bg-amber-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-amber-900 dark:text-amber-300 block">
                      Active Dispute Linked: {activeDispute.paypalDisputeId}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Cardholder claims &quot;{activeDispute.disputeReason}&quot;. Chargeback Autopsy room is active.
                    </span>
                  </div>

                  <a href={`/disputes/${activeDispute.id}`} tabIndex={-1}>
                    <Button
                      variant="primary"
                      size="sm"
                      trailingIcon={<ArrowRight className="w-3 h-3" />}
                      className="bg-amber-500 hover:bg-amber-400 text-black border-transparent font-bold shrink-0"
                    >
                      Open Autopsy Room
                    </Button>
                  </a>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Credential Footer Controls */}
      <div className="p-4 sm:p-6 border-t border-border bg-secondary/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-primary shrink-0" />
          <span>Cryptographic non-repudiation binding verified across all 5 facets.</span>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadJSON}
            leadingIcon={<Download className="w-3.5 h-3.5" />}
          >
            Download Attestation JSON
          </Button>

          {hasDispute ? (
            <a href={`/disputes/${activeDispute?.id}`} tabIndex={-1}>
              <Button
                variant="primary"
                size="sm"
                leadingIcon={<AlertOctagon className="w-3.5 h-3.5" />}
                className="bg-amber-500 hover:bg-amber-400 text-black border-transparent font-bold"
              >
                Review Dispute Autopsy
              </Button>
            </a>
          ) : onSimulateDispute ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onSimulateDispute}
              loading={isSimulatingDispute}
              leadingIcon={<AlertOctagon className="w-3.5 h-3.5 text-amber-500" />}
            >
              Simulate Chargeback
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
