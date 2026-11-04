"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
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
  ArrowLeft,
  Clock,
  Layers,
  Copy,
  Check,
} from "lucide-react";
import { formatCurrency, formatDate, truncateHash } from "@/lib/utils";
import confetti from "canvas-confetti";

export default function PassportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const passportId = (params?.id as string) || "pass-giftcard-75";

  // Tab state
  const [activeTab, setActiveTab] = useState<
    "authorization" | "settlement" | "agentTrail" | "receipt" | "disputeBundle"
  >("authorization");

  // Verification state & climax
  const [isScanning, setIsScanning] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  // Tab definitions
  const tabs = [
    { id: "authorization", label: "Authorization", icon: FileCheck },
    { id: "settlement", label: "Settlement", icon: CreditCard },
    { id: "agentTrail", label: "Agent Trail", icon: Bot },
    { id: "receipt", label: "Receipt", icon: ScrollText },
    { id: "disputeBundle", label: "Dispute Bundle", icon: AlertOctagon },
  ] as const;

  // The Climax: Laser scanline animation -> particle burst -> glowing VERIFIED badge
  const handleVerifySeal = () => {
    setIsScanning(true);
    setIsVerified(false);

    // Scan duration: 1.1s
    setTimeout(() => {
      setIsScanning(false);
      setIsVerified(true);

      // Check prefers-reduced-motion before firing particle burst
      const prefersReducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (!prefersReducedMotion) {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#60CDFF", "#002991", "#007A56", "#ffffff"],
        });
      }
    }, 1100);
  };

  const passportNumber = "PASS-2026-US";
  const readinessScore = 98;
  const rootHash = "sha256:92fe1516cccce243f341d4a8c20fb2d7e00e8b2b73bc5e2634458a2d1a3b34ff";
  const signature = "MEYCIQC8c3q9P...ecdsa_p256_sha256_sealed";

  const copyHashToClipboard = () => {
    navigator.clipboard.writeText(rootHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="space-y-8 w-full max-w-5xl mx-auto">
      {/* Editorial Top Navigation */}
      <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10">
        <Link
          href="/passports"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#002991] dark:text-[#60CDFF] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Trust Passports</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-bold text-[#6C7378] dark:text-white/50">
            ECDSA-P256-SHA256
          </span>
        </div>
      </div>

      {/* SIGNATURE COMPONENT: THE TRUST PASSPORT CREDENTIAL ARTIFACT */}
      <div className="relative rounded-[28px] bg-white/80 dark:bg-[#111114]/90 backdrop-blur-xl border border-black/10 dark:border-white/15 p-6 sm:p-10 shadow-2xl overflow-hidden space-y-8 border-t-white/80 dark:border-t-white/40 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/70 before:to-transparent">
        {/* Very Faint Dot-Matrix / Grid Background Pattern */}
        <div
          className="absolute inset-0 opacity-[0.04] dark:opacity-[0.07] bg-[radial-gradient(#60CDFF_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"
          aria-hidden="true"
        />

        {/* LASER SCANLINE ANIMATION SWEEPING VERTICALLY ACROSS THE CREDENTIAL */}
        {isScanning && (
          <motion.div
            initial={{ top: "0%" }}
            animate={{ top: "100%" }}
            transition={{ duration: 1.1, ease: "easeInOut" }}
            className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#60CDFF] to-transparent shadow-[0_0_24px_#60CDFF] pointer-events-none z-30"
          />
        )}

        {/* 1. CREDENTIAL HEADER: LARGE MONOSPACE PASS-2026-XXXX + SKY-BLUE READINESS GAUGE */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-black/10 dark:border-white/10 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#007A56] dark:bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#002991] dark:text-[#60CDFF]">
                Cryptographic Attestation Credential
              </span>
            </div>
            {/* Large PASS-2026-XXXX in monospace text */}
            <h1 className="font-mono font-black text-2xl sm:text-3xl text-black dark:text-white tracking-tight">
              {passportNumber}
            </h1>
            <p className="text-xs text-[#6C7378] dark:text-white/60 font-mono">
              Issued for Digital Gift Card Requisition · Captured via PayPal Orders v2
            </p>
          </div>

          {/* Sky-Blue Readiness Gauge (98 / 100) */}
          <div className="flex items-center gap-4 bg-black/[0.02] dark:bg-white/[0.03] p-3.5 rounded-2xl border border-black/5 dark:border-white/10 shrink-0">
            <div className="text-right">
              <div className="text-[10px] font-mono uppercase text-[#6C7378] dark:text-white/50 font-bold">
                Dispute Readiness Gauge
              </div>
              <div className="font-display font-black text-2xl text-[#002991] dark:text-[#60CDFF] tabular-nums">
                {readinessScore} / 100
              </div>
            </div>
            <div className="w-16 h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#60CDFF] rounded-full shadow-[0_0_12px_rgba(96,205,255,0.7)]"
                style={{ width: `${readinessScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* 2. TABS WITH FRAMER MOTION layoutId FOR SMOOTH SLIDING PILL */}
        <div className="relative flex items-center gap-2 p-1.5 rounded-full bg-black/[0.04] dark:bg-white/[0.05] border border-black/5 dark:border-white/10 overflow-x-auto relative z-10">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 py-2 rounded-full text-xs font-bold transition-colors whitespace-nowrap z-10 flex items-center gap-2 ${
                  isActive
                    ? "text-[#002991] dark:text-[#60CDFF]"
                    : "text-[#6C7378] dark:text-white/60 hover:text-black dark:hover:text-white"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="passportActiveTab"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    className="absolute inset-0 rounded-full bg-white dark:bg-[#1B1B1F] shadow-sm border border-black/5 dark:border-white/10 -z-10"
                  />
                )}
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 3. TAB CONTENT PANELS */}
        <div className="min-h-[260px] relative z-10">
          <AnimatePresence mode="wait">
            {/* TAB 1: AUTHORIZATION */}
            {activeTab === "authorization" && (
              <motion.div
                key="authorization"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="space-y-6 text-left"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10 space-y-1">
                    <span className="text-[10px] font-mono uppercase text-[#6C7378] dark:text-white/50 font-bold">
                      Governing Mandate
                    </span>
                    <div className="font-display font-bold text-sm text-black dark:text-white">
                      Client Appreciation Procurement
                    </div>
                    <div className="text-[11px] font-mono text-[#002991] dark:text-[#60CDFF]">
                      #mnd-client-gift-80
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10 space-y-1">
                    <span className="text-[10px] font-mono uppercase text-[#6C7378] dark:text-white/50 font-bold">
                      Pre-Authorized Budget Cap
                    </span>
                    <div className="font-mono font-black text-xl text-black dark:text-white tabular-nums">
                      $80.00 USD
                    </div>
                    <div className="text-[11px] text-[#007A56] dark:text-emerald-400 font-semibold font-mono">
                      Transaction Amount: $75.00 (Within Cap)
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10 space-y-1">
                    <span className="text-[10px] font-mono uppercase text-[#6C7378] dark:text-white/50 font-bold">
                      Allowed Category Scope
                    </span>
                    <div className="font-mono font-bold text-sm text-[#002991] dark:text-[#60CDFF]">
                      [ digital gift cards ]
                    </div>
                    <div className="text-[11px] text-[#6C7378] dark:text-white/50">
                      Scope verified prior to execution
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10 space-y-2">
                  <span className="text-[10px] font-mono uppercase text-[#6C7378] dark:text-white/50 font-bold block">
                    Human Authorization Attestation
                  </span>
                  <p className="text-xs text-[#1D1E20] dark:text-white/80 leading-relaxed font-mono">
                    Bounded by account owner under mandate token with 24-hour expiration window.
                    Refund permitted if goods fail delivery specification.
                  </p>
                </div>
              </motion.div>
            )}

            {/* TAB 2: SETTLEMENT */}
            {activeTab === "settlement" && (
              <motion.div
                key="settlement"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="space-y-6 text-left"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10 space-y-1 font-mono">
                    <span className="text-[10px] uppercase text-[#6C7378] dark:text-white/50 font-bold block font-sans">
                      PayPal Capture Identifier
                    </span>
                    <div className="font-bold text-base text-black dark:text-white">
                      CAPTURE-7TY90123L-SB
                    </div>
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#007A56]/15 text-[#007A56] dark:bg-[#007A56]/30 dark:text-emerald-400 border border-[#007A56]/30 font-sans">
                      PayPal Seller Protection: Eligible
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10 space-y-1 font-mono">
                    <span className="text-[10px] uppercase text-[#6C7378] dark:text-white/50 font-bold block font-sans">
                      Settled Volume
                    </span>
                    <div className="font-black text-xl text-black dark:text-white tabular-nums">
                      $75.00 USD
                    </div>
                    <div className="text-[11px] text-[#6C7378] dark:text-white/50 font-sans">
                      Captured via PayPal Sandbox Orders v2 API
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10 space-y-2">
                  <span className="text-[10px] font-mono uppercase text-[#6C7378] dark:text-white/50 font-bold block">
                    PayPal Settlement Integrity Hash
                  </span>
                  <div className="font-mono text-xs text-black dark:text-white/90 break-all bg-black/[0.03] dark:bg-white/[0.04] p-3 rounded-xl border border-black/5 dark:border-white/5">
                    sha256:92fe1516cccce243f341d4a8c20fb2d7e00e8b2b73bc5e2634458a2d1a3b34ff
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 3: AGENT TRAIL */}
            {activeTab === "agentTrail" && (
              <motion.div
                key="agentTrail"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="space-y-6 text-left"
              >
                <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10 space-y-2 font-mono">
                  <div className="flex items-center justify-between text-xs font-bold text-[#002991] dark:text-[#60CDFF]">
                    <span>Agent Model: gemini-1.5-pro</span>
                    <span className="text-[#6C7378] dark:text-white/40">Timestamp: 18:29:12 UTC</span>
                  </div>
                  <div className="text-xs text-[#1D1E20] dark:text-white/90 p-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/5 dark:border-white/5 leading-relaxed">
                    &ldquo;Select a high-quality coffee gift card for client appreciation under the mandate budget.&rdquo;
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10 space-y-2">
                  <span className="text-[10px] font-mono uppercase text-[#6C7378] dark:text-white/50 font-bold block">
                    Autonomous Reasoning Trail
                  </span>
                  <p className="text-xs text-[#1D1E20] dark:text-white/80 leading-relaxed font-mono">
                    Evaluation: Target Corp digital gift card valued at $75.00 fulfills the mandate objective
                    while respecting the $80.00 dollar boundary. Category &apos;digital gift cards&apos; matches
                    allowlist perfectly. Pre-spend policy gate passed.
                  </p>
                </div>
              </motion.div>
            )}

            {/* TAB 4: RECEIPT */}
            {activeTab === "receipt" && (
              <motion.div
                key="receipt"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="space-y-6 text-left font-mono"
              >
                <div className="p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10 space-y-3">
                  <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-3">
                    <span className="font-bold text-black dark:text-white text-sm">
                      Target Corporation Digital Voucher
                    </span>
                    <span className="font-bold text-black dark:text-white text-sm tabular-nums">
                      $75.00 USD
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-[#6C7378] dark:text-white/60">
                    <div>Payer Account:</div>
                    <div className="text-right text-black dark:text-white">agent-wallet@passport.internal</div>
                    <div>Recipient:</div>
                    <div className="text-right text-black dark:text-white">client-vip-delivery@external.com</div>
                    <div>Fulfillment:</div>
                    <div className="text-right text-[#007A56] dark:text-emerald-400 font-bold">DIGITAL_INSTANT</div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 5: DISPUTE BUNDLE */}
            {activeTab === "disputeBundle" && (
              <motion.div
                key="disputeBundle"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="space-y-4 text-left"
              >
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-display font-bold text-sm text-black dark:text-white">
                      Chargeback Defense Package Assembled
                    </div>
                    <div className="text-xs text-[#6C7378] dark:text-white/60 font-mono">
                      Includes mandate authorization, PayPal capture hash, agent prompt, and delivery confirmation.
                    </div>
                  </div>
                  <Link href="/disputes/disp-chargeback-demo">
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black text-black bg-[#FFB800] hover:bg-[#e6a600] active:scale-[0.98] transition-all">
                      <span>Open Autopsy</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 4. FOOTER: VERIFICATION CLIMAX (BUTTON & GLOWING BADGE) */}
        <div className="pt-6 border-t border-black/10 dark:border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 relative z-10">
          {/* Fingerprint / Hash copy */}
          <div className="flex items-center gap-3">
            <Fingerprint className="w-5 h-5 text-[#6C7378] dark:text-white/50 shrink-0" />
            <div className="font-mono text-xs truncate max-w-[280px] sm:max-w-[360px]">
              <span className="text-[#6C7378] dark:text-white/50">Root Fingerprint: </span>
              <span className="text-black dark:text-white font-bold">{rootHash.slice(0, 16)}...</span>
            </div>
            <button
              type="button"
              onClick={copyHashToClipboard}
              className="text-[#002991] dark:text-[#60CDFF] hover:underline p-1 text-xs"
              title="Copy Root Hash"
            >
              {copiedHash ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* CLIMAX CONTROLS: VERIFY ATTESTATION SEAL BUTTON & GLOWING BADGE */}
          <div className="flex items-center gap-3 justify-end">
            {/* Seal State Badge */}
            <span
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all duration-300 ${
                isVerified
                  ? "bg-[#007A56]/20 text-[#007A56] dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-500/40 shadow-[0_0_24px_rgba(16,185,129,0.4)]"
                  : "bg-black/5 dark:bg-white/10 text-[#6C7378] dark:text-white/60 border border-black/10 dark:border-white/10"
              }`}
            >
              <ShieldCheck
                className={`w-4 h-4 ${isVerified ? "text-[#007A56] dark:text-emerald-400 animate-bounce" : ""}`}
              />
              <span>{isVerified ? "VERIFIED (ECDSA SEAL INTACT)" : "SEAL UNVERIFIED"}</span>
            </span>

            {/* Verification Button */}
            <button
              type="button"
              onClick={handleVerifySeal}
              disabled={isScanning}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-black text-white bg-[#002991] hover:bg-[#001C64] dark:bg-[#60CDFF] dark:text-[#002991] dark:hover:bg-[#4bc3fa] active:scale-[0.98] transition-all shadow-md disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${isScanning ? "animate-spin" : ""}`} />
              <span>{isScanning ? "Scanning Seal..." : "Verify Attestation Seal"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
