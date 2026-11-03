"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion, useInView, Variants } from "framer-motion";
import { Navbar } from "@/components/layout/navbar";
import { TrustPassportCredential } from "@/components/passports/trust-passport-credential";
import { Button } from "@/components/ui/button";
import {
  Shield,
  FileCheck2,
  Bot,
  CreditCard,
  ScrollText,
  AlertOctagon,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Lock,
  UserCheck,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Play,
  Terminal,
  Activity,
  Check,
} from "lucide-react";

// Static demo passport data for the centerpiece credential on landing page
const DEMO_HERO_PASSPORT = {
  id: "hero-demo-passport",
  passportNumber: "PASS-2026-8942-US",
  status: "VALID",
  disputeReadinessScore: 98,
  passportHash: "92fe1516cccce243f341d4a8c20fb2d7e012354a8b7923485cba799ef0439201",
  issuedAt: "2026-11-02T18:30:00Z",
  authorizationData: JSON.stringify({
    authorizer: "Jacob (Account Owner & Treasury Lead)",
    mandateId: "mandate-gift-card-demo",
    purpose: "Client appreciation gift",
    authorizedAt: "2026-11-02T18:29:00Z",
    constraints: [
      "Per-transaction cap: $80.00 USD",
      "Category restriction: digital gift cards only",
      "Time-to-live: 24 hours strictly enforced",
      "Refund policy: Full dispute defense enabled",
    ],
  }),
  transactionData: JSON.stringify({
    paypalOrderId: "PAYPAL-ORD-8X92104M-SB",
    paypalCaptureId: "CAPTURE-7TY90123L-SB",
    sellerProtection: "ELIGIBLE",
    payerEmail: "sb-buyer-8491@business.example.com",
    payeeEmail: "merchant-sandbox@passport.ai",
    captureTime: "2026-11-02T18:29:45Z",
    grossAmount: "$75.00 USD",
    paypalFee: "$2.48 USD",
    netAmount: "$72.52 USD",
  }),
  agentTrailData: JSON.stringify({
    agentModel: "Google Gemini 1.5 Pro (Autonomous Purchase Engine)",
    reasoning:
      "Evaluated options against Mandate purpose ('Client appreciation gift'). Selected $75 digital gift card leaving $5.00 buffer under $80 cap. Item strictly belongs to authorized category 'digital gift cards'.",
    selectedItem: "Starbucks Digital e-Gift Card ($75)",
    itemPrice: 75.0,
    budgetRemaining: 5.0,
    executionTraceId: "gemini-exec-490218-trace",
  }),
  refundEligibility: JSON.stringify({
    eligible: true,
    reason: "Standard 30-day merchant warranty & PayPal Seller Protection applied",
  }),
  evidencePack: JSON.stringify([
    "Human Mandate Cryptographic Token (SHA-256)",
    "Autonomous Agent Intent Transcript (Gemini 1.5 Pro)",
    "PayPal Sandbox Orders v2 Capture Attestation",
    "Merchant Electronic Delivery Proof & Voucher Code",
    "Digital Delivery Certificate (ECDSA-P256)",
  ]),
  mandate: {
    id: "mandate-gift-card-demo",
    title: "Client Appreciation Gift",
    purpose: "Client appreciation gift",
    maxAmount: 80.0,
    currency: "USD",
    allowedCategories: "digital gift cards",
  },
  purchase: {
    id: "purch-75-starbucks",
    amount: 75.0,
    currency: "USD",
    itemName: "Starbucks e-Gift Card",
    merchantName: "Starbucks Select Network",
    disputes: [],
  },
};

const DEMO_HERO_VERIFICATION = {
  isSignatureValid: true,
  hash: "92fe1516cccce243f341d4a8c20fb2d7e012354a8b7923485cba799ef0439201",
  algorithm: "ECDSA-P256-SHA256",
  verifiedAt: "2026-11-02T18:30:00Z",
};

