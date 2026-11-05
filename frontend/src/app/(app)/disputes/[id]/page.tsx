"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertOctagon,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileCheck2,
  AlertTriangle,
  Bot,
  UserCheck,
  Send,
  Lock,
  Layers,
  Copy,
  ArrowLeft,
  X,
  Check,
  Fingerprint,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export interface EvidenceTimelineItem {
  id: string;
  title: string;
  description: string;
  status: "VERIFIED" | "MISSING_PROOF";
  hash: string;
  source: string;
  timestamp: string;
}

export default function DisputeAutopsyPage() {
  const params = useParams();
  const router = useRouter();
  const disputeId = (params?.id as string) || "disp-chargeback-demo";

  // Case status state: changes from "ACTION_REQUIRED" to "SUBMITTED" after co-sign
  const [caseStatus, setCaseStatus] = useState<"ACTION_REQUIRED" | "SUBMITTED">("ACTION_REQUIRED");

  // Co-signature modal state
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  // Exact SHA-256 payload hash being co-signed
  const payloadHash = "8b1a4f92c30e49a8d29b1093ee1402a7b8e1f02c91834a8e2938f01a39bc41d2";

  // 5 Evidence items: 3 VERIFIED (emerald green), 2 MISSING PROOF (muted amber)
  const evidenceItems: EvidenceTimelineItem[] = [
    {
      id: "ev-01",
      title: "Human Spend Mandate Bounds Record",
      description: "Pre-authorized $80.00 cap token and category allowlist signed by account owner.",
      status: "VERIFIED",
      hash: "sha256:7f3a8b92c4d9e01f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f",
      source: "MANDATE_SENTINEL",
      timestamp: "Today, 18:28 UTC",
    },
    {
      id: "ev-02",
      title: "PayPal Orders v2 Capture Attestation",
      description: "Settlement CAPTURE-7TY90123L-SB captured under Seller Protection terms.",
      status: "VERIFIED",
      hash: "sha256:92fe1516cccce243f341d4a8c20fb2d7e00e8b2b73bc5e2634458a2d1a3b34ff",
      source: "PAYPAL_API_V2",
      timestamp: "Today, 18:29 UTC",
    },
    {
      id: "ev-03",
      title: "Agent Prompt & Deterministic Reasoning Log",
      description: "Gemini 1.5 Pro prompt execution trail proving autonomous requisition within bounds.",
      status: "VERIFIED",
      hash: "sha256:4a8f9c0e21b3d5e7f9a1c3e5a7b9d1f3e5a7b9c1d3e5f7a9b1c3e5a7b9d1f3e5",
      source: "GEMINI_2_5_PRO",
      timestamp: "Today, 18:29 UTC",
    },
    {
      id: "ev-04",
      title: "Merchant Digital Delivery Confirmation",
      description: "Encrypted Target Corp electronic gift card voucher transmission receipt.",
      status: "MISSING_PROOF",
      hash: "sha256:pending_merchant_upload_receipt",
      source: "MERCHANT_INTEGRATION",
      timestamp: "Awaiting Upload",
    },
    {
      id: "ev-05",
      title: "Issuing Bank Chargeback Defense Response Pack",
      description: "Cryptographically co-signed defense brief ready for PayPal resolution center submission.",
      status: "MISSING_PROOF",
      hash: "sha256:pending_human_cosignature",
      source: "HUMAN_CO_SIGNER",
      timestamp: "Awaiting Human Co-Sign",
    },
  ];

  // The Climax: Circular Radial Confirmation Pulse before updating case to SUBMITTED
  const handleConfirmAndSubmit = () => {
    setIsSubmitting(true);
    setIsPulsing(true);

    // Pulse animation runs for 1.2s before closing modal and confirming
    setTimeout(() => {
      setIsPulsing(false);
      setIsSubmitting(false);
      setShowModal(false);
      setCaseStatus("SUBMITTED");
    }, 1200);
  };

  const copyHash = () => {
    navigator.clipboard.writeText(payloadHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="space-y-8 w-full max-w-5xl mx-auto">
      {/* Editorial Top Navigation */}
      <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10">
        <Link
          href="/disputes"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#002991] dark:text-[#60CDFF] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Dispute Cases</span>
        </Link>

        <span className="text-[11px] font-mono text-[#6C7378] dark:text-white/50">
          Forensics Case Room · Chargeback Autopsy
        </span>
      </div>

      {/* FORENSIC CASE ROOM MAIN ARTIFACT */}
      <div className="rounded-[28px] bg-white dark:bg-[#09090B] border border-black/10 dark:border-white/15 p-6 sm:p-10 shadow-2xl space-y-8 relative overflow-hidden">
        {/* Subtle Ambient Alert Rail */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500" />

        {/* 1. TOP BAR: CASE #DISP-XXXX + LARGE HIGHLY VISIBLE AMBER DEADLINE COUNTDOWN */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-black/10 dark:border-white/10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Dispute Forensics Incident Room
              </span>
            </div>
            {/* Case #DISP-XXXX in mono text */}
            <h1 className="font-mono font-black text-2xl sm:text-3xl text-black dark:text-white tracking-tight">
              Case #PP-D-849201
            </h1>
            <p className="text-xs text-[#6C7378] dark:text-white/60 font-mono">
              PayPal Settlement: CAPTURE-7TY90123L-SB · Disputed Amount: $75.00 USD
            </p>
          </div>

          {/* Large Highly Visible Amber Deadline Countdown */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1 shrink-0 text-left sm:text-right">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Evidence Submission Window
            </div>
            <div className="font-display font-black text-3xl sm:text-4xl text-[#FFB800] tabular-nums tracking-tight">
              5d : 18h : 22m
            </div>
            <div className="text-[11px] font-mono text-[#6C7378] dark:text-white/50">
              PayPal Seller Protection deadline: Nov 10, 2026 23:59 UTC
            </div>
          </div>
        </div>

        {/* 2. SPLIT LAYOUT: CLASSIFICATION (LEFT) / EVIDENCE RECONCILIATION (RIGHT) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN (5 COLS): CLASSIFICATION & TYPOGRAPHIC STAMP */}
          <div className="lg:col-span-5 space-y-6">
            {/* Large Typographic Stamp Indicating Dispute Type */}
            <div className="p-6 rounded-2xl border-2 border-dashed border-[#60CDFF]/40 bg-[#60CDFF]/5 dark:bg-[#60CDFF]/[0.03] space-y-4 text-left relative overflow-hidden">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#6C7378] dark:text-white/50 font-bold">
                Forensic Autopsy Classification
              </div>

              {/* Large Typographic Stamp */}
              <div className="font-display font-black text-2xl sm:text-3xl text-black dark:text-white uppercase tracking-tight leading-tight">
                UNAUTHORIZED TRANSACTION
              </div>

              {/* Deterministic Evidence Coverage Score & Segmented Bar */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-[#002991] dark:text-[#60CDFF]">
                    EVIDENCE COVERAGE: 3/5 VERIFIED
                  </span>
                  <span className="text-[#6C7378] dark:text-white/50 text-[11px]">
                    GEMINI 2.5 PRO
                  </span>
                </div>

                {/* 5-segment indicator bar */}
                <div className="grid grid-cols-5 gap-1.5 w-full">
                  <div className="h-2 rounded-full bg-[#007A56] dark:bg-emerald-400" title="[ev-01] Human Mandate: Verified" />
                  <div className="h-2 rounded-full bg-[#007A56] dark:bg-emerald-400" title="[ev-02] PayPal Capture: Verified" />
                  <div className="h-2 rounded-full bg-[#007A56] dark:bg-emerald-400" title="[ev-03] Agent Reasoning: Verified" />
                  <div className="h-2 rounded-full bg-black/10 dark:bg-white/10" title="[ev-04] Merchant Delivery: Pending" />
                  <div className="h-2 rounded-full bg-black/10 dark:bg-white/10" title="[ev-05] Co-Signature: Pending" />
                </div>
              </div>

              <p className="text-xs text-[#6C7378] dark:text-white/70 leading-relaxed font-mono pt-1">
                Cardholder claims digital charge was unrecognized. Forensic audit cross-checks [ev-01] human spend mandate bounds ($80 cap) against [ev-02] PayPal Orders v2 capture ($75 settled) and [ev-03] agent deterministic reasoning logs. 3 of 5 defense proofs cryptographically verified.
              </p>
            </div>

            {/* Case Telemetry Details */}
            <div className="p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10 space-y-3 text-xs text-left">
              <div className="flex justify-between items-center">
                <span className="text-[#6C7378] dark:text-white/60">Disputed Amount:</span>
                <span className="font-mono font-black text-black dark:text-white tabular-nums text-sm">
                  $75.00 USD
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[#6C7378] dark:text-white/60">Seller Protection:</span>
                <span className="font-mono font-bold text-[#007A56] dark:text-emerald-400">
                  ELIGIBLE_IN_FULL
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[#6C7378] dark:text-white/60">Defense Strategy:</span>
                <span className="font-mono font-bold text-[#002991] dark:text-[#60CDFF]">
                  COMPELLING_EVIDENCE_DELIVERY
                </span>
              </div>

              <div className="pt-2 border-t border-black/5 dark:border-white/5">
                <span className="text-[10px] font-mono uppercase text-[#6C7378] dark:text-white/50 block mb-1">
                  Buyer Dispute Statement
                </span>
                <p className="italic text-[11px] text-[#1D1E20] dark:text-white/80 leading-relaxed bg-black/[0.03] dark:bg-white/[0.04] p-3 rounded-xl border border-black/5 dark:border-white/5">
                  &ldquo;Cardholder reported unrecognized digital charge; claims card details were compromised.&rdquo;
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (7 COLS): EVIDENCE RECONCILIATION VERTICAL TIMELINE */}
          <div className="lg:col-span-7 space-y-4 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10">
              <div className="space-y-0.5">
                <h3 className="font-display font-black text-lg text-black dark:text-white">
                  Evidence Reconciliation Ledger
                </h3>
                <p className="text-xs text-[#6C7378] dark:text-white/60 font-mono">
                  3 of 5 Artifacts Cryptographically Sealed · 2 Awaiting Human Co-Sign
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-[#007A56] dark:text-emerald-400">
                60% Complete
              </span>
            </div>

            {/* Vertical Timeline / List of 5 Evidence Items */}
            <div className="space-y-3">
              {evidenceItems.map((item, idx) => {
                const isVerified = item.status === "VERIFIED";

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10 space-y-2 hover:bg-black/[0.04] dark:hover:bg-white/[0.05] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <span className="font-mono text-xs font-bold text-[#6C7378] dark:text-white/40 mt-0.5">
                          0{idx + 1}
                        </span>
                        <div>
                          <div className="font-display font-bold text-xs sm:text-sm text-black dark:text-white">
                            {item.title}
                          </div>
                          <p className="text-[11px] text-[#6C7378] dark:text-white/60 mt-0.5 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      {/* Status Badge: VERIFIED (emerald green) vs MISSING PROOF (muted amber) */}
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold shrink-0 ${
                          isVerified
                            ? "bg-[#007A56]/15 text-[#007A56] dark:bg-[#007A56]/30 dark:text-emerald-400 border border-[#007A56]/30"
                            : "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isVerified ? "bg-[#007A56] dark:bg-emerald-400" : "bg-amber-500"
                          }`}
                        />
                        <span>{isVerified ? "VERIFIED" : "MISSING PROOF"}</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-[#6C7378] dark:text-white/40 pt-1 border-t border-black/5 dark:border-white/5">
                      <span>Source: {item.source}</span>
                      <span className="truncate max-w-[200px]" title={item.hash}>
                        {item.hash.slice(0, 16)}...
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. THE CLIMAX (HUMAN CO-SIGN): CO-SIGN DEFENSE PILL BUTTON AT BOTTOM */}
        <div className="pt-6 border-t border-black/10 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left space-y-0.5">
            <div className="text-xs font-mono font-bold text-black dark:text-white">
              Status:{" "}
              <span
                className={
                  caseStatus === "SUBMITTED"
                    ? "text-[#007A56] dark:text-emerald-400"
                    : "text-amber-600 dark:text-amber-400"
                }
              >
                {caseStatus === "SUBMITTED" ? "SUBMITTED TO PAYPAL" : "AWAITING CO-SIGNATURE"}
              </span>
            </div>
            <p className="text-[11px] text-[#6C7378] dark:text-white/50">
              Co-signing bounds the evidence bundle with human accountability.
            </p>
          </div>

          {caseStatus === "SUBMITTED" ? (
            <span className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-black text-[#007A56] dark:text-emerald-400 bg-[#007A56]/15 border border-[#007A56]/30 shadow-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>DEFENSE SUBMITTED TO PAYPAL</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-sm font-black text-black bg-[#FFB800] hover:bg-[#e6a600] active:scale-[0.98] transition-all shadow-md"
            >
              <span>Co-Sign Defense</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 4. HIGH-FRICTION CO-SIGNATURE MODAL WITH CIRCULAR RADIAL CONFIRMATION PULSE */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-[#111114] border border-black/15 dark:border-white/20 p-6 sm:p-8 shadow-2xl space-y-6 text-left overflow-hidden">
            {/* SLEEK CIRCULAR RADIAL CONFIRMATION PULSE ANIMATION ON CONFIRM */}
            {isPulsing && (
              <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-xs pointer-events-none">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0.9 }}
                  animate={{ scale: 3, opacity: 0 }}
                  transition={{ duration: 1.1, ease: "easeOut" }}
                  className="w-32 h-32 rounded-full border-4 border-[#FFB800] bg-[#FFB800]/20"
                />
                <motion.div
                  initial={{ scale: 0.2, opacity: 1 }}
                  animate={{ scale: 2.2, opacity: 0 }}
                  transition={{ duration: 0.9, delay: 0.1, ease: "easeOut" }}
                  className="w-32 h-32 rounded-full border-2 border-emerald-400 bg-emerald-400/20"
                />
              </div>
            )}

            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10">
              <div className="space-y-1">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>High-Friction Attestation</span>
                </div>
                <h3 className="font-display font-black text-xl text-black dark:text-white">
                  Co-Sign Chargeback Defense
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                disabled={isSubmitting}
                className="w-8 h-8 rounded-full border border-black/10 dark:border-white/15 flex items-center justify-center text-[#6C7378] dark:text-white/60 hover:text-black dark:hover:text-white transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* SHA-256 Payload Hash in Monospace Text */}
            <div className="space-y-2 p-4 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/5 dark:border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase font-bold text-[#6C7378] dark:text-white/50">
                  Exact SHA-256 Payload Hash Being Sealed
                </span>
                <button
                  type="button"
                  onClick={copyHash}
                  className="text-xs font-mono text-[#002991] dark:text-[#60CDFF] hover:underline flex items-center gap-1"
                >
                  {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedHash ? "Copied" : "Copy Hash"}</span>
                </button>
              </div>

              {/* Exact SHA-256 payload hash in mono text */}
              <div className="font-mono text-xs text-black dark:text-white break-all leading-relaxed font-bold bg-black/5 dark:bg-white/5 p-3 rounded-xl border border-black/5 dark:border-white/5">
                {payloadHash}
              </div>
            </div>

            {/* Legal Statement */}
            <div className="space-y-2 text-xs text-[#6C7378] dark:text-white/70 leading-relaxed font-mono">
              <p>
                By confirming, you attest that the attached evidence bundle (Human Mandate Token,
                PayPal Orders v2 settlement hash, and Gemini reasoning trail) represents authorized
                commercial activity executed under bounded autonomous parameters.
              </p>
            </div>

            {/* Confirm & Submit Button with Sleek Circular Radial Confirmation Pulse */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/10 dark:border-white/10">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-full text-xs font-bold text-[#6C7378] dark:text-white/70 hover:text-black dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAndSubmit}
                disabled={isSubmitting}
                className="relative inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full text-xs sm:text-sm font-black text-black bg-[#FFB800] hover:bg-[#e6a600] active:scale-[0.98] transition-all shadow-md disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Sealing Attestation...</span>
                ) : (
                  <>
                    <span>Confirm &amp; Submit</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
