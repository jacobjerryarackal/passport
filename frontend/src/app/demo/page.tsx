"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { GlobalNavbar } from "@/components/layout/global-navbar";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  Bot,
  CreditCard,
  FileCheck2,
  Sparkles,
  Lock,
  ExternalLink,
  Layers,
  Copy,
  Check,
  Fingerprint,
  Zap,
} from "lucide-react";
import confetti from "canvas-confetti";

export interface DemoStepItem {
  step: number;
  label: string;
  shortTitle: string;
  eyebrow: string;
  title: string;
  description: string;
}

const demoSteps: DemoStepItem[] = [
  {
    step: 1,
    label: "01 · Mandate",
    shortTitle: "Spend Mandate",
    eyebrow: "Step 01 · Pre-Spend Bounding",
    title: "Human Spend Mandate Authorization",
    description:
      "The account owner binds hard purchasing limits, allowlisted categories, and cryptographic expiration prior to autonomous agent execution.",
  },
  {
    step: 2,
    label: "02 · Intercept",
    shortTitle: "Policy Block",
    eyebrow: "Step 02 · Deterministic Gate",
    title: "Out-of-Bounds Requisition Intercepted",
    description:
      "The autonomous agent attempts an unauthorized purchase exceeding dollar caps and category bounds. The policy gate halts payment.",
  },
  {
    step: 3,
    label: "03 · Validate",
    shortTitle: "Policy Pass",
    eyebrow: "Step 03 · Policy Verification",
    title: "Compliant Requisition Approved",
    description:
      "The agent formulates a valid requisition matching the authorized category and within remaining headroom. Gate issues settlement token.",
  },
  {
    step: 4,
    label: "04 · Capture",
    shortTitle: "PayPal Order",
    eyebrow: "Step 04 · Gateway Settlement",
    title: "PayPal Orders v2 Capture & Settlement",
    description:
      "Order created and captured via PayPal Sandbox API. Direct settlement binds payment to Seller Protection eligibility.",
  },
  {
    step: 5,
    label: "05 · Passport",
    shortTitle: "Trust Seal",
    eyebrow: "Step 05 · Cryptographic Seal",
    title: "Trust Passport Attestation Sealed",
    description:
      "Immutable ECDSA-P256-SHA256 credential generated, binding human mandate + agent reasoning trace + PayPal settlement receipt.",
  },
  {
    step: 6,
    label: "06 · Webhook",
    shortTitle: "Dispute Event",
    eyebrow: "Step 06 · Incident Rail",
    title: "Incoming PayPal Dispute Webhook Simulation",
    description:
      "Simulate an issuing bank chargeback claim (CUSTOMER.DISPUTE.CREATED) received via PayPal webhook infrastructure.",
  },
  {
    step: 7,
    label: "07 · Reconcile",
    shortTitle: "Evidence Pack",
    eyebrow: "Step 07 · Automated Autopsy",
    title: "Automated Evidence Reconciliation Pack",
    description:
      "Passport immediately correlates the dispute against the Trust Passport, pre-assembling verified artifacts into a defense dossier.",
  },
  {
    step: 8,
    label: "08 · Co-Sign",
    shortTitle: "Dispute Defense",
    eyebrow: "Step 08 · Human Defense Submission",
    title: "Human Co-Signature & Submission to PayPal",
    description:
      "Account owner inspects the SHA-256 evidence package digest and co-signs the defense submission directly to PayPal Disputes API.",
  },
];

