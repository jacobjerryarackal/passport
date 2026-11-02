"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { TrustPassportCredential } from "@/components/passports/trust-passport-credential";
import { FintechButton } from "@/components/ui/fintech-button";
import { StatusPill } from "@/components/ui/status-pill";
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
  Cpu,
} from "lucide-react";

const DEMO_HERO_PASSPORT = {
  id: "pass-giftcard-75",
  passportNumber: "PASS-2026-8942-US",
  status: "ISSUED",
  disputeReadinessScore: 98,
  passportHash: "92fe1516cccce243f341d4a8c20fb2d7e012354a8b7923485cba799ef0439201",
  issuedAt: "2026-11-02T18:30:00Z",
  authorizationData: JSON.stringify({
    mandateId: "mandate-gift-card-demo",
    title: "Client Appreciation Gift",
    purpose: "Client appreciation gift for Q4 milestone delivery",
    maxAmount: 80.0,
    currency: "USD",
    allowedCategories: "digital gift cards",
    authorizer: "Human Business Owner (Jacob)",
    approvedAt: "2026-11-02T18:28:00Z",
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
    recipient: "client@acmecorp.com",
    paypalOrderId: "PAYPAL-ORD-8X92104M-SB",
    paypalCaptureId: "CAPTURE-7TY90123L-SB",
    status: "SETTLED",
    disputes: [],
  },
};

const DEMO_HERO_VERIFICATION = {
  isSignatureValid: true,
  hash: "92fe1516cccce243f341d4a8c20fb2d7e012354a8b7923485cba799ef0439201",
  algorithm: "ECDSA-P256-SHA256",
  verifiedAt: "2026-11-02T18:30:00Z",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28 fintech-grid border-b border-border">
        {/* Subtle hairline gradient top bar */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary-500/30 to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Control Plane Telemetry Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border shadow-xs text-xs font-medium text-foreground">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-primary-500">
                PayPal AI Hackathon 2026
              </span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground font-mono text-[11px]">
                PayPal Orders v2 · Webhooks · Disputes API
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.12]">
              AI agents can spend money.{" "}
              <span className="block text-zinc-100 dark:text-zinc-100 sm:inline">
                Passport makes every purchase accountable.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto font-normal leading-relaxed">
              Authorize AI-agent purchases, generate verifiable receipts, and turn disputes into evidence-ready cases.
            </p>

            {/* Restrained CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link href="/demo">
                <FintechButton variant="primary" size="lg" className="w-full sm:w-auto">
                  <Play className="w-4 h-4 fill-current" />
                  Launch Live Demo
                </FintechButton>
              </Link>

              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
              >
                <FintechButton variant="outline" size="lg" className="w-full sm:w-auto">
                  <Github className="w-4 h-4" />
                  View GitHub
                </FintechButton>
              </a>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-xs text-muted-foreground font-medium">
              <div className="flex items-center gap-2">
                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span className="text-foreground font-medium">Mandate-checked</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-1.5 w-1.5 rounded-full bg-primary-400" />
                <span className="text-foreground font-medium">Audit-ready (SHA-256)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-1.5 w-1.5 rounded-full bg-amber-400" />
                <span className="text-foreground font-medium">Human-approved co-signature</span>
              </div>
            </div>
          </div>

          {/* Hero Centerpiece: Live Trust Passport Credential */}
          <div className="mt-12 max-w-4xl mx-auto">
            <div className="text-center mb-3">
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                Live Interactive Financial Credential
              </span>
            </div>
            <TrustPassportCredential
              passport={DEMO_HERO_PASSPORT}
              verification={DEMO_HERO_VERIFICATION}
            />
          </div>
        </div>
      </section>

      {/* SECTION 1: THE PROBLEM */}
      <section id="problem" className="py-20 md:py-24 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs uppercase font-mono font-bold tracking-wider text-rose-400">
              The Agent Spend Dilemma
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              &quot;Your AI agent just spent $75. Can you prove what it was authorized to do?&quot;
            </h2>
            <p className="text-sm text-muted-foreground">
              Autonomous agents can execute payments through tool calling, but traditional payment gateways were never built for non-human purchasers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Problem Card 1 */}
            <div className="p-6 rounded-xl border border-rose-500/25 bg-rose-500/5 space-y-3">
              <div className="w-9 h-9 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
                <XCircle className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-foreground">
                No Spending Mandate
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Agents operate with naked API keys or wallet tokens. A prompt injection or hallucination can blow through corporate balances with zero boundary enforcement.
              </p>
            </div>

            {/* Problem Card 2 */}
            <div className="p-6 rounded-xl border border-rose-500/25 bg-rose-500/5 space-y-3">
              <div className="w-9 h-9 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
                <AlertOctagon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-foreground">
                No Verifiable Receipt
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Traditional email receipts show only the transaction amount, leaving no record of the prompt, model inference, authorization parameters, or business purpose.
              </p>
            </div>

            {/* Problem Card 3 */}
            <div className="p-6 rounded-xl border border-rose-500/25 bg-rose-500/5 space-y-3">
              <div className="w-9 h-9 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
                <Shield className="w-5 h-5 text-rose-400" />
              </div>
              <h3 className="text-sm font-bold text-foreground">
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
      <section id="how-it-works" className="py-20 md:py-24 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs uppercase font-mono font-bold tracking-wider text-primary-500">
              The Passport Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              How Passport Protects Autonomous Purchases
            </h2>
            <p className="text-sm text-muted-foreground">
              A four-step cryptographic defense chain running on PayPal Sandbox and Google Gemini.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="fintech-card p-6 space-y-3 relative">
              <span className="text-2xl font-mono font-bold text-muted-foreground/30 tabular-nums">
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
              <span className="text-2xl font-mono font-bold text-muted-foreground/30 tabular-nums">
                02
              </span>
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-foreground">Agent Proposes Purchase</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                AI Agent selects an optimal purchase within the mandate. Out-of-bounds proposals ($120 chair) are strictly rejected before hitting PayPal.
              </p>
            </div>

            {/* Step 3 */}
            <div className="fintech-card p-6 space-y-3 relative">
              <span className="text-2xl font-mono font-bold text-muted-foreground/30 tabular-nums">
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
              <span className="text-2xl font-mono font-bold text-muted-foreground/30 tabular-nums">
                04
              </span>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-foreground">Passport &amp; Defense Ready</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Passport hashes authorization, agent trail, and receipt into a SHA-256 credential. If disputed, Chargeback Autopsy defends the case.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: CHARGEBACK AUTOPSY PREVIEW */}
      <section id="chargeback-autopsy" className="py-20 md:py-24 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs uppercase font-mono font-bold tracking-wider text-amber-400">
              Forensic Dispute Defense
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Autonomous Chargeback Autopsy
            </h2>
            <p className="text-sm text-muted-foreground">
              When a dispute arrives, Passport reconciles the audit trail, drafts the defense, and requires human co-signature.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Forensic Pipeline Card */}
            <div className="fintech-card border-amber-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-amber-400">
                  PP-D-849201 Autopsy
                </span>
                <StatusPill status="action_required" label="CHARGEBACK" />
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Evidence Reconciliation:</span>
                  <span className="font-mono text-emerald-400 font-bold tabular-nums">
                    5/5 Verified
                  </span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-500 h-full w-full rounded-full" />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
                <strong>Gemini Strategy:</strong> COMPELLING_EVIDENCE_DIGITAL_DELIVERY with Seller Protection intangible goods coverage.
              </div>

              <div className="pt-2 text-xs text-muted-foreground flex items-center justify-between border-t border-border">
                <span>Response Due: <strong className="text-foreground">6 Days Remaining</strong></span>
                <span className="text-foreground font-semibold">Risk: Low (98/100)</span>
              </div>
            </div>

            {/* Human Co-Signature Enforcer */}
            <div className="fintech-card border-emerald-500/30 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
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

              <div className="p-3.5 rounded-lg border border-border bg-background text-xs font-mono space-y-1">
                <div className="text-[10px] text-muted-foreground uppercase">Attestation Signature</div>
                <div className="text-emerald-400 font-bold truncate">
                  CO-SIGNED BY: Jacob (Owner &amp; Compliance Lead)
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: INSTITUTIONAL SECURITY MODEL */}
      <section id="security" className="py-20 md:py-24 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs uppercase font-mono font-bold tracking-wider text-primary-500">
              Institutional Grade
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Fintech Security Model
            </h2>
            <p className="text-sm text-muted-foreground">
              Engineered with zero-trust principles at every layer of the transaction lifecycle.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
            <div className="p-5 rounded-xl border border-border bg-card space-y-2">
              <Lock className="w-5 h-5 text-primary-500" />
              <h4 className="font-bold text-foreground text-sm">Mandate Bounds</h4>
              <p className="text-muted-foreground leading-relaxed">
                Deterministic policy checks on spend limits, authorized categories, and expirations before payment.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-border bg-card space-y-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              <h4 className="font-bold text-foreground text-sm">Merkle Audit Trail</h4>
              <p className="text-muted-foreground leading-relaxed">
                Every agent proposal, decision, and transaction is hashed and chained into an immutable audit ledger.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-border bg-card space-y-2">
              <UserCheck className="w-5 h-5 text-amber-400" />
              <h4 className="font-bold text-foreground text-sm">Human Approval</h4>
              <p className="text-muted-foreground leading-relaxed">
                Mandatory human co-signature enforced for refunds, dispute filings, and money-moving exceptions.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-border bg-card space-y-2">
              <ShieldCheck className="w-5 h-5 text-primary-500" />
              <h4 className="font-bold text-foreground text-sm">Webhook Verification</h4>
              <p className="text-muted-foreground leading-relaxed">
                PayPal cryptographic certificate signatures validated before processing any webhook event.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: TECH STACK */}
      <section className="py-14 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="text-xs uppercase font-mono font-bold tracking-wider text-muted-foreground">
            Built for the PayPal AI Hackathon 2026
          </span>

          <div className="flex flex-wrap items-center justify-center gap-8 text-xs sm:text-sm font-semibold text-muted-foreground">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary-400" />
              <span className="text-foreground">PayPal Orders, Webhooks &amp; Disputes API</span>
            </div>
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span className="text-foreground">Google Gemini 1.5 Pro</span>
            </div>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary-400" />
              <span className="text-foreground">AG Grid Ledger</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-foreground" />
              <span className="text-foreground">Next.js 14 + Tailwind CSS</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: FINAL CTA */}
      <section className="py-20 md:py-24 bg-background text-center relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Make every AI-agent payment authorized, auditable, and defensible.
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Experience the complete solo hackathon demo with seeded PayPal sandbox transactions.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/demo">
              <FintechButton variant="primary" size="lg" className="w-full sm:w-auto">
                <Play className="w-4 h-4 fill-current" />
                Launch Live Demo Tour
              </FintechButton>
            </Link>

            <Link href="/dashboard">
              <FintechButton variant="secondary" size="lg" className="w-full sm:w-auto">
                Open Operations Dashboard
                <ArrowRight className="w-4 h-4" />
              </FintechButton>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border py-8 bg-card/60 text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary-500" />
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
