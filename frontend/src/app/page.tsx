"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import {
  Shield,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Sparkles,
  Lock,
  Bot,
  CreditCard,
  ScrollText,
  AlertOctagon,
  Layers,
  Clock,
  Play,
  Github,
  ChevronRight,
  TrendingUp,
  FileCheck2,
  UserCheck,
  ExternalLink,
} from "lucide-react";
import { formatCurrency, truncateHash } from "@/lib/utils";

export default function LandingPage() {
  const [activePassportTab, setActivePassportTab] = useState<
    "auth" | "tx" | "agent" | "receipt" | "defense"
  >("auth");

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-32 fintech-grid border-b border-border/60">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary-600/10 dark:bg-primary-500/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* PayPal Sandbox Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border/80 shadow-sm text-xs font-medium text-foreground">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-primary-600 dark:text-primary-400">
                PayPal AI Hackathon 2026
              </span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground font-mono text-[11px]">
                PayPal Orders + Webhooks + Disputes API
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
              AI agents can spend money.{" "}
              <span className="text-primary-600 dark:text-primary-400 block sm:inline">
                Passport makes every purchase accountable.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto font-normal leading-relaxed">
              Authorize AI-agent purchases, generate verifiable receipts, and turn disputes into evidence-ready cases.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/demo"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm shadow-md shadow-primary/25 transition-all hover:scale-[1.02]"
              >
                <Play className="w-4 h-4 fill-current" />
                Launch Live Demo
              </Link>

              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-border bg-card hover:bg-muted text-foreground font-semibold text-sm shadow-sm transition-all hover:scale-[1.02]"
              >
                Enter App Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-xs text-muted-foreground font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Mandate-checked</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-primary-500" />
                <span>Audit-ready (SHA-256)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-amber-500" />
                <span>Human-approved co-signature</span>
              </div>
            </div>
          </div>

          {/* Hero Trust Passport Card Preview */}
          <div className="mt-14 max-w-4xl mx-auto">
            <div className="rounded-2xl border-2 border-primary/30 bg-card/90 backdrop-blur-xl shadow-2xl overflow-hidden transition-all hover:border-primary/50">
              <div className="bg-gradient-to-r from-primary-950 via-primary-900 to-primary-800 p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono tracking-widest px-2 py-0.5 rounded bg-white/10 uppercase font-bold text-white/90">
                      Verifiable Trust Passport
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> SIGNATURE ATTESTED
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-mono font-bold tracking-tight text-white">
                    PASS-2026-8942-US
                  </h3>
                  <p className="text-xs text-white/70">
                    Governing Mandate: &quot;Client appreciation gift&quot; ($80.00 Limit)
                  </p>
                </div>

                <div className="text-right bg-black/30 p-3 rounded-xl border border-white/10">
                  <span className="text-[10px] uppercase font-semibold text-white/70 block">
                    Dispute Readiness
                  </span>
                  <span className="text-2xl font-mono font-bold text-emerald-400">
                    98/100
                  </span>
                </div>
              </div>

              <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs border-b border-border bg-card">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                    Executed Amount
                  </span>
                  <span className="text-base font-bold font-mono text-foreground">
                    $75.00 USD
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                    PayPal Sandbox Order
                  </span>
                  <span className="font-mono text-primary-600 dark:text-primary-400 font-bold">
                    PAYPAL-ORD-8X92104M
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                    Item Purchased
                  </span>
                  <span className="font-semibold text-foreground truncate block">
                    Starbucks e-Gift Card
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                    Seller Protection
                  </span>
                  <span className="text-emerald-500 font-bold font-mono">
                    ELIGIBLE
                  </span>
                </div>
              </div>

              <div className="p-4 bg-muted/30 px-6 flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-mono text-[11px] truncate max-w-sm">
                  SHA-256: 92fe1516cccce243f341d4a8c20fb2d7...
                </span>
                <Link
                  href="/passports/pass-giftcard-75"
                  className="font-semibold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                >
                  Interactive Inspection &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: THE PROBLEM */}
      <section id="problem" className="py-20 md:py-28 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs uppercase font-mono font-bold tracking-wider text-destructive">
              The Agent Spend Dilemma
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              &quot;Your AI agent just spent $75. Can you prove what it was authorized to do?&quot;
            </h2>
            <p className="text-sm text-muted-foreground">
              Autonomous agents can execute payments through tool calling, but traditional payment gateways were never built for non-human purchasers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Problem Card 1 */}
            <div className="p-6 rounded-2xl border border-destructive/30 bg-destructive/5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center">
                <XCircle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-foreground">
                No Spending Mandate
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Agents operate with naked API keys or wallet tokens. A prompt injection or hallucination can blow through corporate balances with zero boundary enforcement.
              </p>
            </div>

            {/* Problem Card 2 */}
            <div className="p-6 rounded-2xl border border-destructive/30 bg-destructive/5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center">
                <AlertOctagon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-foreground">
                No Verifiable Receipt
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Traditional email receipts show only the transaction amount, leaving no record of the prompt, model inference, authorization parameters, or business purpose.
              </p>
            </div>

            {/* Problem Card 3 */}
            <div className="p-6 rounded-2xl border border-destructive/30 bg-destructive/5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center">
                <Shield className="w-5 h-5 text-destructive" />
              </div>
              <h3 className="text-base font-bold text-foreground">
                No Dispute Evidence
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                When a cardholder files an &quot;unauthorized transaction&quot; chargeback, merchants have no proof that a legitimate human authorized the AI agent to make the purchase.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: HOW IT WORKS */}
      <section id="how-it-works" className="py-20 md:py-28 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs uppercase font-mono font-bold tracking-wider text-primary-600 dark:text-primary-400">
              The Passport Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              How Passport Protects Autonomous Purchases
            </h2>
            <p className="text-sm text-muted-foreground">
              A four-step cryptographic defense chain running on PayPal Sandbox and Gemini.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="fintech-card p-6 space-y-3 relative">
              <span className="text-3xl font-mono font-extrabold text-primary-600/30 dark:text-primary-400/20">
                01
              </span>
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-primary-500" />
                <h3 className="text-sm font-bold text-foreground">Human Sets Mandate</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Owner authorizes: &quot;Client appreciation gift, up to $80, digital gift cards only, valid 24h.&quot; Parsed via Gemini into cryptographic policy.
              </p>
            </div>

            {/* Step 2 */}
            <div className="fintech-card p-6 space-y-3 relative">
              <span className="text-3xl font-mono font-extrabold text-primary-600/30 dark:text-primary-400/20">
                02
              </span>
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-emerald-500" />
                <h3 className="text-sm font-bold text-foreground">Agent Proposes Purchase</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                AI Agent selects an optimal purchase within the mandate. Out-of-bounds proposals ($120 chair) are strictly rejected before hitting PayPal.
              </p>
            </div>

            {/* Step 3 */}
            <div className="fintech-card p-6 space-y-3 relative">
              <span className="text-3xl font-mono font-extrabold text-primary-600/30 dark:text-primary-400/20">
                03
              </span>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary-500" />
                <h3 className="text-sm font-bold text-foreground">PayPal Executes Order</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                PayPal Orders v2 API creates and captures the $75 order. Settlement confirmed with PayPal Seller Protection eligibility.
              </p>
            </div>

            {/* Step 4 */}
            <div className="fintech-card p-6 space-y-3 relative">
              <span className="text-3xl font-mono font-extrabold text-primary-600/30 dark:text-primary-400/20">
                04
              </span>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-foreground">Passport &amp; Defense Ready</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Passport hashes authorization, agent trail, and receipt into a SHA-256 credential. If disputed, Chargeback Autopsy defends the case.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: TRUST PASSPORT SHOWCASE */}
      <section id="trust-passport" className="py-20 md:py-28 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs uppercase font-mono font-bold tracking-wider text-emerald-500">
              Verifiable Cryptographic Proof
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              The Trust Passport Credential
            </h2>
            <p className="text-sm text-muted-foreground">
              Explore the five essential cryptographic facets embedded in every Passport.
            </p>
          </div>

          <div className="max-w-4xl mx-auto rounded-2xl border border-border bg-background shadow-xl overflow-hidden">
            {/* Tabs */}
            <div className="flex flex-wrap border-b border-border bg-muted/40 px-4 text-xs font-semibold">
              {[
                { id: "auth", label: "Authorization" },
                { id: "tx", label: "Transaction" },
                { id: "agent", label: "Agent Trail" },
                { id: "receipt", label: "Receipt" },
                { id: "defense", label: "Dispute Readiness" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActivePassportTab(tab.id as any)}
                  className={`py-3 px-4 border-b-2 transition-colors ${
                    activePassportTab === tab.id
                      ? "border-primary text-primary font-bold bg-card"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Body */}
            <div className="p-6 text-xs space-y-4">
              {activePassportTab === "auth" && (
                <div className="space-y-3">
                  <h4 className="font-bold text-foreground text-sm">Human Mandate Snapshot</h4>
                  <div className="grid grid-cols-2 gap-3 text-muted-foreground">
                    <div>Purpose: <strong className="text-foreground">Client appreciation gift</strong></div>
                    <div>Cap: <strong className="text-emerald-500 font-mono">$80.00 USD</strong></div>
                    <div>Category: <strong className="text-foreground font-mono">digital gift cards</strong></div>
                    <div>Authorizer: <strong className="text-foreground">Human Business Owner</strong></div>
                  </div>
                </div>
              )}

              {activePassportTab === "tx" && (
                <div className="space-y-3">
                  <h4 className="font-bold text-foreground text-sm">PayPal Sandbox Settlement</h4>
                  <div className="grid grid-cols-2 gap-3 text-muted-foreground">
                    <div>Order ID: <strong className="text-foreground font-mono">PAYPAL-ORD-8X92104M-SB</strong></div>
                    <div>Capture ID: <strong className="text-foreground font-mono">CAPTURE-7TY90123L-SB</strong></div>
                    <div>Amount: <strong className="text-foreground font-mono">$75.00 USD</strong></div>
                    <div>Protection: <strong className="text-emerald-500 font-mono">ELIGIBLE</strong></div>
                  </div>
                </div>
              )}

              {activePassportTab === "agent" && (
                <div className="space-y-3">
                  <h4 className="font-bold text-foreground text-sm">Gemini Inference Transcript</h4>
                  <p className="italic text-muted-foreground bg-muted/40 p-3 rounded-lg">
                    &quot;Selected $75 digital gift card matching mandate purpose (&apos;Client appreciation gift&apos;), within $80 cap ($5 buffer), and within digital gift card category.&quot;
                  </p>
                </div>
              )}

              {activePassportTab === "receipt" && (
                <div className="space-y-3">
                  <h4 className="font-bold text-foreground text-sm">Verifiable Line Items</h4>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30 font-mono">
                    <span>Starbucks Digital e-Gift Card ($75) &times; 1</span>
                    <span className="font-bold text-foreground">$75.00</span>
                  </div>
                </div>
              )}

              {activePassportTab === "defense" && (
                <div className="space-y-3">
                  <h4 className="font-bold text-foreground text-sm">Pre-Assembled Defense Bundle</h4>
                  <div className="flex items-center gap-2 text-emerald-500 font-medium">
                    <CheckCircle2 className="w-4 h-4" /> 5 of 5 cryptographic proofs attached and verified (Readiness Score: 98/100)
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: CHARGEBACK AUTOPSY */}
      <section id="chargeback-autopsy" className="py-20 md:py-28 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs uppercase font-mono font-bold tracking-wider text-amber-500">
              Forensic Dispute Defense
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Autonomous Chargeback Autopsy
            </h2>
            <p className="text-sm text-muted-foreground">
              When a dispute arrives, Passport reconciles the audit trail, drafts the defense, and requires human co-signature.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Forensic Pipeline */}
            <div className="fintech-card border-amber-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                  PP-D-849201 Autopsy
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-600 font-bold">
                  CHARGEBACK
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Evidence Reconciliation:</span>
                  <span className="font-mono text-emerald-500 font-bold">5/5 Verified</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-500 h-full w-full rounded-full" />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-300">
                <strong>Gemini Strategy:</strong> COMPELLING_EVIDENCE_DIGITAL_DELIVERY with Seller Protection intangible goods coverage.
              </div>

              <div className="pt-2 text-xs text-muted-foreground flex items-center justify-between">
                <span>Response Due: <strong>6 Days Remaining</strong></span>
                <span className="text-foreground font-semibold">Risk: Low</span>
              </div>
            </div>

            {/* Human Co-Signature Enforcer */}
            <div className="fintech-card border-emerald-500/30 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">
                    Human-in-the-Loop Co-Signature
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  Passport never allows AI to unilaterally submit legal dispute responses or touch funds. A human owner must review and co-sign the exact payload before submission to PayPal.
                </p>
              </div>

              <div className="p-3.5 rounded-lg border border-border bg-card text-xs font-mono space-y-1">
                <div className="text-[10px] text-muted-foreground uppercase">Attestation Signature</div>
                <div className="text-emerald-500 font-bold truncate">
                  CO-SIGNED BY: Jacob (Owner &amp; Compliance Lead)
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: SECURITY MODEL */}
      <section id="security" className="py-20 md:py-28 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs uppercase font-mono font-bold tracking-wider text-primary-500">
              Institutional Grade
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Fintech Security Model
            </h2>
            <p className="text-sm text-muted-foreground">
              Engineered with zero-trust principles at every layer of the transaction lifecycle.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
            <div className="p-5 rounded-xl border border-border bg-background space-y-2">
              <Lock className="w-5 h-5 text-primary-500" />
              <h4 className="font-bold text-foreground text-sm">Mandate Bounds</h4>
              <p className="text-muted-foreground leading-relaxed">
                Deterministic policy checks on spend limits, authorized categories, and expirations before payment.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-border bg-background space-y-2">
              <Layers className="w-5 h-5 text-emerald-500" />
              <h4 className="font-bold text-foreground text-sm">Merkle Audit Trail</h4>
              <p className="text-muted-foreground leading-relaxed">
                Every agent proposal, decision, and transaction is hashed and chained into an immutable audit ledger.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-border bg-background space-y-2">
              <UserCheck className="w-5 h-5 text-amber-500" />
              <h4 className="font-bold text-foreground text-sm">Human Approval</h4>
              <p className="text-muted-foreground leading-relaxed">
                Mandatory human co-signature enforced for refunds, dispute filings, and money-moving exceptions.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-border bg-background space-y-2">
              <ShieldCheck className="w-5 h-5 text-primary-500" />
              <h4 className="font-bold text-foreground text-sm">Webhook Verification</h4>
              <p className="text-muted-foreground leading-relaxed">
                PayPal cryptographic certificate signatures validated before processing any webhook event.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: TECH STACK */}
      <section className="py-16 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <span className="text-xs uppercase font-mono font-bold tracking-wider text-muted-foreground">
            Built for the PayPal AI Hackathon
          </span>

          <div className="flex flex-wrap items-center justify-center gap-8 text-sm font-semibold text-muted-foreground">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              <span>PayPal Orders, Webhooks &amp; Disputes API</span>
            </div>
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-emerald-500" />
              <span>Google Gemini (Pro + Flash)</span>
            </div>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary-500" />
              <span>AG Grid Ledger</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-foreground" />
              <span>Next.js 14 + Tailwind CSS</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: FINAL CTA */}
      <section className="py-24 bg-gradient-to-b from-card to-background text-center relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            Make every AI-agent payment authorized, auditable, and defensible.
          </h2>
          <p className="text-base text-muted-foreground max-w-xl mx-auto">
            Experience the complete solo hackathon demo with seeded PayPal sandbox transactions.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/demo"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm shadow-lg shadow-primary/25 transition-all hover:scale-[1.02]"
            >
              <Play className="w-4 h-4 fill-current" />
              Launch Live Demo Tour
            </Link>

            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-border bg-card hover:bg-muted text-foreground font-semibold text-sm shadow-sm transition-all hover:scale-[1.02]"
            >
              Open Operations Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border py-8 bg-card/50 text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary-600 dark:text-primary-400" />
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