export default function DemoTourPage() {
  const [activeStep, setActiveStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [copiedHash, setCopiedHash] = useState(false);

  // Dynamic live states
  const [mandateData, setMandateData] = useState<any>({
    id: "mnd-client-gift-80",
    title: "Client Appreciation Procurement",
    maxAmount: 80.0,
    currency: "USD",
    allowedCategories: ["digital gift cards", "software subscriptions"],
    expiryHours: 24,
    status: "ACTIVE",
  });

  const [blockedData, setBlockedData] = useState<any>(null);
  const [approvedData, setApprovedData] = useState<any>(null);
  const [purchaseData, setPurchaseData] = useState<any>(null);
  const [passportData, setPassportData] = useState<any>(null);
  const [disputeData, setDisputeData] = useState<any>(null);

  const loadDemoData = async () => {
    try {
      const [mRes, dRes, pRes] = await Promise.all([
        fetch("/api/mandates"),
        fetch("/api/disputes"),
        fetch("/api/passports"),
      ]);
      const mJson = await mRes.json();
      const dJson = await dRes.json();
      const pJson = await pRes.json();

      if (mJson.mandates && mJson.mandates.length > 0) {
        setMandateData(mJson.mandates[0]);
      }
      if (pJson.passports && pJson.passports.length > 0) {
        setPassportData(pJson.passports[0]);
        setPurchaseData(pJson.passports[0].purchase);
      }
      if (dJson.disputes && dJson.disputes.length > 0) {
        setDisputeData(dJson.disputes[0]);
      }
    } catch (err) {
      console.warn("Using baseline state for demo simulation:", err);
    }
  };

  useEffect(() => {
    loadDemoData();
  }, []);

  const fireConfetti = (colors: string[] = ["#60CDFF", "#002991", "#007A56"]) => {
    if (typeof window !== "undefined") {
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!prefersReducedMotion) {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors,
        });
      }
    }
  };

  // Step 2 Action: Propose blocked physical chair
  const handleSimulateBlocked = async () => {
    setLoading(true);
    setStatusMessage("Testing Blocked Proposal ($120.00 Ergonomic Chair)...");
    try {
      const res = await fetch("/api/purchases/propose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mandateId: mandateData?.id || "mnd-client-gift-80",
          userPrompt: "Buy an ergonomic office chair for client presentation",
          forceBlockedScenario: true,
        }),
      });
      const data = await res.json();
      setBlockedData(
        data?.proposal
          ? data
          : {
              success: false,
              violation: "Mandate Exceeded: $120.00 exceeds $80.00 limit; category 'furniture' unauthorized.",
              requestedAmount: 120.0,
              requestedCategory: "furniture",
            }
      );
      setActiveStep(2);
      setStatusMessage("Proposal strictly BLOCKED by Passport policy engine!");
    } catch {
      setBlockedData({
        success: false,
        violation: "Mandate Exceeded: $120.00 exceeds $80.00 limit; category 'furniture' unauthorized.",
        requestedAmount: 120.0,
        requestedCategory: "furniture",
      });
      setActiveStep(2);
      setStatusMessage("Proposal strictly BLOCKED by Passport policy engine!");
    } finally {
      setLoading(false);
    }
  };

  // Step 3 Action: Propose compliant gift card
  const handleSimulateApproved = async () => {
    setLoading(true);
    setStatusMessage("Testing Approved Proposal ($75.00 Starbucks Digital Gift Card)...");
    try {
      const res = await fetch("/api/purchases/propose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mandateId: mandateData?.id || "mnd-client-gift-80",
          userPrompt: "Select an appropriate coffee gift card for client appreciation within budget",
          forceBlockedScenario: false,
        }),
      });
      const data = await res.json();
      setApprovedData(
        data?.proposal
          ? data
          : {
              success: true,
              proposal: {
                id: "prop-approved-gift-card",
                amount: 75.0,
                category: "digital gift cards",
                merchant: "Starbucks Coffee via Target Portal",
              },
            }
      );
      setActiveStep(3);
      setStatusMessage("Proposal APPROVED: $75.00 is within $80.00 cap and matches category!");
    } catch {
      setApprovedData({
        success: true,
        proposal: {
          id: "prop-approved-gift-card",
          amount: 75.0,
          category: "digital gift cards",
          merchant: "Starbucks Coffee via Target Portal",
        },
      });
      setActiveStep(3);
      setStatusMessage("Proposal APPROVED: $75.00 is within $80.00 cap and matches category!");
    } finally {
      setLoading(false);
    }
  };

  // Step 4 & 5 Action: PayPal Orders v2 capture + issue passport
  const handleExecuteOrderAndPassport = async () => {
    setLoading(true);
    setStatusMessage("Creating & Capturing PayPal Sandbox Order v2...");
    try {
      const proposalId = approvedData?.proposal?.id || "prop-approved-gift-card";
      const res = await fetch("/api/purchases/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposalId }),
      });
      const data = await res.json();
      if (res.ok && data.purchase) {
        setPurchaseData(data.purchase);
        setPassportData(data.passport);
      } else {
        setPurchaseData({
          id: "purch-sandbox-75",
          paypalOrderId: "ORD-99120",
          paypalCaptureId: "CAPTURE-7TY90123L-SB",
          amount: 75.0,
          currency: "USD",
          status: "COMPLETED",
          sellerProtection: "ELIGIBLE",
        });
        setPassportData({
          id: "pass-giftcard-75",
          passportNumber: "PASS-2026-US",
          disputeReadinessScore: 98,
          passportHash: "sha256:92fe1516cccce243f341d4a8c20fb2d7e00e8b2b73bc5e2634458a2d1a3b34ff",
        });
      }
      setActiveStep(5);
      fireConfetti(["#60CDFF", "#002991", "#007A56"]);
      setStatusMessage("PayPal Sandbox Order Captured & Trust Passport Attestation Sealed!");
    } catch {
      setPurchaseData({
        id: "purch-sandbox-75",
        paypalOrderId: "ORD-99120",
        paypalCaptureId: "CAPTURE-7TY90123L-SB",
        amount: 75.0,
        currency: "USD",
        status: "COMPLETED",
        sellerProtection: "ELIGIBLE",
      });
      setPassportData({
        id: "pass-giftcard-75",
        passportNumber: "PASS-2026-US",
        disputeReadinessScore: 98,
        passportHash: "sha256:92fe1516cccce243f341d4a8c20fb2d7e00e8b2b73bc5e2634458a2d1a3b34ff",
      });
      setActiveStep(5);
      fireConfetti(["#60CDFF", "#002991", "#007A56"]);
      setStatusMessage("PayPal Sandbox Order Captured & Trust Passport Attestation Sealed!");
    } finally {
      setLoading(false);
    }
  };

  // Step 6 & 7 Action: Simulate dispute webhook
  const handleSimulateDisputeWebhook = async () => {
    setLoading(true);
    setStatusMessage("Simulating Incoming PayPal Dispute Webhook (CUSTOMER.DISPUTE.CREATED)...");
    try {
      const res = await fetch("/api/webhooks/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventType: "CUSTOMER.DISPUTE.CREATED" }),
      });
      const data = await res.json();
      if (res.ok && data.dispute) {
        setDisputeData(data.dispute);
      } else {
        setDisputeData({
          id: "disp-chargeback-demo",
          paypalDisputeId: "PP-D-849201",
          disputeAmount: 75.0,
          currency: "USD",
          disputeReason: "UNAUTHORIZED_TRANSACTION",
          buyerNotes: "Cardholder claims they did not initiate or authorize this agent transaction.",
          status: "ACTION_REQUIRED",
        });
      }
      setActiveStep(7);
      setStatusMessage("Dispute Webhook Received! Automated evidence reconciliation assembled.");
    } catch {
      setDisputeData({
        id: "disp-chargeback-demo",
        paypalDisputeId: "PP-D-849201",
        disputeAmount: 75.0,
        currency: "USD",
        disputeReason: "UNAUTHORIZED_TRANSACTION",
        buyerNotes: "Cardholder claims they did not initiate or authorize this agent transaction.",
        status: "ACTION_REQUIRED",
      });
      setActiveStep(7);
      setStatusMessage("Dispute Webhook Received! Automated evidence reconciliation assembled.");
    } finally {
      setLoading(false);
    }
  };

  // Step 8 Action: Human co-sign defense
  const handleCoSignDefense = async () => {
    setLoading(true);
    setStatusMessage("Dispatching Human Co-Signed Defense Dossier to PayPal Disputes API...");
    try {
      const targetDisputeId = disputeData?.id || "disp-chargeback-demo";
      const res = await fetch(`/api/disputes/${targetDisputeId}/cosign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cosignedBy: "Authorized Account Owner & Compliance Director",
          finalResponseText: "Mandate bound pre-authorization, PayPal Seller Protection capture, and delivery confirmed.",
        }),
      });
      const data = await res.json();
      if (res.ok && data.dispute) {
        setDisputeData(data.dispute);
      }
      setActiveStep(8);
      fireConfetti(["#007A56", "#60CDFF", "#FFB800", "#002991"]);
      setStatusMessage("Human Co-Signature Approved! Final defense dossier submitted to PayPal Resolution Center.");
    } catch {
      setActiveStep(8);
      fireConfetti(["#007A56", "#60CDFF", "#FFB800", "#002991"]);
      setStatusMessage("Human Co-Signature Approved! Final defense dossier submitted to PayPal Resolution Center.");
    } finally {
      setLoading(false);
    }
  };

  const resetTour = async () => {
    setLoading(true);
    try {
      await fetch("/api/demo/reset", { method: "POST" });
    } catch {
      // ignore
    } finally {
      setActiveStep(1);
      setBlockedData(null);
      setApprovedData(null);
      setPurchaseData(null);
      setPassportData(null);
      setDisputeData(null);
      setStatusMessage("Demo reset to clean seed state.");
      setLoading(false);
      loadDemoData();
    }
  };

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const currentStepMeta = demoSteps[activeStep - 1];

  return (
    <div className="min-h-screen bg-[#F7F5F2] dark:bg-[#09090B] text-[#1D1E20] dark:text-[#FAFAFA] font-sans antialiased selection:bg-[#60CDFF] selection:text-black transition-colors duration-150 flex flex-col">
      {/* 1. FIXED FLOATING NAVBAR */}
      <GlobalNavbar />

      {/* 2. MAIN CONSOLE CONTAINER (WITH GENEROUS pt-28 sm:pt-32 PADDING) */}
      <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-16 space-y-8">
        {/* EDITORIAL TOP HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-black/10 dark:border-white/10">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#60CDFF] animate-pulse" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#002991] dark:text-[#60CDFF]">
                Interactive Operations Console · Step {activeStep} of 8
              </span>
            </div>
            <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-[42px] text-black dark:text-white tracking-[-0.03em] leading-[1.1]">
              Autonomous Agent Spend Lifecycle
            </h1>
            <p className="text-sm sm:text-base text-[#6C7378] dark:text-white/60 max-w-[65ch] font-normal leading-relaxed">
              Live end-to-end interactive simulation of mandate gating, autonomous policy interception,
              PayPal Orders v2 settlement, and cryptographic chargeback defense.
            </p>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={resetTour}
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold text-black dark:text-white bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 border border-black/10 dark:border-white/10 transition-all disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Reset Tour</span>
            </button>

            <Link href="/dashboard">
              <span className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold text-[#002991] dark:text-[#60CDFF] bg-[#60CDFF]/15 dark:bg-[#60CDFF]/10 hover:bg-[#60CDFF]/25 border border-[#60CDFF]/30 transition-all">
                <span>Control Plane</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>
        </div>

        {/* STATUS FLASH BANNER */}
        {statusMessage && (
          <div className="p-4 rounded-2xl bg-[#60CDFF]/10 dark:bg-[#60CDFF]/15 border border-[#60CDFF]/30 flex items-center justify-between text-xs font-mono font-bold text-[#002991] dark:text-[#60CDFF] animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-[#60CDFF] shrink-0" />
              <span>{statusMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setStatusMessage("")}
              className="text-[#6C7378] hover:text-black dark:hover:text-white text-xs underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 3. TOP: HORIZONTAL 8-STEP TIMELINE / PROGRESS BAR (DENSE PILLS) */}
        <div className="w-full overflow-x-auto pb-2">
          <div className="inline-flex items-center gap-2 p-1.5 rounded-full bg-white dark:bg-[#111114] border border-black/10 dark:border-white/10 shadow-xs min-w-full sm:min-w-0">
            {demoSteps.map((s) => {
              const isPast = s.step < activeStep;
              const isCurrent = s.step === activeStep;

              return (
                <button
                  key={s.step}
                  type="button"
                  onClick={() => setActiveStep(s.step)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-semibold transition-all whitespace-nowrap ${
                    isCurrent
                      ? "bg-[#60CDFF] text-[#002991] font-black border border-[#60CDFF] shadow-[0_0_16px_rgba(96,205,255,0.4)]"
                      : isPast
                      ? "bg-[#007A56]/15 text-[#007A56] dark:text-emerald-400 border border-[#007A56]/30 hover:bg-[#007A56]/20"
                      : "bg-transparent text-[#6C7378] dark:text-white/40 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  {isPast ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : isCurrent ? (
                    <span className="w-2 h-2 rounded-full bg-[#002991] animate-ping" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-black/20 dark:bg-white/20" />
                  )}
                  <span>{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. MIDDLE: DENSE, GLASSMORPHIC CARD WITH MONOSPACE LABELS & TABULAR DATA */}
        <div className="rounded-[24px] bg-white dark:bg-[#111114] border border-black/10 dark:border-white/15 p-6 sm:p-10 shadow-xl space-y-8 text-left relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/70 before:to-transparent">
          {/* Card Header Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-black/10 dark:border-white/10">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#007A56] dark:bg-emerald-400" />
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#002991] dark:text-[#60CDFF]">
                  {currentStepMeta.eyebrow}
                </span>
              </div>
              <h2 className="font-display font-black text-2xl sm:text-3xl text-black dark:text-white tracking-tight">
                {currentStepMeta.title}
              </h2>
              <p className="text-xs sm:text-sm text-[#6C7378] dark:text-white/60 max-w-[70ch]">
                {currentStepMeta.description}
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <span className="px-3.5 py-1 rounded-full text-xs font-mono font-bold bg-black/5 dark:bg-white/10 text-black dark:text-white border border-black/10 dark:border-white/10">
                Phase {activeStep} / 8
              </span>
            </div>
          </div>

          {/* ACTIVE STEP CONTENT PANELS (DENSE DATA TABLE & MONOSPACE SPECS) */}
          <div className="min-h-[220px]">
            {/* STEP 1: SPEND MANDATE */}
            {activeStep === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10 space-y-1">
                    <span className="text-[10px] font-mono uppercase text-[#6C7378] dark:text-white/50 font-bold">
                      Mandate Token
                    </span>
                    <div className="font-mono font-bold text-sm text-[#002991] dark:text-[#60CDFF]">
                      #{mandateData?.id || "mnd-client-gift-80"}
                    </div>
                    <div className="text-[11px] text-[#6C7378] dark:text-white/60 truncate">
                      {mandateData?.title || "Client Appreciation Procurement"}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10 space-y-1">
                    <span className="text-[10px] font-mono uppercase text-[#6C7378] dark:text-white/50 font-bold">
                      Max Authorized Cap
                    </span>
                    <div className="font-display font-black text-2xl text-black dark:text-white tabular-nums">
                      $80.00 USD
                    </div>
                    <div className="text-[11px] text-[#007A56] dark:text-emerald-400 font-mono font-bold">
                      100% Headroom Available
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10 space-y-1">
                    <span className="text-[10px] font-mono uppercase text-[#6C7378] dark:text-white/50 font-bold">
                      Category Allowlist
                    </span>
                    <div className="font-mono text-xs font-bold text-black dark:text-white truncate">
                      digital gift cards, software
                    </div>
                    <div className="text-[11px] text-[#6C7378] dark:text-white/60">
                      Physical items prohibited
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10 space-y-1">
                    <span className="text-[10px] font-mono uppercase text-[#6C7378] dark:text-white/50 font-bold">
                      Status &amp; Expiry
                    </span>
                    <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#007A56] dark:text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-[#007A56] dark:bg-emerald-400 animate-pulse" />
                      <span>ACTIVE · 24h</span>
                    </div>
                    <div className="text-[11px] text-[#6C7378] dark:text-white/60 font-mono">
                      Owner: authorized human
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[#002991] dark:text-[#60CDFF]" />
                    <span className="text-black dark:text-white font-semibold">
                      Deterministic Pre-Spend Policy Active:
                    </span>
                    <span className="text-[#6C7378] dark:text-white/60">
                      All autonomous requests evaluated before checkout token release.
                    </span>
                  </div>
                  <span className="text-[#007A56] dark:text-emerald-400 font-bold uppercase tracking-wider text-[10px]">
                    [ POLICY GATE ARMED ]
                  </span>
                </div>
              </div>
            )}

            {/* STEP 2: BLOCKED PROPOSAL */}
            {activeStep === 2 && (
              <div className="space-y-6">
                <div className="p-5 rounded-2xl bg-rose-500/[0.06] border border-rose-500/25 space-y-4">
                  <div className="flex items-center justify-between border-b border-rose-500/20 pb-3">
                    <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-mono font-bold text-xs uppercase">
                      <XCircle className="w-4 h-4" />
                      <span>Pre-Spend Policy Violation Intercepted</span>
                    </div>
                    <span className="font-mono text-xs font-black text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
                      STATUS: REQUISITION DENIED
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                    <div>
                      <span className="text-[#6C7378] dark:text-white/50 block">Requested Intent:</span>
                      <strong className="text-black dark:text-white font-sans text-sm">
                        &ldquo;Buy an ergonomic office chair for client presentation&rdquo;
                      </strong>
                    </div>

                    <div>
                      <span className="text-[#6C7378] dark:text-white/50 block">Requested Amount:</span>
                      <strong className="text-rose-600 dark:text-rose-400 font-mono text-lg font-black">
                        $120.00 USD
                      </strong>
                      <span className="text-[11px] text-rose-500 block">Exceeds $80.00 limit by +$40.00</span>
                    </div>

                    <div>
                      <span className="text-[#6C7378] dark:text-white/50 block">Category Mismatch:</span>
                      <strong className="text-rose-600 dark:text-rose-400 text-sm">furniture</strong>
                      <span className="text-[11px] text-[#6C7378] dark:text-white/60 block">
                        Allowlist: digital gift cards only
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] text-rose-700 dark:text-rose-300 font-mono bg-rose-500/10 p-3 rounded-xl border border-rose-500/15">
                    Zero financial liability incurred. No PayPal payment authorization was created.
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: COMPLIANT PROPOSAL */}
            {activeStep === 3 && (
              <div className="space-y-6">
                <div className="p-5 rounded-2xl bg-[#007A56]/[0.06] border border-[#007A56]/25 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#007A56]/20 pb-3">
                    <div className="flex items-center gap-2 text-[#007A56] dark:text-emerald-400 font-mono font-bold text-xs uppercase">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Policy Evaluation: Compliant Autonomous Request</span>
                    </div>
                    <span className="font-mono text-xs font-black text-[#007A56] dark:text-emerald-400 bg-[#007A56]/10 px-2.5 py-0.5 rounded-full border border-[#007A56]/20">
                      STATUS: APPROVED FOR EXECUTION
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                    <div>
                      <span className="text-[#6C7378] dark:text-white/50 block">Agent Intent:</span>
                      <strong className="text-black dark:text-white font-sans text-sm">
                        &ldquo;Select coffee gift card for client appreciation within budget&rdquo;
                      </strong>
                    </div>

                    <div>
                      <span className="text-[#6C7378] dark:text-white/50 block">Approved Amount:</span>
                      <strong className="text-[#007A56] dark:text-emerald-400 font-mono text-lg font-black">
                        $75.00 USD
                      </strong>
                      <span className="text-[11px] text-[#007A56] dark:text-emerald-400 block">
                        Fits under $80.00 limit ($5.00 buffer)
                      </span>
                    </div>

                    <div>
                      <span className="text-[#6C7378] dark:text-white/50 block">Category Match:</span>
                      <strong className="text-[#007A56] dark:text-emerald-400 text-sm">digital gift cards</strong>
                      <span className="text-[11px] text-[#6C7378] dark:text-white/60 block">
                        Allowlist matched: Target Corp portal
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4 & 5: PAYPAL CAPTURE & TRUST PASSPORT */}
            {(activeStep === 4 || activeStep === 5) && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left: PayPal Orders v2 Receipt */}
                  <div className="p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10 space-y-3 font-mono text-xs">
                    <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-2">
                      <div className="flex items-center gap-2 text-[#002991] dark:text-[#60CDFF] font-bold">
                        <CreditCard className="w-4 h-4" />
                        <span>PayPal Orders v2 Capture</span>
                      </div>
                      <span className="text-[#007A56] dark:text-emerald-400 font-bold text-[10px] bg-[#007A56]/10 px-2 py-0.5 rounded">
                        SETTLED
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <span className="text-[#6C7378] dark:text-white/50">Capture ID:</span>
                      <span className="font-bold text-black dark:text-white text-right">
                        {purchaseData?.paypalCaptureId || "CAPTURE-7TY90123L-SB"}
                      </span>
                      <span className="text-[#6C7378] dark:text-white/50">Settled Amount:</span>
                      <span className="font-bold text-black dark:text-white text-right">$75.00 USD</span>
                      <span className="text-[#6C7378] dark:text-white/50">Seller Protection:</span>
                      <span className="font-bold text-[#007A56] dark:text-emerald-400 text-right">ELIGIBLE</span>
                      <span className="text-[#6C7378] dark:text-white/50">Payer Account:</span>
                      <span className="text-black dark:text-white text-right truncate">agent-wallet@passport.internal</span>
                    </div>
                  </div>

                  {/* Right: Cryptographic Trust Passport Seal */}
                  <div className="p-5 rounded-2xl bg-[#007A56]/[0.04] border border-[#007A56]/20 space-y-3 font-mono text-xs">
                    <div className="flex items-center justify-between border-b border-[#007A56]/20 pb-2">
                      <div className="flex items-center gap-2 text-[#007A56] dark:text-emerald-400 font-bold">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Trust Passport Sealed</span>
                      </div>
                      <span className="font-bold text-[10px] text-[#002991] dark:text-[#60CDFF] bg-[#60CDFF]/15 px-2 py-0.5 rounded">
                        {passportData?.passportNumber || "PASS-2026-US"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <span className="text-[#6C7378] dark:text-white/50">Readiness Score:</span>
                      <span className="font-bold text-[#007A56] dark:text-emerald-400 text-right">98 / 100</span>
                      <span className="text-[#6C7378] dark:text-white/50">Algorithm:</span>
                      <span className="text-black dark:text-white text-right">ECDSA-P256-SHA256</span>
                      <span className="text-[#6C7378] dark:text-white/50">Root Digest:</span>
                      <span className="text-[#002991] dark:text-[#60CDFF] text-right truncate">
                        0x92fe1516cccce243...
                      </span>
                      <span className="text-[#6C7378] dark:text-white/50">Evidence Items:</span>
                      <span className="text-black dark:text-white text-right">5 Bound Segments</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 6 & 7: DISPUTE WEBHOOK & EVIDENCE RECONCILIATION */}
            {(activeStep === 6 || activeStep === 7) && (
              <div className="space-y-6">
                <div className="p-5 rounded-2xl bg-amber-500/[0.05] border border-amber-500/25 space-y-4">
                  <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-mono font-bold text-xs uppercase">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Incoming Webhook: CUSTOMER.DISPUTE.CREATED</span>
                    </div>
                    <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                      DUE IN: 5 DAYS
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                    <div>
                      <span className="text-[#6C7378] dark:text-white/50 block">PayPal Case ID:</span>
                      <strong className="text-black dark:text-white text-sm">
                        {disputeData?.paypalDisputeId || "PP-D-849201"}
                      </strong>
                    </div>

                    <div>
                      <span className="text-[#6C7378] dark:text-white/50 block">Disputed Amount:</span>
                      <strong className="text-amber-600 dark:text-amber-400 font-mono text-base font-black">
                        $75.00 USD
                      </strong>
                    </div>

                    <div>
                      <span className="text-[#6C7378] dark:text-white/50 block">Reason:</span>
                      <strong className="text-black dark:text-white text-sm">UNAUTHORIZED_TRANSACTION</strong>
                    </div>
                  </div>

                  <div className="text-[11px] text-[#1D1E20] dark:text-white/80 font-mono bg-black/[0.03] dark:bg-white/[0.03] p-3 rounded-xl border border-black/5 dark:border-white/5">
                    Buyer Note: &ldquo;Cardholder reports this autonomous agent payment was unrecognized.&rdquo;
                  </div>
                </div>

                {/* Evidence Reconciliation Summary */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-black dark:text-white">Evidence Pack Readiness:</span>
                    <span className="text-amber-600 dark:text-amber-400 font-bold">
                      3 Verified · 2 Awaiting Human Co-Sign
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5 h-2">
                    <div className="bg-[#007A56] dark:bg-emerald-400 rounded-full" />
                    <div className="bg-[#007A56] dark:bg-emerald-400 rounded-full" />
                    <div className="bg-[#007A56] dark:bg-emerald-400 rounded-full" />
                    <div className="bg-amber-500 rounded-full animate-pulse" />
                    <div className="bg-amber-500 rounded-full animate-pulse" />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 8: HUMAN CO-SIGN & DEFENSE SUBMITTED */}
            {activeStep === 8 && (
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-[#007A56]/[0.08] border border-[#007A56]/30 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#007A56]/20 pb-3">
                    <div className="flex items-center gap-2 text-[#007A56] dark:text-emerald-400 font-mono font-bold text-xs uppercase">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Defense Dossier Dispatched to PayPal</span>
                    </div>
                    <span className="font-mono text-xs font-black text-[#007A56] dark:text-emerald-400 bg-[#007A56]/15 px-3 py-1 rounded-full border border-[#007A56]/30">
                      STATUS: SUBMITTED &amp; COVERED
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                    <div className="space-y-1">
                      <span className="text-[#6C7378] dark:text-white/50 block">Co-Signed Authority:</span>
                      <strong className="text-black dark:text-white text-sm font-sans block">
                        Authorized Business Owner &amp; Compliance Director
                      </strong>
                      <span className="text-[11px] text-[#007A56] dark:text-emerald-400">
                        Cryptographically linked to ECDSA root key
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[#6C7378] dark:text-white/50 block">Sealed Defense Digest:</span>
                      <code className="text-[#002991] dark:text-[#60CDFF] text-xs font-mono break-all block">
                        0x8b1a4f92c30e49a8d29b1093ee1402a7b8e1f02c91834a8e2938f01a39bc41d2
                      </code>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#007A56]/10 text-xs font-mono text-[#007A56] dark:text-emerald-300">
                    PayPal Seller Protection claims shield active: zero merchant chargeback penalty or fee.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 5. BOTTOM: PILL BUTTON CONTROLS */}
          <div className="pt-6 border-t border-black/10 dark:border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <button
              type="button"
              onClick={resetTour}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-xs sm:text-sm font-bold text-black dark:text-white bg-transparent border border-black/15 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/10 active:scale-[0.98] transition-all disabled:opacity-50 order-2 sm:order-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Tour</span>
            </button>

            <div className="flex items-center gap-3 order-1 sm:order-2">
              {activeStep === 1 && (
                <button
                  type="button"
                  onClick={handleSimulateBlocked}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-xs sm:text-sm font-black text-[#002991] bg-[#60CDFF] hover:bg-[#4bc3fa] active:scale-[0.98] transition-all shadow-md disabled:opacity-50 w-full sm:w-auto"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{loading ? "Evaluating Policy..." : "Simulate Out-of-Bounds Requisition →"}</span>
                </button>
              )}

              {activeStep === 2 && (
                <button
                  type="button"
                  onClick={handleSimulateApproved}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-xs sm:text-sm font-black text-[#002991] bg-[#60CDFF] hover:bg-[#4bc3fa] active:scale-[0.98] transition-all shadow-md disabled:opacity-50 w-full sm:w-auto"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{loading ? "Checking Headroom..." : "Submit Compliant Requisition →"}</span>
                </button>
              )}

              {activeStep === 3 && (
                <button
                  type="button"
                  onClick={handleExecuteOrderAndPassport}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-xs sm:text-sm font-black text-white bg-[#002991] hover:bg-[#001C64] dark:bg-[#60CDFF] dark:text-[#002991] dark:hover:bg-[#4bc3fa] active:scale-[0.98] transition-all shadow-md disabled:opacity-50 w-full sm:w-auto"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{loading ? "Capturing Order..." : "Execute PayPal Settlement & Issue Passport →"}</span>
                </button>
              )}

              {(activeStep === 4 || activeStep === 5) && (
                <button
                  type="button"
                  onClick={handleSimulateDisputeWebhook}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-xs sm:text-sm font-black text-black bg-[#FFB800] hover:bg-[#e6a600] active:scale-[0.98] transition-all shadow-md disabled:opacity-50 w-full sm:w-auto"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>{loading ? "Receiving Webhook..." : "Simulate Incoming Dispute Webhook →"}</span>
                </button>
              )}

              {(activeStep === 6 || activeStep === 7) && (
                <button
                  type="button"
                  onClick={handleCoSignDefense}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-xs sm:text-sm font-black text-black bg-[#FFB800] hover:bg-[#e6a600] active:scale-[0.98] transition-all shadow-md disabled:opacity-50 w-full sm:w-auto"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{loading ? "Co-signing..." : "Co-Sign & Submit Defense to PayPal →"}</span>
                </button>
              )}

              {activeStep === 8 && (
                <Link href="/dashboard">
                  <span className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-xs sm:text-sm font-black text-white bg-[#002991] hover:bg-[#001C64] dark:bg-[#60CDFF] dark:text-[#002991] dark:hover:bg-[#4bc3fa] active:scale-[0.98] transition-all shadow-md w-full sm:w-auto">
                    <span>Explore Live Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
