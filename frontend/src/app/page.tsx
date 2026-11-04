"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { GlobalNavbar } from "@/components/layout/global-navbar";
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Shield,
  ExternalLink,
  Lock,
  FileCheck2,
  Bot,
  CreditCard,
  AlertOctagon,
  Sparkles,
  Zap,
} from "lucide-react";
import confetti from "canvas-confetti";

export default function LandingPage() {
  const [isVerified, setIsVerified] = useState(false);

  const handleVerifySeal = () => {
    setIsVerified(true);
    if (typeof window !== "undefined") {
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!prefersReducedMotion) {
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 },
          colors: ["#0070BA", "#60CDFF", "#007A56", "#0A2540"],
        });
      }
    }
  };

  const smoothSpring = {
    type: "spring" as const,
    stiffness: 80,
    damping: 20,
    mass: 1,
  };

  // Staggered animation variants for the 4 miniature mockup cards
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.14,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 35 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 120,
        damping: 18,
      },
    },
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#09090B] text-[#0A2540] dark:text-white font-sans antialiased w-full overflow-x-hidden selection:bg-[#60CDFF] selection:text-black">
      {/* 1. SHARED FLOATING GLASSMORPHIC NAVBAR (FIXED AT TOP, WHITE GLASSMORPHISM) */}
      <GlobalNavbar />

      {/* 2. HERO — STRIPE/PAYTM STYLE PURE WHITE (#FFFFFF) LIGHT THEME / NAVY DARK THEME */}
      <section className="relative bg-white dark:bg-[#001C64] transition-colors pt-28 sm:pt-36 pb-20 sm:pb-28">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left 55% Column: Deep Navy (#0A2540) Headline and Body Text */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={smoothSpring}
              className="lg:col-span-7 space-y-7 text-left"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase bg-[#0070BA]/10 text-[#0070BA] dark:bg-white/10 dark:text-[#60CDFF] border border-[#0070BA]/20 dark:border-white/15">
                <span className="w-2 h-2 rounded-full bg-[#0070BA] dark:bg-[#60CDFF] animate-pulse" />
                <span>Deterministic Pre-Spend Protocol</span>
              </div>

              <h1 className="font-display font-black text-[42px] sm:text-[52px] lg:text-[60px] text-[#0A2540] dark:text-white leading-[1.08] tracking-[-0.03em]">
                AI agents can spend money.
                <br />
                Passport makes every purchase accountable.
              </h1>

              <p className="text-[19px] sm:text-[20px] text-[#425466] dark:text-white/85 leading-relaxed max-w-[50ch] font-normal">
                The pre-spend policy gate, cryptographic attestation chain, and automated dispute defense
                layer for autonomous commerce.
              </p>

              {/* Two Full-Pill CTAs: Vibrant Blue #0070BA Primary & Deep Navy #0A2540 Outline */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-1">
                <Link href="/demo">
                  <span className="inline-flex items-center justify-center px-8 py-3.5 rounded-full text-base font-black text-white bg-[#0070BA] hover:bg-[#005a96] dark:bg-[#60CDFF] dark:text-[#002991] dark:hover:bg-[#4bc3fa] transition-all active:scale-[0.98] shadow-md w-full sm:w-auto text-center">
                    Launch interactive demo
                  </span>
                </Link>

                <Link href="/disputes/disp-chargeback-demo">
                  <span className="inline-flex items-center justify-center px-8 py-3.5 rounded-full text-base font-bold text-[#0A2540] dark:text-white bg-transparent border-2 border-[#0A2540] dark:border-white hover:bg-[#0A2540]/5 dark:hover:bg-white/10 transition-all active:scale-[0.98] w-full sm:w-auto text-center">
                    View dispute defense
                  </span>
                </Link>
              </div>
            </motion.div>

            {/* Right 45% Column: Live Trust Artifact with Snappy Bouncy Hover & Interactive Confetti Button */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ ...smoothSpring, delay: 0.15 }}
              className="lg:col-span-5"
            >
              {/* Bouncy Hover Effect: whileHover={{ scale: 1.02, y: -5 }} with snappy spring */}
              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="bg-white dark:bg-[#111114] text-[#0A2540] dark:text-white rounded-[24px] p-6 sm:p-8 shadow-[0_24px_48px_rgba(10,37,64,0.08)] dark:shadow-[0_24px_48px_rgba(0,0,0,0.4)] border border-black/[0.08] dark:border-white/15 relative overflow-hidden space-y-6 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-black/10 dark:before:via-white/30 before:to-transparent cursor-pointer"
              >
                {/* Artifact Header Strip */}
                <div className="flex items-center justify-between pb-4 border-b border-black/[0.08] dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#007A56] animate-pulse" />
                    <span className="font-display font-black text-sm tracking-tight text-[#0070BA] dark:text-[#60CDFF]">
                      {isVerified ? "Attestation Sealed & Verified" : "Trust Passport Active"}
                    </span>
                  </div>
                  <span className="rounded-full px-3.5 py-1 text-xs font-mono font-bold bg-[#60CDFF]/15 text-[#0070BA] dark:bg-[#60CDFF]/20 dark:text-[#60CDFF] border border-[#60CDFF]/30">
                    PASS-2026-US
                  </span>
                </div>

                {/* 1. Mandate Cap */}
                <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-white/[0.04] space-y-1 border border-black/[0.04] dark:border-white/[0.05]">
                  <div className="text-xs font-mono font-bold text-[#6C7378] dark:text-white/60 uppercase tracking-wider">
                    Authorized Spend Cap
                  </div>
                  <div className="flex items-baseline justify-between">
                    <div className="font-display font-black text-2xl text-[#0A2540] dark:text-white tabular-nums">
                      $80.00 USD
                    </div>
                    <span className="rounded-full px-2.5 py-0.5 text-[11px] font-mono font-bold bg-[#007A56]/15 text-[#007A56] dark:bg-[#007A56]/30 dark:text-emerald-400">
                      Within Limit ($75.00)
                    </span>
                  </div>
                  <div className="text-xs text-[#425466] dark:text-white/60">
                    Category: digital gift cards · 24h validity
                  </div>
                </div>

                {/* 2. PayPal Settlement Hash */}
                <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-white/[0.04] space-y-1 font-mono text-xs border border-black/[0.04] dark:border-white/[0.05]">
                  <div className="text-[11px] font-bold text-[#6C7378] dark:text-white/60 font-sans uppercase tracking-wider">
                    PayPal Settlement Attestation
                  </div>
                  <div className="font-bold text-[#0A2540] dark:text-white flex items-center justify-between">
                    <span>CAPTURE-7TY90123L-SB</span>
                    <span className="text-[#007A56] dark:text-emerald-400 font-sans text-[11px]">
                      Seller Protection
                    </span>
                  </div>
                  <div className="text-[11px] text-[#6C7378] dark:text-white/50 truncate tabular-nums">
                    sha256:92fe1516cccce243f341d4a8c20fb2d7e0...
                  </div>
                </div>

                {/* 3. Readiness Gauge */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-[#425466] dark:text-white/70">Dispute Readiness Index</span>
                    <span className="text-[#007A56] dark:text-emerald-400 font-display font-black tabular-nums">
                      {isVerified ? "100 / 100" : "98 / 100"}
                    </span>
                  </div>
                  <div className="w-full bg-black/[0.08] dark:bg-white/10 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-[#007A56] h-full rounded-full transition-all duration-500"
                      style={{ width: isVerified ? "100%" : "98%" }}
                    />
                  </div>
                </div>

                {/* Interactive Verification Seal Button with Confetti Explosion */}
                <button
                  type="button"
                  onClick={handleVerifySeal}
                  className={`w-full py-3.5 px-5 rounded-full font-bold text-xs transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm ${
                    isVerified
                      ? "bg-[#007A56] text-white hover:bg-[#006849]"
                      : "bg-[#0070BA] text-white hover:bg-[#005a96] dark:bg-[#60CDFF] dark:text-[#002991] dark:hover:bg-[#4bc3fa]"
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isVerified ? "VERIFIED (ECDSA SEAL INTACT)" : "Verify Attestation Seal"}</span>
                </button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. THE PROBLEM — LARGE EDITORIAL PULL QUOTE */}
      <section id="problem" className="py-24 md:py-32 bg-white dark:bg-[#09090B] transition-colors border-t border-black/[0.08] dark:border-white/10">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 space-y-10 text-left">
          {/* Eyebrow */}
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#6C7378] dark:text-white/60">
              The problem
            </span>
          </div>

          {/* Large Editorial Pull Quote in Deep Navy #0A2540 */}
          <motion.blockquote
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={smoothSpring}
            className="text-[26px] sm:text-[34px] lg:text-[38px] font-semibold text-[#0A2540] dark:text-white leading-[1.25] tracking-tight border-l-4 border-[#0070BA] pl-6 sm:pl-8"
          >
            &ldquo;Traditional payment rails settle dollars, not prompts. When an autonomous AI agent executes an unintended API transaction, issuing banks see an unauthorized charge — and merchants have zero cryptographic evidence to defend it.&rdquo;
          </motion.blockquote>

          {/* Supporting Editorial Paragraph in Stripe Slate-Navy #425466 */}
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ...smoothSpring, delay: 0.15 }}
            className="text-[19px] sm:text-[20px] text-[#425466] dark:text-white/80 leading-[1.65] max-w-[62ch] font-normal"
          >
            Autonomous agents execute procurement, cloud compute provisioning, and software licensing through headless API calls. Traditional payment networks record settlements, not prompts, parameters, or human authorization bounds. When an unintended transaction occurs, the merchant faces total chargeback liability with zero admissible evidence.
          </motion.p>
        </div>
      </section>

      {/* 4. HOW IT WORKS (ANIMATED) — HORIZONTAL ROW OF 4 GLASSMORPHIC CARDS WITH MINI UI MOCKUPS */}
      <section
        id="how-it-works"
        className="py-24 md:py-32 bg-[#F8FAFC] dark:bg-[#0E0F14] text-[#0A2540] dark:text-white transition-colors border-t border-black/[0.08] dark:border-white/10"
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 space-y-16">
          {/* Eyebrow & Section Heading */}
          <div className="space-y-3 text-left">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0070BA] dark:bg-[#60CDFF]" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#0070BA] dark:text-[#60CDFF]">
                How it works
              </span>
            </div>
            <h2 className="font-display font-black text-3xl sm:text-5xl text-[#0A2540] dark:text-white tracking-[-0.02em]">
              The Four-Step Accountability Pipeline
            </h2>
            <p className="text-base text-[#425466] dark:text-white/60 max-w-[65ch]">
              Deterministic policy verification and cryptographic evidence sealing at every milestone of agent spend.
            </p>
          </div>

          {/* Horizontal row of 4 glassmorphic cards with miniature UI mockups sliding up with a stagger */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {/* CARD 01: MANDATE MOCKUP */}
            <motion.div
              variants={cardVariants}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="rounded-2xl bg-white/90 dark:bg-[#15161C]/90 backdrop-blur-md border border-black/[0.08] dark:border-white/10 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-5 text-left"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-display font-black text-2xl text-[#0070BA] dark:text-[#60CDFF] tabular-nums">01</span>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-[#007A56] dark:text-emerald-400 font-bold border border-emerald-500/20">
                    ACTIVE
                  </span>
                </div>
                <h3 className="font-display font-bold text-lg text-[#0A2540] dark:text-white">
                  Spend Mandate
                </h3>
                <p className="text-xs text-[#425466] dark:text-white/60 leading-relaxed">
                  Account owner bounds hard dollar caps and approved vendor scopes before execution.
                </p>
              </div>

              {/* Miniature UI Mockup: Mandate Envelope */}
              <div className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] space-y-2 font-mono text-[11px]">
                <div className="flex justify-between items-center text-[10px] text-[#6C7378] dark:text-white/50 border-b border-black/[0.06] dark:border-white/[0.08] pb-1.5">
                  <span>#mnd-client-gift-80</span>
                  <span className="text-[#0070BA] dark:text-[#60CDFF]">ECDSA Signed</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#6C7378] dark:text-white/60">Max Budget:</span>
                  <strong className="text-[#0A2540] dark:text-white tabular-nums">$80.00 USD</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#6C7378] dark:text-white/60">Allowlist:</span>
                  <span className="text-[#007A56] dark:text-emerald-400 font-bold">digital gift cards</span>
                </div>
              </div>
            </motion.div>

            {/* CARD 02: POLICY CHECK MOCKUP */}
            <motion.div
              variants={cardVariants}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="rounded-2xl bg-white/90 dark:bg-[#15161C]/90 backdrop-blur-md border border-black/[0.08] dark:border-white/10 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-5 text-left"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-display font-black text-2xl text-[#0070BA] dark:text-[#60CDFF] tabular-nums">02</span>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#0070BA]/10 text-[#0070BA] dark:text-[#60CDFF] font-bold border border-[#0070BA]/20">
                    GATE VERIFIED
                  </span>
                </div>
                <h3 className="font-display font-bold text-lg text-[#0A2540] dark:text-white">
                  Deterministic Policy Check
                </h3>
                <p className="text-xs text-[#425466] dark:text-white/60 leading-relaxed">
                  Pre-spend policy sentinel evaluates agent intent and blocks rogue requests in real time.
                </p>
              </div>

              {/* Miniature UI Mockup: Policy Engine Cockpit */}
              <div className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] space-y-2 font-mono text-[11px]">
                <div className="flex justify-between items-center text-[10px] text-[#6C7378] dark:text-white/50 border-b border-black/[0.06] dark:border-white/[0.08] pb-1.5">
                  <span className="truncate max-w-[140px]">&ldquo;Procure $75 card&rdquo;</span>
                  <span className="text-emerald-600 dark:text-emerald-400">Headroom OK</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#6C7378] dark:text-white/60">Requested:</span>
                  <strong className="text-[#0A2540] dark:text-white tabular-nums">$75.00 &le; $80.00</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#6C7378] dark:text-white/60">Policy Gate:</span>
                  <span className="text-[#007A56] dark:text-emerald-400 font-bold">[ PASSED PRE-CHECKOUT ]</span>
                </div>
              </div>
            </motion.div>

            {/* CARD 03: PAYPAL SETTLEMENT MOCKUP */}
            <motion.div
              variants={cardVariants}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="rounded-2xl bg-white/90 dark:bg-[#15161C]/90 backdrop-blur-md border border-black/[0.08] dark:border-white/10 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-5 text-left"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-display font-black text-2xl text-[#0070BA] dark:text-[#60CDFF] tabular-nums">03</span>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#0070BA]/10 text-[#0070BA] dark:text-[#60CDFF] font-bold border border-[#0070BA]/20">
                    ORDERS V2
                  </span>
                </div>
                <h3 className="font-display font-bold text-lg text-[#0A2540] dark:text-white">
                  PayPal Settlement
                </h3>
                <p className="text-xs text-[#425466] dark:text-white/60 leading-relaxed">
                  Direct capture binds order execution to PayPal Seller Protection claims shield.
                </p>
              </div>

              {/* Miniature UI Mockup: PayPal Order Receipt */}
              <div className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] space-y-2 font-mono text-[11px]">
                <div className="flex justify-between items-center text-[10px] text-[#6C7378] dark:text-white/50 border-b border-black/[0.06] dark:border-white/[0.08] pb-1.5">
                  <span>CAPTURE-7TY90123L</span>
                  <span className="text-[#007A56] dark:text-emerald-400 font-bold">CAPTURED</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#6C7378] dark:text-white/60">Amount:</span>
                  <strong className="text-[#0A2540] dark:text-white tabular-nums">$75.00 USD</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#6C7378] dark:text-white/60">Coverage:</span>
                  <span className="text-[#0070BA] dark:text-[#60CDFF] font-bold">Seller Protection</span>
                </div>
              </div>
            </motion.div>

            {/* CARD 04: DISPUTE AUTOPSY MOCKUP */}
            <motion.div
              variants={cardVariants}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="rounded-2xl bg-white/90 dark:bg-[#15161C]/90 backdrop-blur-md border border-black/[0.08] dark:border-white/10 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-5 text-left"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-display font-black text-2xl text-[#0070BA] dark:text-[#60CDFF] tabular-nums">04</span>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-[#007A56] dark:text-emerald-400 font-bold border border-emerald-500/20">
                    SEALED
                  </span>
                </div>
                <h3 className="font-display font-bold text-lg text-[#0A2540] dark:text-white">
                  Dispute Autopsy
                </h3>
                <p className="text-xs text-[#425466] dark:text-white/60 leading-relaxed">
                  Cryptographic attestation and pre-assembled evidence dossier defend against claims.
                </p>
              </div>

              {/* Miniature UI Mockup: Dispute Defense Dossier */}
              <div className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] space-y-2 font-mono text-[11px]">
                <div className="flex justify-between items-center text-[10px] text-[#6C7378] dark:text-white/50 border-b border-black/[0.06] dark:border-white/[0.08] pb-1.5">
                  <span>Case PP-D-849201</span>
                  <span className="text-[#007A56] dark:text-emerald-400">98/100 Ready</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#6C7378] dark:text-white/60">Evidence:</span>
                  <strong className="text-[#0A2540] dark:text-white">5-Segment Chain</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#6C7378] dark:text-white/60">Defense:</span>
                  <span className="text-[#0070BA] dark:text-[#60CDFF] font-bold">Human Co-Signed</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 5. DISPUTE DEFENSE PREVIEW — SPLIT SECTION WITH STYLIZED "CASE FILE" */}
      <section
        id="dispute-defense"
        className="py-24 md:py-32 bg-white dark:bg-[#09090B] transition-colors border-t border-black/[0.08] dark:border-white/10"
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 space-y-12">
          {/* Eyebrow */}
          <div className="flex items-center gap-2 text-left">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Dispute defense forensic capability
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start text-left">
            {/* Left: Deep Navy Headline (#0A2540) and Explanation */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={smoothSpring}
              className="lg:col-span-5 space-y-6"
            >
              <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-[46px] text-[#0A2540] dark:text-white leading-[1.1] tracking-[-0.02em]">
                When the purchase is challenged, the Passport becomes the defense.
              </h2>
              <p className="text-[17px] text-[#425466] dark:text-white/70 leading-relaxed font-normal">
                When a cardholder files an unauthorized claim, Passport automatically reconstructs the
                entire authorization chain into a PayPal compelling evidence dossier within seconds.
                Missing proofs are immediately isolated in amber so operators can review and co-sign.
              </p>
              <div className="pt-2">
                <Link href="/disputes/disp-chargeback-demo">
                  <span className="inline-flex items-center gap-2 rounded-full border-2 border-[#0A2540] dark:border-white px-8 py-3.5 text-sm sm:text-base font-bold text-[#0A2540] dark:text-white hover:bg-[#0A2540]/5 dark:hover:bg-white/10 transition-all active:scale-[0.98]">
                    <span>Open the dispute defense case room</span>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </Link>
              </div>
            </motion.div>

            {/* Right: Stylized "Case File" with Amber Missing Proof Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ ...smoothSpring, delay: 0.15 }}
              className="lg:col-span-7"
            >
              <div className="rounded-[24px] bg-[#F8FAFC] dark:bg-[#111114] border border-black/[0.08] dark:border-white/15 p-6 sm:p-8 shadow-[0_16px_36px_rgba(10,37,64,0.06)] dark:shadow-[0_16px_36px_rgba(0,0,0,0.4)] space-y-6 relative overflow-hidden">
                {/* Case File Header Strip */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/[0.08] dark:border-white/10 pb-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                      Forensic Dossier · Pre-Assembled
                    </span>
                    <div className="font-mono font-bold text-base text-[#0A2540] dark:text-white">
                      CASE FILE #PP-D-849201
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#0A2540] dark:text-white bg-black/[0.05] dark:bg-white/10 px-3 py-1 rounded-full border border-black/[0.06] dark:border-white/10">
                      Disputed: $75.00 USD
                    </span>
                    <span className="font-mono text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-500/15 px-2.5 py-1 rounded-full border border-amber-500/30">
                      ACTION REQUIRED
                    </span>
                  </div>
                </div>

                {/* Evidence Reconciliation Strip: 5 Items (3 Verified + 2 Missing Proofs in Amber) */}
                <div className="divide-y divide-black/[0.06] dark:divide-white/10 font-mono text-xs">
                  {/* Item 01: Verified */}
                  <div className="py-3 flex items-center justify-between gap-3">
                    <div className="text-[#0A2540] dark:text-white font-sans text-xs sm:text-sm font-medium">
                      01 · Human spend mandate &amp; policy authority
                    </div>
                    <span className="text-[#007A56] dark:text-emerald-400 font-bold text-xs tracking-wide shrink-0 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      VERIFIED
                    </span>
                  </div>

                  {/* Item 02: Verified */}
                  <div className="py-3 flex items-center justify-between gap-3">
                    <div className="text-[#0A2540] dark:text-white font-sans text-xs sm:text-sm font-medium">
                      02 · Agent reasoning trace &amp; intent token
                    </div>
                    <span className="text-[#007A56] dark:text-emerald-400 font-bold text-xs tracking-wide shrink-0 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      VERIFIED
                    </span>
                  </div>

                  {/* Item 03: Verified */}
                  <div className="py-3 flex items-center justify-between gap-3">
                    <div className="text-[#0A2540] dark:text-white font-sans text-xs sm:text-sm font-medium">
                      03 · PayPal capture receipt &amp; Seller Protection
                    </div>
                    <span className="text-[#007A56] dark:text-emerald-400 font-bold text-xs tracking-wide shrink-0 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      VERIFIED
                    </span>
                  </div>

                  {/* Item 04: Missing Proof Highlighted in Amber */}
                  <div className="py-3 px-3 -mx-3 rounded-lg bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 flex items-center justify-between gap-3 my-1">
                    <div className="text-[#0A2540] dark:text-white font-sans text-xs sm:text-sm font-medium">
                      04 · Recipient digital voucher acknowledgment
                    </div>
                    <span className="text-amber-800 dark:text-amber-300 font-bold text-xs tracking-wide shrink-0 flex items-center gap-1.5 bg-amber-500/20 px-2 py-0.5 rounded">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      MISSING PROOF
                    </span>
                  </div>

                  {/* Item 05: Missing Proof Highlighted in Amber */}
                  <div className="py-3 px-3 -mx-3 rounded-lg bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 flex items-center justify-between gap-3 my-1">
                    <div className="text-[#0A2540] dark:text-white font-sans text-xs sm:text-sm font-medium">
                      05 · Electronic delivery SMTP confirmation
                    </div>
                    <span className="text-amber-800 dark:text-amber-300 font-bold text-xs tracking-wide shrink-0 flex items-center gap-1.5 bg-amber-500/20 px-2 py-0.5 rounded">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      MISSING PROOF
                    </span>
                  </div>
                </div>

                {/* Case File Footer Note */}
                <div className="pt-3 border-t border-black/[0.08] dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-mono">
                  <span className="text-[#425466] dark:text-white/50">
                    Sealed Digest: <strong className="text-[#0070BA] dark:text-[#60CDFF]">0x8b1a4f92...39bc41d2</strong>
                  </span>
                  <span className="text-[#007A56] dark:text-emerald-400 font-semibold">
                    [ 3 of 5 Pre-Reconciled ]
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 6. FOOTER — DEEP NAVY #0A2540 */}
      <footer className="bg-[#0A2540] dark:bg-[#001449] text-white py-12 border-t border-white/10 transition-colors">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="font-display font-bold text-sm tracking-tight text-white">
            Passport — Trust &amp; Dispute Infrastructure
          </div>

          <div className="flex items-center gap-8 text-xs font-semibold text-white/80">
            <Link href="/demo" className="hover:text-white transition-colors">
              Demo
            </Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link href="/mandates" className="hover:text-white transition-colors">
              Mandates
            </Link>
            <Link href="/disputes" className="hover:text-white transition-colors">
              Disputes
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
