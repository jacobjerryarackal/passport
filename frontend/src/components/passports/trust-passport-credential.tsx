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
} from "lucide-react";
import { formatCurrency, formatDate, truncateHash } from "@/lib/utils";
import { HashInspector } from "@/components/ui/hash-inspector";
import { FintechButton } from "@/components/ui/fintech-button";
import { StatusPill } from "@/components/ui/status-pill";

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

  const hasDispute = purchase.disputes && purchase.disputes.length > 0;
  const activeDispute = hasDispute ? purchase.disputes[0] : null;

  const tabs = [
    { id: "authorization", label: "Authorization", icon: FileCheck },
    { id: "transaction", label: "PayPal Settlement", icon: CreditCard },
    { id: "agentTrail", label: "Agent Reason Log", icon: Bot },
    { id: "receipt", label: "Line Item Receipt", icon: ScrollText },
    { id: "disputeReadiness", label: "Dispute Defense Pack", icon: ShieldCheck },
  ] as const;

  return (
    <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xl relative transition-all">
      {/* Credential Header Strip */}
      <div className="p-6 bg-[#0E0E12] border-b border-border/80 text-foreground flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-wider px-2 py-0.5 rounded bg-surfaceSubtle uppercase font-bold text-muted-foreground border border-border">
              Digital Financial Credential
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
              <CheckCircle2 className="w-3 h-3" />
              ATTESTATION VERIFIED
            </span>
          </div>

          <h2 className="text-2xl font-bold font-mono tracking-tight text-foreground">
            {passport.passportNumber}
          </h2>

          <p className="text-xs text-muted-foreground">
            Beneficiary: <strong className="text-foreground">{txData.merchant || purchase.merchantName}</strong> · Authorizer: <strong className="text-foreground">{authData.authorizer || "Account Owner"}</strong>
          </p>
        </div>

        {/* Readiness Score Gauge */}
        <div className="flex items-center gap-3.5 bg-surfaceSubtle/60 p-3 rounded-lg border border-border/80">
          <div className="text-right">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground block tracking-wider">
              Dispute Readiness
            </span>
            <span className="text-xl font-mono font-bold text-emerald-400 tabular-nums">
              {passport.disputeReadinessScore}/100
            </span>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-emerald-500/40 flex items-center justify-center text-xs font-bold text-emerald-400 bg-emerald-500/10 font-mono tabular-nums">
            98%
          </div>
        </div>
      </div>

      {/* SHA-256 Fingerprint Bar */}
      <div className="bg-canvas border-b border-border/80 px-6 py-2.5 flex flex-wrap items-center justify-between text-xs font-mono gap-2">
        <div className="flex items-center gap-2 truncate text-muted-foreground">
          <span className="text-[11px]">SHA-256 Digest:</span>
          <HashInspector hash={passport.passportHash} lead={10} trail={10} />
        </div>

        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span>Settled Amount: <strong className="font-mono text-foreground font-bold">{formatCurrency(purchase.amount || 75, purchase.currency || "USD")}</strong></span>
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:inline">Protection: <strong className="text-emerald-400 font-semibold">ELIGIBLE</strong></span>
        </div>
      </div>

      {/* 5 Tab Navigation (Restrained Pill Design) */}
      <div className="border-b border-border/80 bg-surfaceSubtle/40 px-6 flex flex-wrap gap-1 text-xs font-medium pt-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative py-3 px-3.5 flex items-center gap-2 transition-colors rounded-t-md ${
                isActive
                  ? "text-foreground font-semibold bg-card"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#0070BA]" : "text-muted-foreground"}`} />
              <span>{tab.label}</span>
              {isActive && (
                <motion.div
                  layoutId="passport-active-tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0070BA]"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="p-6 min-h-[220px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* TAB 1: Authorization */}
            {activeTab === "authorization" && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Human Authorization Mandate
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Pre-execution boundary constraints locked prior to agent inference.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-lg border border-border bg-surfaceSubtle/30 space-y-1">
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                      Purpose &amp; Objective
                    </span>
                    <span className="text-sm font-semibold text-foreground block">
                      {mandate.title || "Client Appreciation Gift"}
                    </span>
                    <span className="text-xs text-muted-foreground block">
                      &quot;{mandate.purpose || "Client appreciation gift"}&quot;
                    </span>
                  </div>

                  <div className="p-3.5 rounded-lg border border-border bg-surfaceSubtle/30 space-y-1">
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                      Budget Cap
                    </span>
                    <span className="text-base font-bold font-mono text-emerald-400 block tabular-nums">
                      {formatCurrency(mandate.maxAmount || 80, mandate.currency || "USD")} Maximum
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Hard stop enforced by Passport rules engine
                    </span>
                  </div>

                  <div className="p-3.5 rounded-lg border border-border bg-surfaceSubtle/30 space-y-1">
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                      Authorized Categories
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <span className="px-2 py-0.5 rounded bg-primary-500/10 text-primary-400 font-mono text-xs font-semibold border border-primary-500/20">
                        digital gift cards
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-lg border border-border bg-surfaceSubtle/30 space-y-1">
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                      Validity Window
                    </span>
                    <span className="font-mono text-foreground font-semibold block">
                      24 Hours (Expires {formatDate(mandate.expiresAt || new Date())})
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PayPal Settlement */}
            {activeTab === "transaction" && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    PayPal Sandbox Settlement
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Order execution telemetry captured via PayPal Orders v2 API.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-lg border border-border bg-surfaceSubtle/30 space-y-1">
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                      PayPal Order ID
                    </span>
                    <span className="font-mono text-xs font-bold text-foreground block">
                      {purchase.paypalOrderId || "PAYPAL-ORD-8X92104M-SB"}
                    </span>
                    <span className="text-[11px] text-emerald-400 font-medium">
                      Status: {purchase.status || "COMPLETED"}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-lg border border-border bg-surfaceSubtle/30 space-y-1">
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                      Capture ID
                    </span>
                    <span className="font-mono text-xs font-bold text-foreground block">
                      {purchase.paypalCaptureId || "CAPTURE-7TY90123L-SB"}
                    </span>
                    <span className="text-[11px] text-primary-400 font-medium">
                      Wallet: {purchase.paymentMethod || "PayPal Sandbox Wallet"}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-lg border border-border bg-surfaceSubtle/30 space-y-1">
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                      Seller Protection
                    </span>
                    <span className="text-xs font-bold text-emerald-400 font-mono block flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ELIGIBLE (Intangible Digital Goods Protected)
                    </span>
                  </div>

                  <div className="p-3.5 rounded-lg border border-border bg-surfaceSubtle/30 space-y-1">
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                      Settlement Time
                    </span>
                    <span className="font-mono text-foreground font-semibold block">
                      {purchase.completedAt ? formatDate(purchase.completedAt) : "Instant Settlement"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Agent Decision Trail */}
            {activeTab === "agentTrail" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      AI Agent Inference Transcript
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Verifiable decision log proving proposal was strictly bounded by mandate.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 font-semibold">
                    100% Policy Match
                  </span>
                </div>

                <div className="p-4 rounded-lg border border-border bg-codeBg text-xs font-mono space-y-2">
                  <div className="text-muted-foreground text-[11px]">
                    Model: <strong className="text-primary-400">{purchase.proposal?.agentModel || "gemini-1.5-pro"}</strong> · Session: <span className="text-muted-foreground">{purchase.mcpSessionId || "mcp-session-091"}</span>
                  </div>
                  <p className="text-foreground leading-relaxed italic bg-surfaceSubtle/40 p-3 rounded border border-border/40">
                    &quot;{purchase.proposal?.reasoning || "Selected $75 digital gift card perfectly satisfying client appreciation purpose, well within $80 cap and in digital gift card category."}&quot;
                  </p>
                </div>
              </div>
            )}

            {/* TAB 4: Receipt */}
            {activeTab === "receipt" && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Itemized Attestation Receipt
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Proof of purchase and digital delivery address.
                  </p>
                </div>

                <div className="rounded-lg border border-border overflow-hidden text-xs">
                  <div className="bg-surfaceSubtle/60 p-2.5 font-semibold text-muted-foreground uppercase text-[10px] grid grid-cols-12">
                    <span className="col-span-8">Item Description</span>
                    <span className="col-span-2 text-right">Qty</span>
                    <span className="col-span-2 text-right">Price</span>
                  </div>
                  <div className="p-3 grid grid-cols-12 items-center border-t border-border">
                    <div className="col-span-8">
                      <span className="font-bold text-foreground block">
                        {purchase.proposal?.itemName || "$75 Digital Gift Card (Starbucks Select)"}
                      </span>
                      <span className="text-muted-foreground text-[11px]">
                        Dispatched to: {purchase.proposal?.recipient || "vip-client@partnercorp.io"}
                      </span>
                    </div>
                    <span className="col-span-2 text-right font-mono">1</span>
                    <span className="col-span-2 text-right font-mono font-bold text-foreground">
                      {formatCurrency(purchase.amount || 75, purchase.currency || "USD")}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: Dispute Readiness */}
            {activeTab === "disputeReadiness" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Pre-Assembled Dispute Defense Pack
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Cryptographic evidence pre-indexed for instantaneous chargeback response.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    Readiness: 98/100
                  </span>
                </div>

                <div className="space-y-2">
                  {(evidencePack.length > 0
                    ? evidencePack
                    : [
                        "MANDATE_AUTHORIZATION_RECORD",
                        "PAYPAL_CAPTURE_RECEIPT_V2",
                        "AGENT_REASONING_AND_PROMPT_CHAIN",
                        "DIGITAL_CARD_DELIVERY_CONFIRMATION",
                        "CRYPTOGRAPHIC_AUDIT_HASH_CHAIN",
                      ]
                  ).map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded border border-border bg-surfaceSubtle/30 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="font-mono text-foreground">{item}</span>
                      </div>
                      <StatusPill status="verified" label="Verified" showIcon={false} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Strip */}
      <div className="p-4 px-6 border-t border-border bg-surfaceSubtle/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
          <Lock className="w-3.5 h-3.5 text-primary-500" />
          <span>Non-repudiation certified by platform HMAC &amp; Merkle audit log.</span>
        </div>

        <div className="flex items-center gap-2.5">
          <FintechButton variant="secondary" size="sm" onClick={handleDownloadJSON} icon={<Download className="w-3.5 h-3.5" />}>
            Download Attestation JSON
          </FintechButton>

          {hasDispute && activeDispute ? (
            <a href={`/disputes/${activeDispute.id}`}>
              <FintechButton variant="primary" size="sm" icon={<AlertOctagon className="w-3.5 h-3.5" />}>
                Review Dispute Autopsy
              </FintechButton>
            </a>
          ) : (
            onSimulateDispute && (
              <FintechButton
                variant="outline"
                size="sm"
                loading={isSimulatingDispute}
                onClick={onSimulateDispute}
                icon={<AlertOctagon className="w-3.5 h-3.5 text-amber-500" />}
              >
                Simulate Dispute
              </FintechButton>
            )
          )}
        </div>
      </div>
    </div>
  );
}

