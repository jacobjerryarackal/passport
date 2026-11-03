"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Shield,
  ExternalLink,
  Lock,
} from "lucide-react";

export default function LandingPage() {
  const [isVerified, setIsVerified] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0C0F] text-[#1D1E20] dark:text-white font-sans antialiased w-full overflow-x-hidden selection:bg-[#60CDFF] selection:text-black">
      {/* 0. NAVIGATION BAR */}
      <header className="sticky top-0 z-50 w-full bg-[#60CDFF] dark:bg-[#001C64] border-b border-black/10 dark:border-white/10 transition-colors">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 h-18 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-full bg-black dark:bg-white flex items-center justify-center text-white dark:text-[#002991] font-display font-black text-lg shadow-sm">
              P
            </div>
            <span className="font-display font-black text-xl tracking-tight text-black dark:text-white">
              Passport
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-black/80 dark:text-white/80">
            <a href="#problem" className="hover:text-black dark:hover:text-white transition-colors">
              The problem
            </a>
            <a href="#how-it-works" className="hover:text-black dark:hover:text-white transition-colors">
              How it works
            </a>
            <a href="#dispute-defense" className="hover:text-black dark:hover:text-white transition-colors">
              Dispute defense
            </a>
          </nav>

          {/* Controls: Theme Toggle & Full-Pill CTA */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            <Link href="/demo">
              <span className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold text-white bg-black dark:bg-white dark:text-[#002991] hover:bg-black/85 dark:hover:bg-white/90 transition-all active:scale-[0.98] shadow-sm">
                Launch demo
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* 1. HERO — SKY BLUE IMMERSIVE BAND (#60CDFF) FULL-BLEED */}
      <section className="relative bg-[#60CDFF] dark:bg-[#001C64] transition-colors py-16 md:py-24 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left 55% Column: Heavy Black Display Headline + Subhead + Two Pill CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="lg:col-span-7 space-y-8 text-left"
            >
              {/* Headline in 2 lines, 88-96px on large screens, weight 900, tracking -0.03em */}
              <h1 className="font-display font-black text-4xl sm:text-6xl md:text-7xl lg:text-[88px] text-black dark:text-white leading-[1.02] tracking-[-0.03em]">
                AI agents can spend money.
                <br />
                Passport makes every purchase accountable.
              </h1>

              {/* Subhead 20px, max 58ch */}
              <p className="text-lg sm:text-[20px] text-black/85 dark:text-white/85 leading-relaxed max-w-[58ch] font-normal">
                The pre-spend policy gate, cryptographic attestation chain, and automated dispute defense
                layer for autonomous commerce.
              </p>

              {/* Two Pill CTAs (No badge above headline) */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <Link href="/demo">
                  <span className="inline-flex items-center justify-center px-8 py-4 rounded-full text-base sm:text-[18px] font-black text-white bg-black dark:bg-white dark:text-[#002991] hover:bg-black/85 dark:hover:bg-white/90 transition-transform active:scale-[0.98] shadow-md w-full sm:w-auto text-center">
                    Launch interactive demo
                  </span>
                </Link>

                <Link href="/disputes/disp-chargeback-demo">
                  <span className="inline-flex items-center justify-center px-8 py-4 rounded-full text-base sm:text-[18px] font-black text-black dark:text-white bg-transparent border-2 border-black dark:border-white hover:bg-black/10 dark:hover:bg-white/10 transition-transform active:scale-[0.98] w-full sm:w-auto text-center">
                    View dispute defense
                  </span>
                </Link>
              </div>
            </motion.div>

            {/* Right 45% Column: Flat Live Trust Artifact inside the Blue Band */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 320, damping: 32, delay: 0.1 }}
              className="lg:col-span-5"
            >
              {/* Subtle continuous 6s vertical float (no tilt, no 3D, shadow under 0.08) */}
              <motion.div
                animate={{ y: [-4, 4, -4] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="bg-white dark:bg-[#1B1B1F] text-[#1D1E20] dark:text-white rounded-[24px] p-6 sm:p-8 shadow-[0_24px_48px_rgba(0,0,0,0.08)] border border-black/5 dark:border-white/10 space-y-6"
              >
                {/* Artifact Header Strip with 25px Pills */}
                <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#007A56] animate-pulse" />
                    <span className="font-display font-black text-sm tracking-tight text-[#002991] dark:text-[#60CDFF]">
                      Trust Passport Verified
                    </span>
                  </div>
                  <span className="rounded-[25px] px-3.5 py-1 text-xs font-bold bg-[#60CDFF]/25 text-[#002991] dark:bg-[#60CDFF]/20 dark:text-[#60CDFF]">
                    PASS-2026-US
                  </span>
                </div>

                {/* 1. Mandate Cap */}
                <div className="p-4 rounded-[20px] bg-black/[0.03] dark:bg-white/[0.05] space-y-1">
                  <div className="text-xs font-bold text-[#6C7378] dark:text-white/60 uppercase tracking-wider">
                    Authorized Spend Cap
                  </div>
                  <div className="flex items-baseline justify-between">
                    <div className="font-display font-black text-2xl text-black dark:text-white tabular-nums">
                      $80.00 USD
                    </div>
                    <span className="rounded-[25px] px-2.5 py-0.5 text-[11px] font-bold bg-[#007A56]/15 text-[#007A56] dark:bg-[#007A56]/30 dark:text-emerald-400">
                      Within Limit ($75.00)
                    </span>
                  </div>
                  <div className="text-xs text-[#6C7378] dark:text-white/60">
                    Category: digital gift cards · 24h validity
                  </div>
                </div>

                {/* 2. PayPal Settlement Hash */}
                <div className="p-4 rounded-[20px] bg-black/[0.03] dark:bg-white/[0.05] space-y-1 font-mono text-xs">
                  <div className="text-[11px] font-bold text-[#6C7378] dark:text-white/60 font-sans uppercase tracking-wider">
                    PayPal Settlement Attestation
                  </div>
                  <div className="font-bold text-black dark:text-white flex items-center justify-between">
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
                    <span className="text-[#6C7378] dark:text-white/70">Dispute Readiness Index</span>
                    <span className="text-[#007A56] dark:text-emerald-400 font-display font-black tabular-nums">
                      98 / 100
                    </span>
                  </div>
                  <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-[#007A56] h-full w-[98%] rounded-full" />
                  </div>
                </div>

                {/* Interactive Verification Button (Pill, no particle burst) */}
                <button
                  type="button"
                  onClick={() => setIsVerified(!isVerified)}
                  className="w-full py-3 px-5 rounded-[25px] bg-[#002991] text-white font-bold text-xs hover:bg-[#001C64] dark:bg-[#60CDFF] dark:text-[#002991] dark:hover:bg-[#4bc3fa] transition-colors flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isVerified ? "Cryptographic Seal Re-verified" : "Verify Attestation Seal"}</span>
                </button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. WHITE SECTION — “THE PROBLEM” IN ONE EDITORIAL COLUMN */}
      <section id="problem" className="py-24 md:py-32 bg-white dark:bg-[#0B0C0F] transition-colors">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 space-y-8 text-left">
          {/* Eyebrow */}
          <div className="text-xs font-bold uppercase tracking-wider text-[#6C7378] dark:text-white/60">
            The problem
          </div>

          {/* Single strong paragraph in 20px charcoal, max 62ch */}
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="text-[20px] text-[#1D1E20] dark:text-white/90 leading-[1.6] max-w-[62ch] font-normal"
          >
            Autonomous agents execute procurement, cloud infrastructure provisioning, and software
            licensing through headless API calls. Traditional payment networks record settlements, not
            prompts, parameters, or human authorization bounds. When an unintended transaction occurs, the
            merchant faces total chargeback liability with zero admissible evidence.
          </motion.p>

          {/* Pull quote in 28px weight 600 navy (no cards) */}
          <motion.blockquote
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 320, damping: 32, delay: 0.08 }}
            className="text-[24px] sm:text-[28px] font-semibold text-[#002991] dark:text-[#60CDFF] leading-[1.3] pt-4 border-l-4 border-[#002991] dark:border-[#60CDFF] pl-6"
          >
            &ldquo;Gateways settle dollars. They cannot prove to an issuing bank that an authorized human
            bounded the agent’s spend.&rdquo;
          </motion.blockquote>
        </div>
      </section>

      {/* 3. NAVY IMMERSIVE SECTION (#002991) — “HOW IT WORKS” PIPELINE */}
      <section
        id="how-it-works"
        className="py-24 md:py-32 bg-[#002991] dark:bg-[#001C64] text-white transition-colors"
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 space-y-14">
          {/* Eyebrow & Section Heading */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-[#60CDFF]">
              How it works
            </div>
            <h2 className="font-display font-black text-3xl sm:text-5xl text-white tracking-[-0.02em]">
              The Four-Step Accountability Pipeline
            </h2>
          </div>

          {/* Four steps in a horizontal ledger with vertical white hairlines */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.08,
                },
              },
            }}
            className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/20 pt-4"
          >
            {/* Step 01 */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 24 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { type: "spring", stiffness: 320, damping: 32 },
                },
              }}
              className="py-6 md:py-0 md:pr-8 first:md:pl-0 space-y-4"
            >
              <div className="font-display font-black text-3xl text-[#60CDFF] tabular-nums">01</div>
              <div className="space-y-1.5">
                <div className="font-display font-bold text-xl text-white">Human Spend Mandate</div>
                <p className="text-sm text-[#B8E9FF] leading-relaxed">
                  Account owner bounds hard dollar cap, category allowlist, and expiration before execution.
                </p>
              </div>
              <div className="font-mono text-xs text-white/60 tabular-nums">18:29:00 UTC</div>
            </motion.div>

            {/* Step 02 */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 24 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { type: "spring", stiffness: 320, damping: 32 },
                },
              }}
              className="py-6 md:py-0 md:px-8 space-y-4"
            >
              <div className="font-display font-black text-3xl text-[#60CDFF] tabular-nums">02</div>
              <div className="space-y-1.5">
                <div className="font-display font-bold text-xl text-white">Deterministic Policy Gate</div>
                <p className="text-sm text-[#B8E9FF] leading-relaxed">
                  Pre-spend policy engine evaluates and blocks out-of-bounds agent calls pre-settlement.
                </p>
              </div>
              <div className="font-mono text-xs text-white/60 tabular-nums">18:29:12 UTC</div>
            </motion.div>

            {/* Step 03 */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 24 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { type: "spring", stiffness: 320, damping: 32 },
                },
              }}
              className="py-6 md:py-0 md:px-8 space-y-4"
            >
              <div className="font-display font-black text-3xl text-[#60CDFF] tabular-nums">03</div>
              <div className="space-y-1.5">
                <div className="font-display font-bold text-xl text-white">PayPal Settlement</div>
                <p className="text-sm text-[#B8E9FF] leading-relaxed">
                  Orders v2 capture creates binding settlement with confirmed Seller Protection eligibility.
                </p>
              </div>
              <div className="font-mono text-xs text-white/60 tabular-nums">18:29:45 UTC</div>
            </motion.div>

            {/* Step 04 */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 24 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { type: "spring", stiffness: 320, damping: 32 },
                },
              }}
              className="py-6 md:py-0 md:pl-8 space-y-4"
            >
              <div className="font-display font-black text-3xl text-[#60CDFF] tabular-nums">04</div>
              <div className="space-y-1.5">
                <div className="font-display font-bold text-xl text-white">Cryptographic Trust Passport</div>
                <p className="text-sm text-[#B8E9FF] leading-relaxed">
                  Attestation binds mandate, intent trace, and settlement into an immutable receipt.
                </p>
              </div>
              <div className="font-mono text-xs text-white/60 tabular-nums">18:30:00 UTC</div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 4. WHITE SECTION — “DISPUTE DEFENSE” SPLIT LAYOUT */}
      <section
        id="dispute-defense"
        className="py-24 md:py-32 bg-white dark:bg-[#0B0C0F] transition-colors"
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 space-y-12">
          {/* Eyebrow */}
          <div className="text-xs font-bold uppercase tracking-wider text-[#6C7378] dark:text-white/60">
            Dispute defense
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Left: Headline in 48px weight 900 navy */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="lg:col-span-5 space-y-5"
            >
              <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-[48px] text-[#002991] dark:text-white leading-[1.08] tracking-[-0.02em]">
                When the purchase is challenged, the Passport becomes the defense.
              </h2>
              <p className="text-lg text-[#6C7378] dark:text-white/70 leading-relaxed font-normal">
                When a cardholder files an unauthorized claim, Passport automatically reconstructs the
                authorization chain into a PayPal compelling evidence dossier within seconds.
              </p>
            </motion.div>

            {/* Right: Evidence Reconciliation Strip with 5 Segments */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 320, damping: 32, delay: 0.08 }}
              className="lg:col-span-7 space-y-6"
            >
              {/* Segments Stack */}
              <div className="divide-y divide-black/10 dark:divide-white/10 border-y border-black/10 dark:border-white/10 font-mono text-xs">
                {/* Segment 1: Verified */}
                <div className="py-3.5 flex items-center justify-between gap-2">
                  <div className="text-[#1D1E20] dark:text-white font-sans text-sm font-medium">
                    01 · Human spend mandate &amp; policy authority
                  </div>
                  <span className="text-[#007A56] dark:text-emerald-400 font-bold text-xs tracking-wide shrink-0 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    VERIFIED
                  </span>
                </div>

                {/* Segment 2: Verified */}
                <div className="py-3.5 flex items-center justify-between gap-2">
                  <div className="text-[#1D1E20] dark:text-white font-sans text-sm font-medium">
                    02 · Agent reasoning trace &amp; intent token
                  </div>
                  <span className="text-[#007A56] dark:text-emerald-400 font-bold text-xs tracking-wide shrink-0 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    VERIFIED
                  </span>
                </div>

                {/* Segment 3: Verified */}
                <div className="py-3.5 flex items-center justify-between gap-2">
                  <div className="text-[#1D1E20] dark:text-white font-sans text-sm font-medium">
                    03 · PayPal capture receipt &amp; Seller Protection
                  </div>
                  <span className="text-[#007A56] dark:text-emerald-400 font-bold text-xs tracking-wide shrink-0 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    VERIFIED
                  </span>
                </div>

                {/* Segment 4: Missing proof (muted amber) */}
                <div className="py-3.5 flex items-center justify-between gap-2 bg-[#FFB800]/10 dark:bg-[#FFB800]/15 px-3 -mx-3">
                  <div className="text-[#1D1E20] dark:text-white font-sans text-sm font-medium">
                    04 · Recipient digital voucher acknowledgment
                  </div>
                  <span className="text-[#B45A00] dark:text-amber-400 font-bold text-xs tracking-wide shrink-0 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Missing proof
                  </span>
                </div>

                {/* Segment 5: Missing proof (muted amber) */}
                <div className="py-3.5 flex items-center justify-between gap-2 bg-[#FFB800]/10 dark:bg-[#FFB800]/15 px-3 -mx-3">
                  <div className="text-[#1D1E20] dark:text-white font-sans text-sm font-medium">
                    05 · Electronic delivery SMTP confirmation
                  </div>
                  <span className="text-[#B45A00] dark:text-amber-400 font-bold text-xs tracking-wide shrink-0 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Missing proof
                  </span>
                </div>
              </div>

              {/* Pill Outline Link */}
              <div className="pt-2">
                <Link href="/disputes/disp-chargeback-demo">
                  <span className="inline-flex items-center gap-2 rounded-full border-2 border-[#002991] dark:border-white px-8 py-3.5 text-sm sm:text-base font-bold text-[#002991] dark:text-white hover:bg-[#002991]/5 dark:hover:bg-white/10 transition-colors">
                    <span>Open the dispute defense case room</span>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5. FOOTER BAND — NAVY */}
      <footer className="bg-[#002991] dark:bg-[#001C64] text-white py-12 border-t border-white/15 transition-colors">
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
