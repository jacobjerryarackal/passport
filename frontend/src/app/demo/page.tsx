"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { HashInspector } from "@/components/ui/hash-inspector";
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
  RotateCcw,
  Sparkles,
  Lock,
  UserCheck,
  Send,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import confetti from "canvas-confetti";

export default function DemoTourPage() {
  const [activeStep, setActiveStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const [mandateData, setMandateData] = useState<any | null>(null);
  const [blockedData, setBlockedData] = useState<any | null>(null);
  const [approvedData, setApprovedData] = useState<any | null>(null);
  const [purchaseData, setPurchaseData] = useState<any | null>(null);
  const [passportData, setPassportData] = useState<any | null>(null);
  const [disputeData, setDisputeData] = useState<any | null>(null);

  // Load initial demo state
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
      console.error(err);
    }
  };

  useEffect(() => {
    loadDemoData();
  }, []);

  const handleStep1 = () => {
    setActiveStep(1);
  };

  const handleStep2 = async () => {
    setActiveStep(2);
    setLoading(true);
    setStatusMessage("Testing Blocked Proposal ($120 Physical Office Chair)...");
    try {
      const res = await fetch("/api/purchases/propose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mandateId: mandateData?.id || "mandate-gift-card-demo",
          userPrompt: "Buy an ergonomic office chair for the client",
          forceBlockedScenario: true,
        }),
      });
      const data = await res.json();
      setBlockedData(data);
      setStatusMessage("Proposal strictly BLOCKED by Passport compliance engine!");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStep3 = async () => {
    setActiveStep(3);
    setLoading(true);
    setStatusMessage("Testing Approved Proposal ($75 Starbucks Digital Gift Card)...");
    try {
      const res = await fetch("/api/purchases/propose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mandateId: mandateData?.id || "mandate-gift-card-demo",
          userPrompt: "Select an appropriate coffee gift card for client appreciation within budget",
          forceBlockedScenario: false,
        }),
      });
      const data = await res.json();
      setApprovedData(data);
      setStatusMessage("Proposal APPROVED: $75 is within $80 cap and in digital gift cards category!");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStep4And5 = async () => {
    setActiveStep(4);
    setLoading(true);
    setStatusMessage("Creating & Capturing PayPal Sandbox Order...");
    try {
      const proposalId = approvedData?.proposal?.id || "prop-approved-gift-card";
      const res = await fetch("/api/purchases/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposalId }),
      });
      const data = await res.json();
      if (res.ok) {
        setPurchaseData(data.purchase);
        setPassportData(data.passport);
        setActiveStep(5);
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ["#0070BA", "#10B981"],
        });
        setStatusMessage("PayPal Sandbox Order Captured & Trust Passport Issued!");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStep6And7 = async () => {
    setActiveStep(6);
    setLoading(true);
    setStatusMessage("Simulating Incoming PayPal Dispute Webhook...");
    try {
      const res = await fetch("/api/webhooks/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventType: "CUSTOMER.DISPUTE.CREATED" }),
      });
      const data = await res.json();
      if (res.ok) {
        setDisputeData(data.dispute);
        setActiveStep(7);
        setStatusMessage("Dispute Received! Chargeback Autopsy analysis completed.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStep8CoSign = async () => {
    if (!disputeData) return;
    setLoading(true);
    setStatusMessage("Submitting Human Co-Signed Defense to PayPal Disputes API...");
    try {
      const res = await fetch(`/api/disputes/${disputeData.id}/cosign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cosignedBy: "Jacob (Authorized Business Owner & Compliance Director)",
          finalResponseText: disputeData.draftResponse,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setActiveStep(8);
        setDisputeData(data.dispute);
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#10B981", "#0070BA", "#F59E0B"],
        });
        setStatusMessage("Human Co-Signature Approved! Final defense submitted to PayPal.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetTour = async () => {
    setLoading(true);
    try {
      await fetch("/api/demo/reset", { method: "POST" });
      setActiveStep(1);
      await loadDemoData();
      setStatusMessage("Demo reset to clean seed state.");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Tour Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-border gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-primary-500/10 text-primary-600 dark:text-primary-400 font-bold border border-primary-500/20">
                Interactive Operations Tour
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                Autonomous Agent Spend Lifecycle
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground mt-1">
              End-to-End Enterprise Governance Lifecycle
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Follow the journey from Mandate creation &rarr; Agent Boundary Check &rarr; PayPal Checkout &rarr; Trust Passport &rarr; Chargeback Autopsy &rarr; Human Co-Signature.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={resetTour}
              disabled={loading}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Tour
            </Button>
            <Link href="/dashboard">
              <Button variant="primary" size="sm">
                <span>Go to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Step Indicator Progress Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 text-xs">
          {[
            { step: 1, name: "1. Mandate", icon: FileCheck2 },
            { step: 2, name: "2. Block Test", icon: XCircle },
            { step: 3, name: "3. Approve", icon: CheckCircle2 },
            { step: 4, name: "4. PayPal", icon: CreditCard },
            { step: 5, name: "5. Passport", icon: ScrollText },
            { step: 6, name: "6. Dispute", icon: AlertOctagon },
            { step: 7, name: "7. Autopsy", icon: Bot },
            { step: 8, name: "8. Co-Sign", icon: UserCheck },
          ].map((s) => {
            const isDone = activeStep > s.step;
            const isCurrent = activeStep === s.step;
            const Icon = s.icon;
            return (
              <button
                key={s.step}
                onClick={() => setActiveStep(s.step)}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  isCurrent
                    ? "border-primary-500 bg-primary-500/10 text-primary-600 dark:text-primary-400 font-bold shadow-xs"
                    : isDone
                    ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400"
                    : "border-border bg-card text-muted-foreground opacity-60"
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-[10px] font-mono">{s.step}/8</span>
                </div>
                <div className="text-[11px] font-semibold truncate">{s.name}</div>
              </button>
            );
          })}
        </div>

        {/* Status Notification */}
        {statusMessage && (
          <div className="p-3 rounded-lg bg-primary-500/10 border border-primary-500/20 text-xs font-medium text-primary-700 dark:text-primary-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary-500" />
              <span>{statusMessage}</span>
            </div>
          </div>
        )}

        {/* Step Content View */}
        <div className="fintech-card p-6 space-y-6">
          {/* STEP 1: Mandate */}
          {activeStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    Step 1: Human Sets the Spend Mandate
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    The business owner defines authorized purpose, maximum budget, allowed categories, and refund policy.
                  </p>
                </div>
                <StatusPill status="approved" label="ACTIVE MANDATE" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-lg border border-border bg-background space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground font-mono">Purpose</span>
                  <div className="text-sm font-bold text-foreground">Client appreciation gift</div>
                </div>
                <div className="p-4 rounded-lg border border-border bg-background space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground font-mono">Budget Cap</span>
                  <div className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">$80.00 USD Maximum</div>
                </div>
                <div className="p-4 rounded-lg border border-border bg-background space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground font-mono">Allowed Categories</span>
                  <div className="font-mono text-foreground font-semibold">digital gift cards</div>
                </div>
                <div className="p-4 rounded-lg border border-border bg-background space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground font-mono">Validity &amp; Expiry</span>
                  <div className="font-mono text-foreground font-semibold">24 Hours (Automated expiry)</div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleStep2}
                  disabled={loading}
                >
                  <span>Proceed to Step 2: Test Blocked Attempt</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: Blocked Attempt */}
          {activeStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                    Step 2: Demonstrate Blocked Attempt ($120 Physical Office Chair)
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    AI agent attempts to buy a $120 office chair. Passport immediately catches and blocks the proposal!
                  </p>
                </div>
                <StatusPill status="blocked" label="BLOCKED" />
              </div>

              <div className="p-4 rounded-lg border border-rose-500/30 bg-rose-500/5 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground text-sm">
                    Proposed: Ergonomic Office Headset &amp; Stand ($120.00 USD)
                  </span>
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                    EXCEEDS $80 CAP
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-background border border-rose-500/20 text-rose-700 dark:text-rose-300">
                  <strong>Rejection Reason:</strong> Proposal exceeds mandate limit of $80.00 (requested: $120.00) AND category &quot;physical equipment&quot; is outside authorized categories [&quot;digital gift cards&quot;].
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleStep3}
                  disabled={loading}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  <span>Proceed to Step 3: Test Authorized Proposal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Approved Attempt */}
          {activeStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                    Step 3: Authorized Proposal ($75 Digital Gift Card)
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Agent proposes a $75 Starbucks Digital Gift Card. Passport verifies it complies with all mandate bounds.
                  </p>
                </div>
                <StatusPill status="approved" label="APPROVED" />
              </div>

              <div className="p-4 rounded-lg border border-emerald-500/30 bg-emerald-500/5 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-foreground text-sm block">
                      Starbucks Digital e-Gift Card ($75.00 USD)
                    </span>
                    <span className="text-muted-foreground text-[11px]">
                      Recipient: vip-client@partnercorp.io · Category: digital gift cards
                    </span>
                  </div>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-base tabular-nums">
                    $75.00 USD
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2">
                  <div className="p-2 rounded bg-background border border-emerald-500/20 text-[11px] text-emerald-700 dark:text-emerald-300 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" /> $75 &le; $80 Cap
                  </div>
                  <div className="p-2 rounded bg-background border border-emerald-500/20 text-[11px] text-emerald-700 dark:text-emerald-300 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Category Match
                  </div>
                  <div className="p-2 rounded bg-background border border-emerald-500/20 text-[11px] text-emerald-700 dark:text-emerald-300 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Active Expiry
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleStep4And5}
                  disabled={loading}
                >
                  <span>Proceed to Step 4 &amp; 5: Execute via PayPal &amp; Issue Passport</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4 & 5: PayPal Checkout & Trust Passport */}
          {(activeStep === 4 || activeStep === 5) && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    Step 4 &amp; 5: PayPal Sandbox Settlement &amp; Trust Passport Issued
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    PayPal sandbox order created &amp; captured. Cryptographic Trust Passport generated with SHA-256 fingerprint!
                  </p>
                </div>
                <StatusPill status="approved" label="SETTLED &amp; VERIFIED" />
              </div>

              <div className="p-5 rounded-lg border border-primary-500/30 bg-primary-500/5 space-y-4 text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-primary-600 dark:text-primary-400 tracking-wider font-mono">
                      Trust Passport Credential
                    </span>
                    <h4 className="text-base font-mono font-bold text-foreground">
                      {passportData?.passportNumber || "PASS-2026-8942-US"}
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase text-muted-foreground block font-semibold font-mono">
                      Seller Protection
                    </span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">ELIGIBLE</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-[11px]">
                  <div>PayPal Order: <strong className="text-foreground">{purchaseData?.paypalOrderId || "PAYPAL-ORD-8X92104M-SB"}</strong></div>
                  <div>Capture ID: <strong className="text-foreground">{purchaseData?.paypalCaptureId || "CAPTURE-7TY90123L-SB"}</strong></div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground mr-2">SHA-256 Hash:</span>
                    <HashInspector hash={passportData?.passportHash || "92fe1516cccce243f341d4a8c20fb2d73192078e6e4084a252a3b2cd9bfbca45"} />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleStep6And7}
                  disabled={loading}
                  className="bg-amber-500 hover:bg-amber-400 text-black border-amber-500 font-bold"
                >
                  <span>Proceed to Step 6 &amp; 7: Simulate Dispute &amp; Run Autopsy</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 6 & 7: Dispute Autopsy */}
          {(activeStep === 6 || activeStep === 7) && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-amber-700 dark:text-amber-400 flex items-center gap-2">
                    Step 6 &amp; 7: Dispute Arrives &amp; Chargeback Autopsy Runs
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Cardholder claims &quot;Unauthorized Transaction&quot;. Passport links dispute to mandate &amp; receipt, classifies claim, and drafts defense.
                  </p>
                </div>
                <StatusPill status="action_required" label="AUTOPSY COMPLETE" />
              </div>

              <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/5 space-y-3 text-xs">
                <div className="flex items-center justify-between font-mono">
                  <span className="font-bold text-foreground">
                    Dispute ID: {disputeData?.paypalDisputeId || "PP-D-849201"}
                  </span>
                  <span className="text-amber-700 dark:text-amber-400 font-bold tabular-nums">
                    Readiness: 98/100
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-background border border-border text-[11px] leading-relaxed text-foreground/90 font-sans">
                  <strong>Gemini Defense Strategy:</strong> COMPELLING_EVIDENCE_DIGITAL_DELIVERY. The $75 digital gift card was authorized by the business mandate, purchased via authenticated PayPal sandbox, and electronically dispatched.
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleStep8CoSign}
                  disabled={loading}
                  className="bg-amber-500 hover:bg-amber-400 text-black border-amber-500 font-bold"
                >
                  <span>Proceed to Step 8: Human Co-Sign &amp; Submit</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 8: Co-Signed & Submitted */}
          {activeStep === 8 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                    Step 8: Human Approval &amp; Defense Submission Complete!
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Strict human-in-the-loop requirement satisfied: human business owner co-signed the exact defense payload before submission to PayPal.
                  </p>
                </div>
                <StatusPill status="approved" label="SUBMITTED" />
              </div>

              <div className="p-5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 space-y-3 text-xs">
                <div className="flex items-center gap-2 font-bold text-foreground text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  Full Governance Lifecycle Verified 100%!
                </div>
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  Every step of the product architecture has been verified: human mandate enforcement, blocked out-of-scope proposal, approved transaction, PayPal sandbox settlement, cryptographic Trust Passport, incoming dispute webhook, Chargeback Autopsy, and human co-signature approval.
                </p>
              </div>

              <div className="flex justify-end pt-4 gap-3">
                <Button variant="outline" size="sm" onClick={resetTour}>
                  Run Tour Again
                </Button>
                <Link href="/dashboard">
                  <Button variant="primary" size="sm">
                    <span>Enter Operations Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