// Reusable scroll-reveal section container with spring physics
function ScrollSection({
  children,
  className = "",
  id = "",
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.section
      ref={ref}
      id={id}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.12,
            delayChildren: 0.05,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

const springChild: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 320,
      damping: 32,
    },
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col overflow-x-hidden w-full">
      <Navbar />

      {/* HERO SECTION — LEFT-ALIGNED EDITORIAL HERO WITH FLOATING TILTED CREDENTIAL */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-border">
        {/* Subtle animated grid and line-scan background (CSS masks, zero image assets) */}
        <div className="forensic-masked-grid" aria-hidden="true" />
        <div className="forensic-scan-line" aria-hidden="true" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
            {/* Left-Aligned Editorial Hero Column */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.08,
                    delayChildren: 0.04,
                  },
                },
              }}
              className="lg:col-span-6 space-y-6 text-left"
            >
              {/* Telemetry metadata tag */}
              <motion.div variants={springChild} className="inline-flex">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-secondary/80 border border-border text-xs font-medium text-foreground">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-semibold text-primary">Financial Control Plane</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-muted-foreground font-mono text-[11px]">
                    PayPal Orders v2 · Forensics
                  </span>
                </div>
              </motion.div>

              {/* Large, tight-tracking display headline (max-width ~680px) */}
              <motion.h1
                variants={springChild}
                className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold tracking-[-0.035em] text-foreground leading-[1.06] max-w-[680px]"
              >
                AI agents can spend money.{" "}
                <span className="text-primary block mt-1.5">
                  Passport makes every purchase accountable.
                </span>
              </motion.h1>

              {/* Single subhead */}
              <motion.p
                variants={springChild}
                className="text-base sm:text-lg text-muted-foreground font-normal leading-relaxed max-w-[580px]"
              >
                The trust, receipt, and dispute-defense layer for autonomous AI commerce. Enforce
                cryptographic human spend mandates pre-execution and turn disputed transactions into
                evidence-ready legal dossiers.
              </motion.p>

              {/* One primary CTA and one ghost CTA (No 3-column row below) */}
              <motion.div
                variants={springChild}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2"
              >
                <Link href="/demo" tabIndex={-1}>
                  <Button
                    variant="primary"
                    size="lg"
                    trailingIcon={<ArrowRight className="w-4 h-4" />}
                    className="w-full sm:w-auto"
                  >
                    Launch Interactive Demo
                  </Button>
                </Link>

                <Link href="/disputes/disp-chargeback-demo" tabIndex={-1}>
                  <Button
                    variant="ghost"
                    size="lg"
                    trailingIcon={<ExternalLink className="w-4 h-4" />}
                    className="w-full sm:w-auto text-muted-foreground hover:text-foreground"
                  >
                    See Forensic Case Room
                  </Button>
                </Link>
              </motion.div>
            </motion.div>

            {/* Right Column: Floating, Tilted Live Trust Passport Credential with Spring Reveal */}
            <div className="lg:col-span-6 relative [perspective:1200px]">
              {/* Subtle forensic dot matrix behind credential (CSS mask, not a generic gradient blob) */}
              <div className="forensic-dot-matrix" aria-hidden="true" />

              <motion.div
                initial={{ opacity: 0, y: 32, rotateX: 5, rotateY: -6, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 2.5, rotateY: -3.5, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
                style={{ transformStyle: "preserve-3d" }}
                className="relative z-10 transition-transform duration-300 ease-out hover:[transform:rotateX(0deg)_rotateY(0deg)_scale(1.01)]"
              >
                <div className="text-center mb-2 lg:text-right">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground bg-secondary/80 px-2.5 py-1 rounded border border-border backdrop-blur-xs">
                    Live Interactive Credential · SHA-256 Attested
                  </span>
                </div>
                <TrustPassportCredential
                  passport={DEMO_HERO_PASSPORT}
                  verification={DEMO_HERO_VERIFICATION}
                />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION (a): THE PROBLEM — UNBOUNDED AGENT SPEND & GATEWAY LIABILITY */}
      <ScrollSection id="problem" className="py-20 md:py-28 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Section Header */}
          <motion.div variants={springChild} className="max-w-3xl space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-500">
              The Agent Spend Dilemma
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
              Unbounded tool calling meets rigid payment networks.
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              When an autonomous LLM agent executes API tool calls against corporate payment methods, it
              operates without pre-spend cryptographic bounds. If a prompt injection, loop recursion, or
              model drift triggers an unauthorized purchase, traditional payment gateways simply settle the
              charge.
            </p>
          </motion.div>

          {/* Single Clear Visual Anchor: Institutional Interception Terminal */}
          <motion.div
            variants={springChild}
            className="rounded-xl border border-border bg-background overflow-hidden shadow-xs"
          >
            {/* Terminal Window Header */}
            <div className="px-5 py-3.5 bg-secondary/60 border-b border-border flex items-center justify-between text-xs font-mono text-muted-foreground">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-primary" />
                <span className="font-semibold text-foreground">session #exec-490218-trace</span>
                <span>·</span>
                <span>real-time policy interceptor</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[11px] text-muted-foreground">Enforcement Active</span>
              </div>
            </div>

            {/* Interception Body: Side-by-Side Direct Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border font-mono text-xs">
              {/* Left Pane: Blocked Unbounded Proposal */}
              <div className="p-6 space-y-4 bg-rose-500/[0.02]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-rose-500 font-bold">
                    <XCircle className="w-4 h-4 shrink-0" />
                    <span>UNBOUNDED AGENT REQUISITION</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold border border-rose-500/20">
                    BLOCKED PRE-EXECUTION
                  </span>
                </div>

                <div className="p-3.5 rounded-lg bg-secondary/50 border border-border space-y-1.5 text-[11px] leading-relaxed">
                  <div className="text-muted-foreground">// Agent Tool Proposal Payload</div>
                  <div className="text-foreground">
                    <span className="text-muted-foreground">&quot;tool&quot;</span>: &quot;paypal_orders_create&quot;,
                  </div>
                  <div className="text-foreground">
                    <span className="text-muted-foreground">&quot;item&quot;</span>: &quot;H100 Dedicated GPU Slice&quot;,
                  </div>
                  <div className="text-rose-600 dark:text-rose-400 font-bold tabular-nums">
                    <span className="text-muted-foreground">&quot;amount&quot;</span>: 4850.00 USD,
                  </div>
                  <div className="text-foreground">
                    <span className="text-muted-foreground">&quot;intent&quot;</span>: &quot;unsupervised cluster scale&quot;,
                  </div>
                  <div className="text-foreground">
                    <span className="text-muted-foreground">&quot;human_mandate&quot;</span>: null
                  </div>
                </div>

                <div className="space-y-1.5 text-[11px]">
                  <div className="text-rose-600 dark:text-rose-400 font-semibold flex items-start gap-1.5">
                    <AlertOctagon className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>Breach: Exceeds maximum authorized cap of $80.00 (+5,962% overflow)</span>
                  </div>
                  <p className="text-muted-foreground leading-normal pl-5">
                    Without Passport, this transaction would settle blindly on the card, resulting in an
                    unrecoverable merchant loss upon chargeback.
                  </p>
                </div>
              </div>

              {/* Right Pane: Approved Mandate Enforcement */}
              <div className="p-6 space-y-4 bg-emerald-500/[0.02]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>MANDATE-BOUND TRANSACTION</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                    APPROVED &amp; CAPTURED
                  </span>
                </div>

                <div className="p-3.5 rounded-lg bg-secondary/50 border border-border space-y-1.5 text-[11px] leading-relaxed">
                  <div className="text-muted-foreground">// Verified Attestation Token</div>
                  <div className="text-foreground">
                    <span className="text-muted-foreground">&quot;mandate_id&quot;</span>: &quot;mandate-gift-card-demo&quot;,
                  </div>
                  <div className="text-foreground">
                    <span className="text-muted-foreground">&quot;authorizer&quot;</span>: &quot;Jacob (Account Owner)&quot;,
                  </div>
                  <div className="text-emerald-600 dark:text-emerald-400 font-bold tabular-nums">
                    <span className="text-muted-foreground">&quot;settled_amount&quot;</span>: 75.00 USD,
                  </div>
                  <div className="text-foreground">
                    <span className="text-muted-foreground">&quot;paypal_capture&quot;</span>: &quot;CAPTURE-7TY90123L-SB&quot;,
                  </div>
                  <div className="text-foreground truncate">
                    <span className="text-muted-foreground">&quot;sha256_seal&quot;</span>: &quot;92fe1516...e3eec61fe&quot;
                  </div>
                </div>

                <div className="space-y-1.5 text-[11px]">
                  <div className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>Deterministic Compliance: Within $80 limit · Category verified</span>
                  </div>
                  <p className="text-muted-foreground leading-normal pl-5">
                    Settled via PayPal Orders v2 with Seller Protection. Sealed into an immutable Trust
                    Passport ready for immediate dispute defense.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </ScrollSection>

      {/* SECTION (b): MANDATE → PURCHASE → PASSPORT PIPELINE */}
      <ScrollSection id="pipeline" className="py-20 md:py-28 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Section Header */}
          <motion.div variants={springChild} className="max-w-3xl space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-primary">
              Deterministic Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
              The Mandate &rarr; Purchase &rarr; Passport Pipeline
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              A continuous, cryptographically bound flow executing between human controllers, autonomous
              agents, and the PayPal payment network.
            </p>
          </motion.div>

          {/* Single Clear Visual Anchor: Continuous Sequential Pipeline Ledger */}
          <motion.div
            variants={springChild}
            className="rounded-xl border border-border bg-card overflow-hidden shadow-xs"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-border">
              {/* Stage 1: Human Spend Mandate */}
              <div className="p-6 space-y-4 relative">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-muted-foreground tracking-wider">
                    STAGE 01
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-primary/10 text-primary border border-primary/20">
                    POLICY GATE
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="text-sm font-bold text-foreground flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-primary" />
                    Human Spend Mandate
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Account owner issues policy: &quot;Client appreciation gift, max $80, digital gift cards
                    only, 24h expiration.&quot;
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-secondary/60 border border-border space-y-2 text-xs font-mono">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-muted-foreground">Authorized Cap:</span>
                    <span className="text-foreground font-bold tabular-nums">$80.00 USD</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-muted-foreground">Category:</span>
                    <span className="text-foreground">digital gift cards</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-muted-foreground">Signed Digest:</span>
                    <span className="text-primary truncate max-w-[140px]">sha256:4a8f901b...</span>
                  </div>
                </div>
              </div>

              {/* Stage 2: Policy Interception & PayPal Execution */}
              <div className="p-6 space-y-4 relative">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-muted-foreground tracking-wider">
                    STAGE 02
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    PAYPAL SETTLEMENT
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="text-sm font-bold text-foreground flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Interception &amp; Orders v2
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Deterministic evaluation validates the $75 proposal against mandate rules, then calls
                    PayPal Orders v2 to capture payment.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-secondary/60 border border-border space-y-2 text-xs font-mono">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-muted-foreground">PayPal Order ID:</span>
                    <span className="text-foreground font-semibold">PAYPAL-ORD-8X92</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-muted-foreground">Gross Amount:</span>
                    <span className="text-foreground font-bold tabular-nums">$75.00 USD</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-muted-foreground">Seller Protection:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">ELIGIBLE</span>
                  </div>
                </div>
              </div>

              {/* Stage 3: Cryptographic Trust Passport */}
              <div className="p-6 space-y-4 relative">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-muted-foreground tracking-wider">
                    STAGE 03
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-primary/10 text-primary border border-primary/20">
                    EVIDENCE SEAL
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="text-sm font-bold text-foreground flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    Trust Passport Attestation
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Hashes authorizer mandate, Gemini inference reasoning, line items, and settlement receipt
                    into an immutable SHA-256 passport.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-secondary/60 border border-border space-y-2 text-xs font-mono">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-muted-foreground">Passport Number:</span>
                    <span className="text-foreground font-semibold">PASS-2026-8942-US</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-muted-foreground">Defense Readiness:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold tabular-nums">
                      98 / 100
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-muted-foreground">Audit Stream:</span>
                    <span className="text-primary font-semibold">Chained to Block #8</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </ScrollSection>

      {/* SECTION (c): THE DISPUTE DEFENSE MOMENT — FORENSIC DISPUTE AUTOPSY PREVIEW */}
      <ScrollSection id="dispute-defense" className="relative py-20 md:py-28 bg-card border-b border-border overflow-hidden">
        {/* Subtle animated grid and line-scan background (CSS masks, zero image assets) */}
        <div className="forensic-masked-grid" aria-hidden="true" />
        <div className="forensic-scan-line" aria-hidden="true" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
          {/* Section Header */}
          <motion.div variants={springChild} className="max-w-3xl space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-500">
              The Dispute Defense Moment
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
              When a chargeback arrives, the case is already defended.
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              When a cardholder files an unauthorized transaction claim, Passport immediately runs a
              Chargeback Autopsy: compiling the mandate, agent reasoning tokens, and delivery vouchers into a
              compelling legal defense packet.
            </p>
          </motion.div>

          {/* Single Clear Visual Anchor: Forensic Evidence Reconciliation Visual */}
          <motion.div
            variants={springChild}
            className="rounded-xl border border-border bg-background overflow-hidden shadow-xs"
          >
            {/* Dossier Header Strip */}
            <div className="p-6 bg-secondary/50 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">DISPUTE AUTOPSY DOSSIER:</span>
                  <span className="text-amber-500 font-bold">PP-D-849201</span>
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Claim: &quot;Cardholder states transaction was unauthorized by account holder.&quot;
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-[10px] text-muted-foreground uppercase">Response Window</div>
                  <div className="text-foreground font-bold tabular-nums">6 Days Remaining</div>
                </div>
                <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold text-[11px] border border-amber-500/20">
                  ACTION REQUIRED
                </span>
              </div>
            </div>

            {/* Reconciliation Body */}
            <div className="p-6 md:p-8 space-y-6">
              {/* Evidence Reconciliation Progress Meter */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-muted-foreground">Evidence Reconciliation Index:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold tabular-nums">
                    5 of 5 Verified Artifacts (100% Complete)
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                  <div className="bg-emerald-500 h-full w-full rounded-full transition-all duration-500" />
                </div>
              </div>

              {/* Forensic Artifact Chain */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
                <div className="p-3.5 rounded-lg border border-border bg-card flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <div>
                      <div className="text-foreground font-semibold">1. Human Spend Mandate</div>
                      <div className="text-[10px] text-muted-foreground font-sans">
                        Authorizer: Jacob · Hard Limit: $80.00
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground tabular-nums">SHA-256</span>
                </div>

                <div className="p-3.5 rounded-lg border border-border bg-card flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <div>
                      <div className="text-foreground font-semibold">2. Agent Intent Transcript</div>
                      <div className="text-[10px] text-muted-foreground font-sans">
                        Gemini 1.5 Pro reasoning tokens recorded
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground tabular-nums">TRACE-490218</span>
                </div>

                <div className="p-3.5 rounded-lg border border-border bg-card flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <div>
                      <div className="text-foreground font-semibold">3. PayPal Capture Receipt</div>
                      <div className="text-[10px] text-muted-foreground font-sans">
                        CAPTURE-7TY90123L-SB · Seller Protection
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                    ELIGIBLE
                  </span>
                </div>

                <div className="p-3.5 rounded-lg border border-border bg-card flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <div>
                      <div className="text-foreground font-semibold">4. Electronic Delivery Proof</div>
                      <div className="text-[10px] text-muted-foreground font-sans">
                        Starbucks digital voucher dispatched to buyer
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground tabular-nums">ECDSA-P256</span>
                </div>
              </div>

              {/* Gemini Classification & Mandatory Human Co-Signature */}
              <div className="p-4 rounded-lg bg-secondary/50 border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono text-xs">
                <div className="space-y-1">
                  <div className="text-[11px] text-muted-foreground uppercase">Gemini Dispute Strategy</div>
                  <div className="text-foreground font-semibold">
                    COMPELLING_EVIDENCE_DIGITAL_DELIVERY (96% Confidence)
                  </div>
                </div>
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                  <UserCheck className="w-4 h-4" />
                  <span>Mandatory Human Co-Sign Ready</span>
                </div>
              </div>

              {/* Ghost Button: "See the forensic case room" */}
              <div className="pt-2 flex justify-start">
                <Link href="/disputes/disp-chargeback-demo" tabIndex={-1}>
                  <Button
                    variant="ghost"
                    size="lg"
                    trailingIcon={<ArrowRight className="w-4 h-4" />}
                    className="border border-border text-foreground hover:bg-secondary/80"
                  >
                    See the forensic case room
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </ScrollSection>

      {/* FINAL CALL TO ACTION */}
      <section className="py-20 md:py-24 bg-card text-center relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Make every AI-agent payment authorized, auditable, and defensible.
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Experience the complete financial control plane with interactive sandbox transactions and live
            dispute autopsies.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/demo" tabIndex={-1}>
              <Button
                variant="primary"
                size="lg"
                trailingIcon={<ArrowRight className="w-4 h-4" />}
                className="w-full sm:w-auto"
              >
                Launch Live Demo Tour
              </Button>
            </Link>

            <Link href="/dashboard" tabIndex={-1}>
              <Button
                variant="ghost"
                size="lg"
                trailingIcon={<ChevronRight className="w-4 h-4" />}
                className="w-full sm:w-auto border border-border"
              >
                Open Operations Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border py-8 bg-background text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <span className="font-bold text-foreground">Passport</span>
            <span>— Trust, receipt, and dispute-defense layer for AI-agent purchases.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/demo" className="hover:text-foreground transition-colors">
              Interactive Demo
            </Link>
            <Link href="/dashboard" className="hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <Link href="/passports" className="hover:text-foreground transition-colors">
              Trust Passports
            </Link>
            <Link href="/disputes" className="hover:text-foreground transition-colors">
              Disputes
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
