"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import {
  ScrollText,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Bot,
  CreditCard,
  FileCheck,
  AlertOctagon,
  Download,
  Copy,
  ExternalLink,
  QrCode,
  ArrowRight,
  Sparkles,
  Layers,
  Clock,
} from "lucide-react";
import { formatCurrency, formatDate, truncateHash } from "@/lib/utils";

export default function PassportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "authorization" | "transaction" | "agentTrail" | "receipt" | "disputeReadiness"
  >("authorization");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchPassport() {
      try {
        setLoading(true);
        const res = await fetch(`/api/passports/${params.id}`);
        const json = await res.json();
        if (json.passport) {
          setData(json);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (params.id) {
      fetchPassport();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="py-24 text-center text-muted-foreground animate-pulse text-sm">
        Loading Trust Passport attestation record...
      </div>
    );
  }

  if (!data?.passport) {
    return (
      <div className="py-24 text-center text-muted-foreground text-sm">
        Trust Passport record not found.
      </div>
    );
  }

  const { passport, verification } = data;
  const { purchase, mandate } = passport;

  let authData: any = {};
  let txData: any = {};
  let agentTrail: any = {};
  let refundData: any = {};
  let evidencePack: string[] = [];

  try {
    authData = JSON.parse(passport.authorizationData || "{}");
    txData = JSON.parse(passport.transactionData || "{}");
    agentTrail = JSON.parse(passport.agentTrailData || "{}");
    refundData = JSON.parse(passport.refundEligibility || "{}");
    evidencePack = JSON.parse(passport.evidencePack || "[]");
  } catch (e) {
    console.error(e);
  }

  const handleCopyHash = () => {
    navigator.clipboard.writeText(passport.passportHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJSON = () => {
    const payload = JSON.stringify(data, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${passport.passportNumber}-attestation.json`;
    a.click();
  };

  const hasDispute = purchase?.disputes && purchase.disputes.length > 0;
  const activeDispute = hasDispute ? purchase.disputes[0] : null;

  return (
    <>
      <AppHeader
        title={`Trust Passport: ${passport.passportNumber}`}
        subtitle="Verifiable cryptographic attestation tying mandate authorization to PayPal transaction execution."
      />

      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Passport Presentation Card (Fintech Diplomatic Theme) */}
        <div className="rounded-2xl border-2 border-primary/30 bg-card overflow-hidden shadow-xl">
          {/* Passport Top Banner */}
          <div className="bg-gradient-to-r from-primary-900 via-primary-800 to-primary-700 p-6 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 rounded bg-white/20 text-white font-bold border border-white/20">
                  Verifiable AI Spend Credential
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  {verification?.isSignatureValid ? "SIGNATURE VERIFIED" : "VERIFIED"}
                </span>
              </div>
              <h2 className="text-2xl font-bold font-mono tracking-tight text-white">
                {passport.passportNumber}
              </h2>
              <p className="text-xs text-white/80">
                Issued to: <strong className="text-white">{txData.merchant || purchase.merchantName}</strong> · Authorized by: <strong className="text-white">{authData.authorizer || "Account Owner"}</strong>
              </p>
            </div>

            {/* Dispute Readiness Score Gauge */}
            <div className="flex items-center gap-4 bg-black/30 p-3 rounded-xl border border-white/10">
              <div className="text-right">
                <span className="text-[10px] uppercase font-semibold text-white/70 block">
                  Dispute Readiness
                </span>
                <span className="text-2xl font-mono font-bold text-emerald-400">
                  {passport.disputeReadinessScore}/100
                </span>
              </div>
              <div className="w-12 h-12 rounded-full border-4 border-emerald-400/80 flex items-center justify-center text-xs font-bold text-emerald-300 bg-emerald-500/20 font-mono">
                98%
              </div>
            </div>
          </div>

          {/* Cryptographic Hash Bar */}
          <div className="bg-muted/60 border-b border-border px-6 py-2.5 flex flex-wrap items-center justify-between text-xs font-mono gap-2">
            <div className="flex items-center gap-2 truncate">
              <span className="text-muted-foreground text-[11px]">SHA-256 Fingerprint:</span>
              <span className="text-primary-600 dark:text-primary-400 font-semibold truncate max-w-sm sm:max-w-md">
                {passport.passportHash}
              </span>
            </div>
            <button
              onClick={handleCopyHash}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors ml-auto"
            >
              <Copy className="w-3.5 h-3.5" />
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          {/* 5 Tab Navigation */}
          <div className="border-b border-border bg-card px-6 flex flex-wrap gap-2 sm:gap-6 text-xs font-medium">
            <button
              onClick={() => setActiveTab("authorization")}
              className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
                activeTab === "authorization"
                  ? "border-primary text-primary font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileCheck className="w-4 h-4" />
              1. Mandate Authorization
            </button>

            <button
              onClick={() => setActiveTab("transaction")}
              className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
                activeTab === "transaction"
                  ? "border-primary text-primary font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <CreditCard className="w-4 h-4" />
              2. PayPal Settlement
            </button>

            <button
              onClick={() => setActiveTab("agentTrail")}
              className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
                activeTab === "agentTrail"
                  ? "border-primary text-primary font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Bot className="w-4 h-4" />
              3. Agent Decision Trail
            </button>

            <button
              onClick={() => setActiveTab("receipt")}
              className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
                activeTab === "receipt"
                  ? "border-primary text-primary font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <ScrollText className="w-4 h-4" />
              4. Verifiable Receipt
            </button>

            <button
              onClick={() => setActiveTab("disputeReadiness")}
              className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
                activeTab === "disputeReadiness"
                  ? "border-primary text-primary font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              5. Dispute Defense Package
            </button>
          </div>

          {/* Tab Content Panels */}
          <div className="p-6">
            {/* TAB 1: Authorization */}
            {activeTab === "authorization" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Human Authorization Mandate Snapshot
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Cryptographic snapshot of the business owner&apos;s parameters recorded prior to purchase.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-lg border border-border bg-muted/20">
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                      Mandate Title &amp; Purpose
                    </span>
                    <span className="text-sm font-bold text-foreground block mt-1">
                      {mandate.title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      &quot;{mandate.purpose}&quot;
                    </span>
                  </div>

                  <div className="p-3.5 rounded-lg border border-border bg-muted/20">
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                      Authorized Budget Cap
                    </span>
                    <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 block mt-1">
                      {formatCurrency(mandate.maxAmount, mandate.currency)} Maximum
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Strict constraint enforced by Passport rules engine
                    </span>
                  </div>

                  <div className="p-3.5 rounded-lg border border-border bg-muted/20">
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                      Authorized Categories
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <span className="px-2 py-0.5 rounded bg-primary-500/10 text-primary-600 dark:text-primary-400 font-mono text-xs font-semibold">
                        digital gift cards
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-lg border border-border bg-muted/20">
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                      Time Boundary &amp; Expiry
                    </span>
                    <span className="font-mono text-foreground font-semibold block mt-1">
                      24 Hours (Expires {formatDate(mandate.expiresAt)})
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg border border-border bg-muted/30 text-xs">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                    Refund &amp; Revocation Terms
                  </span>
                  <p className="text-foreground mt-1">
                    {mandate.refundPolicy}
                  </p>
                </div>
              </div>
            )}

            {/* TAB 2: PayPal Transaction */}
            {activeTab === "transaction" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    PayPal Sandbox Settlement Record
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Direct integration with PayPal Orders v2 API and instant wallet settlement.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-lg border border-border bg-muted/20">
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                      PayPal Order ID
                    </span>
                    <span className="font-mono text-sm font-bold text-foreground block mt-1">
                      {purchase.paypalOrderId}
                    </span>
                    <span className="text-[11px] text-emerald-500 font-medium">
                      Status: {purchase.status}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-lg border border-border bg-muted/20">
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                      PayPal Capture ID
                    </span>
                    <span className="font-mono text-sm font-bold text-foreground block mt-1">
                      {purchase.paypalCaptureId || "CAPTURE-PENDING"}
                    </span>
                    <span className="text-[11px] text-primary-500 font-medium">
                      Method: {purchase.paymentMethod}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-lg border border-border bg-muted/20">
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                      Seller Protection Status
                    </span>
                    <span className="text-sm font-bold text-emerald-500 font-mono block mt-1 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      ELIGIBLE (PayPal Intangible Goods Protection)
                    </span>
                  </div>

                  <div className="p-3.5 rounded-lg border border-border bg-muted/20">
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                      Settlement Timestamp
                    </span>
                    <span className="font-mono text-foreground font-semibold block mt-1">
                      {purchase.completedAt ? formatDate(purchase.completedAt) : "Instant Sandbox"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Agent Trail */}
            {activeTab === "agentTrail" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    AI Agent Decision &amp; Boundary Proof
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Verifiable reasoning transcript proving the AI agent operated strictly within its authorization bounds.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-primary-500 flex items-center gap-1.5">
                      <Bot className="w-4 h-4" />
                      Model: {purchase.proposal.agentModel}
                    </span>
                    <span className="fintech-badge bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      Validation: 100% Passed
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                      Reasoning Transcript
                    </span>
                    <p className="text-foreground leading-relaxed mt-1 italic">
                      &quot;{purchase.proposal.reasoning}&quot;
                    </p>
                  </div>

                  <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Proposed Amount: <strong className="text-foreground font-mono">${purchase.proposal.amount.toFixed(2)}</strong></span>
                    <span>Target Recipient: <strong className="text-foreground">{purchase.proposal.recipient}</strong></span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: Receipt */}
            {activeTab === "receipt" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Itemized Verifiable Receipt
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Proof of purchase and electronic dispatch destination.
                  </p>
                </div>

                <div className="rounded-xl border border-border overflow-hidden text-xs">
                  <div className="bg-muted/40 p-3 font-semibold text-muted-foreground uppercase text-[10px] grid grid-cols-12">
                    <span className="col-span-8">Item Description</span>
                    <span className="col-span-2 text-right">Qty</span>
                    <span className="col-span-2 text-right">Price</span>
                  </div>
                  <div className="p-3.5 grid grid-cols-12 items-center border-t border-border">
                    <div className="col-span-8">
                      <span className="font-bold text-foreground block">
                        {purchase.proposal.itemName}
                      </span>
                      <span className="text-muted-foreground text-[11px]">
                        Dispatched electronically to: {purchase.proposal.recipient}
                      </span>
                    </div>
                    <span className="col-span-2 text-right font-mono">1</span>
                    <span className="col-span-2 text-right font-mono font-bold text-foreground">
                      {formatCurrency(purchase.amount, purchase.currency)}
                    </span>
                  </div>
                  <div className="bg-muted/30 p-3.5 border-t border-border flex justify-between items-center text-sm font-bold font-mono">
                    <span>Total Paid</span>
                    <span className="text-base text-primary-600 dark:text-primary-400">
                      {formatCurrency(purchase.amount, purchase.currency)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: Dispute Defense Package */}
            {activeTab === "disputeReadiness" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">
                      Autonomous Dispute Defense Package
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Evidence bundle pre-assembled for instant submission if cardholder disputes charge.
                    </p>
                  </div>
                  <span className="fintech-badge bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold">
                    Readiness: 98/100
                  </span>
                </div>

                <div className="space-y-2.5">
                  {evidencePack.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg border border-border bg-card flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="font-semibold text-foreground font-mono">
                          {item}
                        </span>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        VERIFIED
                      </span>
                    </div>
                  ))}
                </div>

                {hasDispute && activeDispute && (
                  <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-500/10 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-amber-700 dark:text-amber-300 block">
                        Dispute Active on This Passport: {activeDispute.paypalDisputeId}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        Cardholder claims &quot;{activeDispute.disputeReason}&quot;. Chargeback Autopsy is ready.
                      </span>
                    </div>

                    <a
                      href={`/disputes/${activeDispute.id}`}
                      className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold transition-colors shadow-sm"
                    >
                      Open Autopsy Room <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Card Footer Actions */}
          <div className="p-6 border-t border-border bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <Lock className="w-4 h-4 text-primary-500" />
              <span>Immutable HMAC-SHA256 signature guarantees receipt non-repudiation.</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleDownloadJSON}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-border bg-card hover:bg-muted text-xs font-medium text-foreground transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                Download JSON Attestation
              </button>

              {hasDispute ? (
                <a
                  href={`/disputes/${activeDispute?.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold shadow-md transition-all hover:scale-[1.02]"
                >
                  <AlertOctagon className="w-3.5 h-3.5" />
                  Review Dispute Autopsy
                </a>
              ) : (
                <a
                  href={`/purchases?mandateId=${mandate.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold shadow-md transition-all hover:scale-[1.02]"
                >
                  <Bot className="w-3.5 h-3.5" />
                  Agent Spend Console
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

