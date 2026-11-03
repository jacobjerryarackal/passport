"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F7F5F2] text-[#0A1F33] font-sans selection:bg-[#0070BA]/15 selection:text-[#0A1F33] w-full overflow-x-hidden">
      {/* EDITORIAL TOP BAR */}
      <header className="border-b border-[#0A1F33]/[0.12] bg-[#F7F5F2]/90 backdrop-blur-xs sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 h-16 flex items-center justify-between">
          <div className="flex items-baseline gap-3">
            <Link
              href="/"
              className="font-serif text-xl tracking-tight text-[#0A1F33] font-normal hover:opacity-80 transition-opacity"
            >
              Passport
            </Link>
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#4A5B6B] hidden sm:inline-block">
              Attestation &amp; Dispute Ledger
            </span>
          </div>

          <nav className="flex items-center gap-6 sm:gap-8 text-xs font-medium text-[#4A5B6B]">
            <a href="#problem" className="hover:text-[#0A1F33] transition-colors hidden md:inline">
              Exhibit 01 · Problem
            </a>
            <a href="#pipeline" className="hover:text-[#0A1F33] transition-colors hidden md:inline">
              Exhibit 02 · Pipeline
            </a>
            <a href="#dispute" className="hover:text-[#0A1F33] transition-colors hidden md:inline">
              Exhibit 03 · Defense
            </a>
            <Link href="/demo">
              <span className="inline-flex items-center justify-center px-3.5 py-1.5 text-xs font-medium text-white bg-[#0070BA] hover:bg-[#005596] rounded transition-colors active:scale-[0.98]">
                Launch Demo
              </span>
            </Link>
          </nav>
        </div>
      </header>

      {/* 1. EDITORIAL HERO (NO CARD) */}
      <section className="pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-start">
            {/* Left Zone: Headline, Subhead, CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="lg:col-span-7 space-y-8"
            >
              {/* Display Serif Headline in 2 lines, max-width 780px, deep navy ink */}
              <h1 className="font-serif font-normal text-4xl sm:text-5xl lg:text-[62px] text-[#0A1F33] leading-[1.05] tracking-[-0.03em] max-w-[780px]">
                AI agents can spend money.
                <br />
                Passport makes every purchase accountable.
              </h1>

              {/* Single subhead in 62ch */}
              <p className="text-[17px] sm:text-[18px] text-[#4A5B6B] leading-[1.6] max-w-[62ch]">
                The pre-spend policy gate, cryptographic attestation chain, and automated dispute defense
                layer for autonomous commerce.
              </p>

              {/* Two CTAs: One solid PayPal-blue button and one text link with an arrow */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pt-1">
                <Link href="/demo">
                  <span className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-[#0070BA] hover:bg-[#005596] rounded transition-colors active:scale-[0.98]">
                    Launch interactive demo
                  </span>
                </Link>

                <Link
                  href="/disputes/disp-chargeback-demo"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0A1F33] hover:text-[#0070BA] transition-colors underline-offset-4 hover:underline"
                >
                  <span>View forensic case room</span>
                  <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            </motion.div>

            {/* Right Zone: Flat Exhibit Panel Flush with Grid (No card, no drop shadow, no tabs) */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 320, damping: 32, delay: 0.08 }}
              className="lg:col-span-5"
            >
              <div className="border-t border-[#0A1F33]/[0.2] pt-4 space-y-5">
                {/* Monospace Case Number and ATTESTED Stamp */}
                <div className="flex items-center justify-between font-mono text-[11px] text-[#4A5B6B]">
                  <span className="tracking-wider">CASE NO. PP-2026-8942-US</span>
                  <span className="border border-[#0F7B5F] text-[#0F7B5F] px-1.5 py-0.5 font-semibold text-[10px] tracking-widest uppercase">
                    ATTESTED
                  </span>
                </div>

                <div className="font-mono text-[10px] text-[#4A5B6B] uppercase tracking-wider">
                  Primary Evidence Exhibit · Intercept Chain
                </div>

                {/* Primary Artifact: Horizontal Evidence Strip (Connected line items with timestamps and hashes) */}
                <div className="space-y-3 font-mono text-xs border-y border-[#0A1F33]/[0.12] py-4">
                  {/* Item 01 */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="font-semibold text-[#0A1F33]">01 MANDATE</div>
                      <div className="text-[11px] text-[#4A5B6B]">MAND-80-GIFT · Client gift ($80 cap)</div>
                    </div>
                    <div className="text-right space-y-0.5 shrink-0">
                      <div className="text-[11px] text-[#4A5B6B] tabular-nums">18:29:00 UTC</div>
                      <div className="text-[10px] text-[#0070BA] tabular-nums">sha256:4a8f901...</div>
                    </div>
                  </div>

                  <div className="border-t border-dashed border-[#0A1F33]/[0.12]" />

                  {/* Item 02 */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="font-semibold text-[#0A1F33]">02 CHECKOUT</div>
                      <div className="text-[11px] text-[#4A5B6B]">CAPTURE-7TY90 · $75.00 captured</div>
                    </div>
                    <div className="text-right space-y-0.5 shrink-0">
                      <div className="text-[11px] text-[#4A5B6B] tabular-nums">18:29:45 UTC</div>
                      <div className="text-[10px] text-[#0F7B5F]">paypal:verified</div>
                    </div>
                  </div>

                  <div className="border-t border-dashed border-[#0A1F33]/[0.12]" />

                  {/* Item 03 */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="font-semibold text-[#0A1F33]">03 PASSPORT</div>
                      <div className="text-[11px] text-[#4A5B6B]">PASS-8942-US · Sealed attestation</div>
                    </div>
                    <div className="text-right space-y-0.5 shrink-0">
                      <div className="text-[11px] text-[#4A5B6B] tabular-nums">18:30:00 UTC</div>
                      <div className="text-[10px] text-[#0070BA] tabular-nums">digest:92fe151...</div>
                    </div>
                  </div>

                  <div className="border-t border-dashed border-[#0A1F33]/[0.12]" />

                  {/* Item 04 */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="font-semibold text-[#0A1F33]">04 DEFENSE</div>
                      <div className="text-[11px] text-[#4A5B6B]">DISP-849201 · Dossier compiled</div>
                    </div>
                    <div className="text-right space-y-0.5 shrink-0">
                      <div className="text-[11px] text-[#4A5B6B] tabular-nums">18:31:12 UTC</div>
                      <div className="text-[10px] text-[#0F7B5F] font-semibold">readiness:98/100</div>
                    </div>
                  </div>
                </div>

                {/* Footer Signature Block in Serif Italic */}
                <div className="font-serif italic text-xs text-[#4A5B6B] leading-relaxed pt-1">
                  Attested by Jacob, Treasury &amp; Compliance Lead · Cryptographically sealed under PayPal
                  Orders v2 agreement
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. PROBLEM SECTION */}
      <section id="problem" className="py-24 md:py-32 border-t border-[#0A1F33]/[0.12]">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 space-y-12">
          {/* Eyebrow */}
          <div className="font-mono text-xs uppercase tracking-wider text-[#4A5B6B]">
            Exhibit B · The Liability Gap
          </div>

          {/* Full-width editorial paragraph */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="space-y-6"
          >
            <p className="text-[17px] sm:text-[18px] text-[#4A5B6B] leading-[1.6] max-w-[62ch]">
              Autonomous agents execute procurement, cloud infrastructure provisioning, and software
              licensing through headless API tool calls. Traditional payment networks record settlements,
              not prompts, parameters, or human authorization bounds. When an unintended transaction
              occurs, the merchant faces total chargeback liability with zero admissible evidence.
            </p>
          </motion.div>

          {/* Thin Rule */}
          <div className="border-t border-[#0A1F33]/[0.12]" />

          {/* Pull Quote in Serif */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="space-y-4"
          >
            <blockquote className="font-serif italic font-normal text-2xl sm:text-3xl md:text-4xl text-[#0A1F33] leading-[1.25] max-w-[780px]">
              &ldquo;Gateways settle dollars. They cannot prove to an issuing bank that a human authorized
              the model to spend them.&rdquo;
            </blockquote>
            <p className="text-xs font-mono text-[#4A5B6B] tracking-wider uppercase">
              &mdash; Forensic standard for autonomous financial liability
            </p>
          </motion.div>
        </div>
      </section>

      {/* 3. PIPELINE SECTION */}
      <section id="pipeline" className="py-24 md:py-32 border-t border-[#0A1F33]/[0.12]">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 space-y-14">
          {/* Section Heading */}
          <div className="space-y-2">
            <div className="font-mono text-xs uppercase tracking-wider text-[#4A5B6B]">
              Exhibit C · Pipeline
            </div>
            <h2 className="font-serif font-normal text-3xl sm:text-4xl text-[#0A1F33] tracking-[-0.03em]">
              The Four-Step Attestation Ledger
            </h2>
          </div>

          {/* Horizontal Four-Step Ledger with Vertical Hairline Separators and 0.08s Stagger */}
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
            className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#0A1F33]/[0.12]"
          >
            {/* Step 01 */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 16 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { type: "spring", stiffness: 320, damping: 32 },
                },
              }}
              className="py-6 md:py-0 md:pr-8 first:md:pl-0 space-y-4"
            >
              <div className="font-mono text-sm font-semibold text-[#0070BA] tabular-nums">01</div>
              <div className="space-y-1">
                <div className="font-serif text-lg font-normal text-[#0A1F33]">Human Spend Mandate</div>
                <p className="text-xs text-[#4A5B6B] leading-relaxed">
                  Authorizer sets hard dollar cap, allowable categories, and expiration before execution.
                </p>
              </div>
              <div className="font-mono text-[11px] text-[#4A5B6B] tabular-nums">18:29:00 UTC</div>
            </motion.div>

            {/* Step 02 */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 16 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { type: "spring", stiffness: 320, damping: 32 },
                },
              }}
              className="py-6 md:py-0 md:px-8 space-y-4"
            >
              <div className="font-mono text-sm font-semibold text-[#0070BA] tabular-nums">02</div>
              <div className="space-y-1">
                <div className="font-serif text-lg font-normal text-[#0A1F33]">Deterministic Policy Gate</div>
                <p className="text-xs text-[#4A5B6B] leading-relaxed">
                  Pre-spend policy engine blocks out-of-bounds agent proposals before hitting payment
                  networks.
                </p>
              </div>
              <div className="font-mono text-[11px] text-[#4A5B6B] tabular-nums">18:29:12 UTC</div>
            </motion.div>

            {/* Step 03 */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 16 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { type: "spring", stiffness: 320, damping: 32 },
                },
              }}
              className="py-6 md:py-0 md:px-8 space-y-4"
            >
              <div className="font-mono text-sm font-semibold text-[#0070BA] tabular-nums">03</div>
              <div className="space-y-1">
                <div className="font-serif text-lg font-normal text-[#0A1F33]">PayPal Settlement</div>
                <p className="text-xs text-[#4A5B6B] leading-relaxed">
                  Orders v2 capture creates binding settlement with verified Seller Protection eligibility.
                </p>
              </div>
              <div className="font-mono text-[11px] text-[#4A5B6B] tabular-nums">18:29:45 UTC</div>
            </motion.div>

            {/* Step 04 */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 16 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { type: "spring", stiffness: 320, damping: 32 },
                },
              }}
              className="py-6 md:py-0 md:pl-8 space-y-4"
            >
              <div className="font-mono text-sm font-semibold text-[#0070BA] tabular-nums">04</div>
              <div className="space-y-1">
                <div className="font-serif text-lg font-normal text-[#0A1F33]">Cryptographic Trust Passport</div>
                <p className="text-xs text-[#4A5B6B] leading-relaxed">
                  Attestation digest binds mandate, agent reasoning trace, and settlement into an immutable
                  receipt.
                </p>
              </div>
              <div className="font-mono text-[11px] text-[#4A5B6B] tabular-nums">18:30:00 UTC</div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 4. FORENSIC DISPUTE SECTION */}
      <section id="dispute" className="py-24 md:py-32 border-t border-[#0A1F33]/[0.12]">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 space-y-12">
          {/* Eyebrow */}
          <div className="font-mono text-xs uppercase tracking-wider text-[#4A5B6B]">
            Exhibit D · Chargeback Defense
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-start">
            {/* Left: Large Serif Statement */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="lg:col-span-5 space-y-5"
            >
              <h2 className="font-serif font-normal text-3xl sm:text-4xl text-[#0A1F33] leading-[1.1] tracking-[-0.03em] max-w-[460px]">
                When the purchase is challenged, the same passport becomes the defense.
              </h2>
              <p className="text-[17px] text-[#4A5B6B] leading-[1.6] max-w-[460px]">
                Cardholders dispute unrecognized automated transactions. Passport automatically reconstructs
                the authorization chain into a PayPal compelling evidence dossier within seconds.
              </p>
            </motion.div>

            {/* Right: Flat Evidence-Reconciliation Strip with 5 Segments */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 320, damping: 32, delay: 0.08 }}
              className="lg:col-span-7 space-y-5"
            >
              {/* Header with Case Metadata and Press-on Stamp */}
              <div className="flex items-center justify-between border-b border-[#0A1F33]/[0.12] pb-3">
                <span className="font-mono text-xs text-[#4A5B6B] uppercase tracking-wider">
                  Dispute Case PP-D-849201 · Reconciliation Log
                </span>

                {/* Text Stamp Animation ("EVIDENCE GAP") that presses onto panel on scroll */}
                <motion.div
                  initial={{ scale: 1.45, opacity: 0, rotate: -4 }}
                  whileInView={{ scale: 1, opacity: 1, rotate: -2 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 360, damping: 18, delay: 0.15 }}
                  className="border-2 border-[#B45A00] text-[#B45A00] font-mono font-bold tracking-widest text-[10px] px-2 py-0.5 uppercase select-none"
                >
                  EVIDENCE GAP
                </motion.div>
              </div>

              {/* 5 Segments */}
              <div className="space-y-2.5 font-mono text-xs">
                {/* Segment 1: Verified */}
                <div className="flex items-center justify-between p-3 border-b border-[#0A1F33]/[0.08]">
                  <div className="text-[#0A1F33]">01 · Human spend mandate &amp; authorizer identity</div>
                  <span className="text-[#0F7B5F] font-semibold text-[11px] tracking-wide">
                    VERIFIED
                  </span>
                </div>

                {/* Segment 2: Verified */}
                <div className="flex items-center justify-between p-3 border-b border-[#0A1F33]/[0.08]">
                  <div className="text-[#0A1F33]">02 · Gemini 1.5 Pro reasoning &amp; intent transcript</div>
                  <span className="text-[#0F7B5F] font-semibold text-[11px] tracking-wide">
                    VERIFIED
                  </span>
                </div>

                {/* Segment 3: Verified */}
                <div className="flex items-center justify-between p-3 border-b border-[#0A1F33]/[0.08]">
                  <div className="text-[#0A1F33]">03 · PayPal Orders v2 capture receipt &amp; seller protection</div>
                  <span className="text-[#0F7B5F] font-semibold text-[11px] tracking-wide">
                    VERIFIED
                  </span>
                </div>

                {/* Segment 4: Muted Amber */}
                <div className="flex items-center justify-between p-3 border-b border-[#0A1F33]/[0.08] bg-[#B45A00]/[0.04]">
                  <div className="text-[#0A1F33]">04 · Recipient digital voucher acknowledgment</div>
                  <span className="text-[#B45A00] font-semibold text-[11px] tracking-wide">
                    MISSING ACKNOWLEDGMENT
                  </span>
                </div>

                {/* Segment 5: Muted Amber */}
                <div className="flex items-center justify-between p-3 border-b border-[#0A1F33]/[0.08] bg-[#B45A00]/[0.04]">
                  <div className="text-[#0A1F33]">05 · Counterparty electronic delivery log</div>
                  <span className="text-[#B45A00] font-semibold text-[11px] tracking-wide">
                    SMTP HEADER PENDING
                  </span>
                </div>
              </div>

              {/* Single "Missing Proof" Annotation */}
              <div className="text-[11px] font-mono text-[#B45A00] bg-[#B45A00]/[0.06] border border-[#B45A00]/25 p-3 leading-relaxed">
                [ MISSING PROOF: Direct buyer delivery acknowledgment not returned by SMTP server.
                Intangible goods seller protection coverage applied. ]
              </div>

              {/* Link to forensic case room */}
              <div className="pt-2">
                <Link
                  href="/disputes/disp-chargeback-demo"
                  className="font-mono text-xs text-[#0070BA] hover:underline inline-flex items-center gap-1.5"
                >
                  <span>Open forensic case room PP-D-849201</span>
                  <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5. CLOSING CTA (NO CARD) */}
      <section className="py-20 md:py-24 border-t border-[#0A1F33]/[0.12]">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <p className="font-serif italic text-xl sm:text-2xl text-[#0A1F33] leading-snug max-w-xl">
            Every AI purchase should be authorized, auditable, and defensible.
          </p>

          <Link href="/demo">
            <span className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-[#0070BA] hover:bg-[#005596] rounded transition-colors active:scale-[0.98] shrink-0">
              Launch interactive demo
            </span>
          </Link>
        </div>
      </section>

      {/* EDITORIAL FOOTER */}
      <footer className="border-t border-[#0A1F33]/[0.12] py-8 text-xs text-[#4A5B6B] font-mono">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            Passport · Financial Evidence Ledger · Built for PayPal AI Hackathon
          </div>

          <div className="flex items-center gap-6">
            <Link href="/demo" className="hover:text-[#0A1F33] transition-colors">
              Demo
            </Link>
            <Link href="/dashboard" className="hover:text-[#0A1F33] transition-colors">
              Dashboard
            </Link>
            <Link href="/mandates" className="hover:text-[#0A1F33] transition-colors">
              Mandates
            </Link>
            <Link href="/disputes" className="hover:text-[#0A1F33] transition-colors">
              Disputes
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
