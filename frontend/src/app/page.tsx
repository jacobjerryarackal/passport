"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { TrustPassportCredential } from "@/components/passports/trust-passport-credential";
import { Button } from "@/components/ui/button";
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
  Fingerprint,
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

      {/* HERO SECTION — ASYMMETRIC EDITORIAL COMPOSITION */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-24 fintech-grid border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Institutional Pitch */}
            <div className="lg:col-span-6 space-y-6">
              {/* Telemetry pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-secondary border border-border text-xs font-medium text-foreground">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                <span className="font-semibold text-primary">
                  Financial Control Plane
                </span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground font-mono text-[11px]">
                  PayPal Orders v2 · Webhooks · Disputes API
                </span>
              </div>

              {/* Headline with High-Contrast Light and Dark styling */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.08]">
                AI agents can spend money.{" "}
                <span className="text-primary block mt-1">
                  Passport makes every purchase accountable.
                </span>
              </h1>

              {/* Subheadline */}
              <p className="text-base sm:text-lg text-muted-foreground font-normal leading-relaxed max-w-xl">
                Authorize AI-agent purchases, generate verifiable receipts, and turn disputes into evidence-ready cases.
              </p>

              {/* Primary Call to Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <Link href="/demo" tabIndex={-1}>
                  <Button
                    variant="primary"
                    size="lg"
                    leadingIcon={<Play className="w-4 h-4 fill-current" />}
                    className="w-full sm:w-auto"
                  >
                    Launch Interactive Demo
                  </Button>
                </Link>

                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  tabIndex={-1}
                >
                  <Button
                    variant="outline"
                    size="lg"
                    leadingIcon={<Github className="w-4 h-4" />}
                    className="w-full sm:w-auto"
                  >
                    View Source on GitHub
                  </Button>
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-border/80 grid grid-cols-3 gap-4 text-xs font-medium">
                <div>
                  <div className="font-mono text-base font-bold text-foreground tabular-nums">100%</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">Mandate-checked</div>
                </div>
                <div>
                  <div className="font-mono text-base font-bold text-foreground tabular-nums">SHA-256</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">Merkle audit chain</div>
                </div>
                <div>
                  <div className="font-mono text-base font-bold text-foreground tabular-nums">Human-in-Loop</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">Co-signed defense</div>
                </div>
              </div>
            </div>

            {/* Right Column: Live Centerpiece Trust Passport Credential */}
            <div className="lg:col-span-6 relative">
              <div className="text-center mb-2 lg:text-right">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground bg-secondary px-2.5 py-1 rounded border border-border">
                  Live Interactive Financial Credential
                </span>
              </div>
              <TrustPassportCredential
                passport={DEMO_HERO_PASSPORT}
                verification={DEMO_HERO_VERIFICATION}
              />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: THE AGENT SPEND DILEMMA (COMPARISON LEDGER) */}
      <section id="problem" className="py-20 md:py-24 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              The Agent Spend Dilemma
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              &quot;Your AI agent just spent $75. Can you prove what it was authorized to do?&quot;
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Autonomous agents execute payments through tool calling, but traditional payment gateways were never engineered for non-human purchasers. Here is what breaks without Passport:
            </p>
          </div>

          {/* Institutional Comparison Table */}
          <div className="rounded-xl border border-border bg-background overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-secondary/50 border-b border-border text-muted-foreground uppercase text-[10px] font-mono tracking-wider">
                  <tr>
                    <th className="py-3.5 px-6 font-semibold">Payment Lifecycle Stage</th>
                    <th className="py-3.5 px-6 font-semibold text-rose-600 dark:text-rose-400">Traditional Gateway Exposure</th>
                    <th className="py-3.5 px-6 font-semibold text-emerald-600 dark:text-emerald-400">Passport Institutional Defense</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  <tr className="hover:bg-muted/20 transition-colors">
                    <td className="py-4 px-6 font-semibold text-foreground align-top">
                      <div className="text-xs">1. Spend Authority</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">Budget bounds</div>
                    </td>
                    <td className="py-4 px-6 text-muted-foreground align-top space-y-1">
                      <div className="text-foreground font-medium flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                        <XCircle className="w-3.5 h-3.5 shrink-0" />
                        Naked API Tokens
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Prompt injection or model hallucination can trigger unbounded transactions with zero pre-authorization checks.
                      </p>
                    </td>
                    <td className="py-4 px-6 text-muted-foreground align-top space-y-1">
                      <div className="text-foreground font-medium flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        Cryptographic Mandates
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Enforced hard budget cap ($80), authorized categories, and TTL expiry. Out-of-bounds proposals are rejected pre-execution.
                      </p>
                    </td>
                  </tr>

                  <tr className="hover:bg-muted/20 transition-colors">
                    <td className="py-4 px-6 font-semibold text-foreground align-top">
                      <div className="text-xs">2. Transaction Receipt</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">Non-repudiation</div>
                    </td>
                    <td className="py-4 px-6 text-muted-foreground align-top space-y-1">
                      <div className="text-foreground font-medium flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                        <XCircle className="w-3.5 h-3.5 shrink-0" />
                        Opaque Gateway Receipts
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Shows only dollar amount. Leaves zero evidentiary record of user prompt, model reasoning, or business justification.
                      </p>
                    </td>
                    <td className="py-4 px-6 text-muted-foreground align-top space-y-1">
                      <div className="text-foreground font-medium flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        Verifiable Trust Passport
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Binds authorizer mandate, Gemini inference trace, line items, and PayPal capture into an immutable SHA-256 digest.
                      </p>
                    </td>
                  </tr>

                  <tr className="hover:bg-muted/20 transition-colors">
                    <td className="py-4 px-6 font-semibold text-foreground align-top">
                      <div className="text-xs">3. Dispute &amp; Chargeback</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">Fraud defense</div>
                    </td>
                    <td className="py-4 px-6 text-muted-foreground align-top space-y-1">
                      <div className="text-foreground font-medium flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                        <XCircle className="w-3.5 h-3.5 shrink-0" />
                        Automatic Loss
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Cardholder files &quot;Unauthorized Transaction&quot;. Merchant has zero cryptographic proof that a legitimate human approved the agent.
                      </p>
                    </td>
                    <td className="py-4 px-6 text-muted-foreground align-top space-y-1">
                      <div className="text-foreground font-medium flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        Autonomous Chargeback Autopsy
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Reconciles all 5 proofs, drafts PayPal compelling evidence defense, and requires mandatory human owner co-signature.
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: PRODUCT ARCHITECTURE PIPELINE */}
      <section id="architecture" className="py-20 md:py-24 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-primary">
              System Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              How Passport Protects Autonomous Purchases
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A sequential, deterministic cryptographic pipeline running across PayPal Sandbox and Google Gemini.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Step 1 */}
            <div className="p-5 rounded-lg border border-border bg-card space-y-2 relative">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-muted-foreground">01</span>
                <span className="w-2 h-2 rounded-full bg-primary" />
              </div>
              <div className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-primary" />
                Human Sets Mandate
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Owner authorizes: &quot;Client appreciation gift, up to $80, digital gift cards only, 24h.&quot; Parsed via Gemini into cryptographic policy.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-5 rounded-lg border border-border bg-card space-y-2 relative">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-muted-foreground">02</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <div className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Agent Proposes Item
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                AI Agent selects an optimal purchase within the mandate. Out-of-bounds proposals ($120 chair) are strictly rejected before hitting PayPal.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-5 rounded-lg border border-border bg-card space-y-2 relative">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-muted-foreground">03</span>
                <span className="w-2 h-2 rounded-full bg-primary" />
              </div>
              <div className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-primary" />
                PayPal Executes Order
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                PayPal Orders v2 API creates and captures the $75 order. Settlement confirmed with PayPal Seller Protection eligibility.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-5 rounded-lg border border-border bg-card space-y-2 relative">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-muted-foreground">04</span>
                <span className="w-2 h-2 rounded-full bg-amber-500" />
              </div>
              <div className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                Trust Passport Issued
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Passport hashes authorization, agent trail, and receipt into a SHA-256 credential. If disputed, Chargeback Autopsy defends the case.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: FORENSIC DISPUTE AUTOPSY PREVIEW */}
      <section id="autopsy" className="py-20 md:py-24 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Forensic Dispute Defense
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Autonomous Chargeback Autopsy
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              When a dispute arrives, Passport reconciles the audit trail, drafts the defense, and requires human co-signature.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Forensic Pipeline Card */}
            <div className="fintech-card p-6 space-y-4 border-amber-500/30">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                  PP-D-849201 Autopsy
                </span>
                <StatusPill status="action_required" label="CHARGEBACK RECEIVED" />
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Evidence Reconciliation:</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold tabular-nums">
                    5/5 Verified (100%)
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-500 h-full w-full rounded-full" />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/25 text-[11px] text-amber-900 dark:text-amber-300 leading-relaxed">
                <strong>Gemini Strategy:</strong> COMPELLING_EVIDENCE_DIGITAL_DELIVERY with Seller Protection intangible goods coverage.
              </div>

              <div className="pt-2 text-xs text-muted-foreground flex items-center justify-between border-t border-border">
                <span>Response Due: <strong className="text-foreground">6 Days Remaining</strong></span>
                <span className="text-foreground font-semibold">Risk: Low (98/100)</span>
              </div>
            </div>

            {/* Human Co-Signature Enforcer */}
            <div className="fintech-card p-6 space-y-4 flex flex-col justify-between border-emerald-500/30">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">
                    Human-in-the-Loop Co-Signature
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Passport never allows AI to unilaterally submit legal dispute responses or touch funds. A human owner must review and co-sign the exact payload before submission to PayPal.
                </p>
              </div>

              <div className="p-3.5 rounded-lg border border-border bg-background text-xs font-mono space-y-1">
                <div className="text-[10px] text-muted-foreground uppercase">Attestation Signature</div>
                <div className="text-emerald-600 dark:text-emerald-400 font-bold truncate">
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
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-primary">
              Security Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Zero-Trust Financial Security Model
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Engineered with zero-trust principles at every layer of the transaction lifecycle.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-5 rounded-lg border border-border bg-card space-y-2">
              <Lock className="w-4 h-4 text-primary" />
              <h4 className="font-bold text-foreground text-sm">Mandate Bounds</h4>
              <p className="text-muted-foreground leading-relaxed">
                Deterministic policy checks on spend limits, authorized categories, and expirations before payment.
              </p>
            </div>

            <div className="p-5 rounded-lg border border-border bg-card space-y-2">
              <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h4 className="font-bold text-foreground text-sm">Merkle Audit Trail</h4>
              <p className="text-muted-foreground leading-relaxed">
                Every agent proposal, decision, and transaction is hashed and chained into an immutable audit ledger.
              </p>
            </div>

            <div className="p-5 rounded-lg border border-border bg-card space-y-2">
              <UserCheck className="w-4 h-4 text-amber-500" />
              <h4 className="font-bold text-foreground text-sm">Human Approval</h4>
              <p className="text-muted-foreground leading-relaxed">
                Mandatory human co-signature enforced for refunds, dispute filings, and money-moving exceptions.
              </p>
            </div>

            <div className="p-5 rounded-lg border border-border bg-card space-y-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <h4 className="font-bold text-foreground text-sm">Webhook Verification</h4>
              <p className="text-muted-foreground leading-relaxed">
                PayPal cryptographic certificate signatures validated before processing any webhook event.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-20 md:py-24 bg-card text-center relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Make every AI-agent payment authorized, auditable, and defensible.
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Experience the complete financial control plane with interactive sandbox transactions.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/demo" tabIndex={-1}>
              <Button
                variant="primary"
                size="lg"
                leadingIcon={<Play className="w-4 h-4 fill-current" />}
                className="w-full sm:w-auto"
              >
                Launch Live Demo Tour
              </Button>
            </Link>

            <Link href="/dashboard" tabIndex={-1}>
              <Button
                variant="secondary"
                size="lg"
                trailingIcon={<ArrowRight className="w-4 h-4" />}
                className="w-full sm:w-auto"
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
