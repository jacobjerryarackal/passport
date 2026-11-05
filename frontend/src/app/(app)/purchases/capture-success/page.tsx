"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  ScrollText,
  ExternalLink,
  ArrowRight,
  Copy,
  Check,
  RefreshCw,
  AlertTriangle,
  Lock,
} from "lucide-react";
import { formatCurrency, truncateHash } from "@/lib/utils";

interface CaptureResult {
  success: boolean;
  purchase: {
    id: string;
    paypalOrderId: string;
    paypalCaptureId: string;
    amount: number;
    currency: string;
    merchantName: string;
    status: string;
    paymentMethod: string;
    completedAt?: string;
  };
  passport: {
    id: string;
    passportNumber: string;
    passportHash: string;
    signature: string;
    status: string;
    disputeReadinessScore: number;
    issuedAt: string;
  };
  alreadyCaptured?: boolean;
}

export default function CaptureSuccessPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || searchParams.get("orderId");
  const payerId = searchParams.get("PayerID");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CaptureResult | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  const executeCapture = async (orderToken: string) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/purchases/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderToken,
          token: orderToken,
          payerId,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to capture PayPal order");
      }

      setData(json);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      executeCapture(token);
    } else {
      setLoading(false);
      setError("No PayPal order reference or token found in return URL.");
    }
  }, [token]);

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header Eyebrow */}
      <div className="flex items-center gap-2 pb-2 border-b border-black/10 dark:border-white/10">
        <span className="w-2.5 h-2.5 rounded-full bg-[#007A56] animate-pulse" />
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#002991] dark:text-[#60CDFF]">
          PayPal Consent Moment · Execution Verified
        </span>
      </div>

      {loading && (
        <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#111114] p-12 text-center space-y-4 shadow-sm">
          <div className="inline-flex p-4 rounded-full bg-[#60CDFF]/15 text-[#002991] dark:text-[#60CDFF] animate-spin">
            <RefreshCw className="w-8 h-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-black text-black dark:text-white">
            Capturing PayPal Approval &amp; Minting Trust Passport...
          </h2>
          <p className="text-sm font-mono text-[#6C7378] dark:text-white/60 max-w-md mx-auto">
            Order Reference: {token || "Pending Order"}. Executing zero-variance settlement with Seller Protection eligibility.
          </p>
        </div>
      )}

      {error && !loading && (
        <div className="rounded-3xl border-2 border-rose-500/30 bg-rose-500/10 p-8 sm:p-10 space-y-6 text-center">
          <div className="inline-flex p-3 rounded-full bg-rose-500 text-white">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-display font-black text-rose-900 dark:text-rose-100">
              Payment Capture Interrupted
            </h2>
            <p className="text-sm font-mono text-rose-800/80 dark:text-rose-200/80 max-w-lg mx-auto">
              {error}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            {token && (
              <button
                type="button"
                onClick={() => executeCapture(token)}
                className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-all shadow-sm"
              >
                Retry Settlement Capture
              </button>
            )}
            <Link
              href="/simulator"
              className="px-6 py-2.5 rounded-full text-xs font-bold text-black dark:text-white bg-white dark:bg-[#18181C] border border-black/10 dark:border-white/10 hover:bg-black/5 transition-all shadow-sm"
            >
              Return to Simulator
            </Link>
          </div>
        </div>
      )}

      {data && !loading && (
        <div className="space-y-8">
          {/* 1. Primary Success Hero Banner */}
          <div className="rounded-3xl bg-gradient-to-br from-[#007A56]/15 via-emerald-500/10 to-transparent border-2 border-[#007A56]/30 p-8 sm:p-10 shadow-lg relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#007A56] text-white flex items-center justify-center shrink-0 shadow-md">
                  <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-black uppercase tracking-wider bg-[#007A56] text-white shadow-xs">
                    {data.alreadyCaptured ? "SETTLED & VERIFIED" : "PAYPAL CONSENT CAPTURED"}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-display font-black text-black dark:text-white tracking-tight">
                    Payment Succeeded &amp; Trust Passport Issued
                  </h1>
                  <p className="text-sm text-[#1D1E20]/80 dark:text-white/80 max-w-2xl font-sans pt-1">
                    The autonomous agent spend requisition was authorized by your human spend mandate, approved in the PayPal sandbox, and settled into an immutable cryptographic receipt.
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs font-mono text-[#6C7378] dark:text-white/50 block">Amount Captured</span>
                <span className="text-3xl font-display font-black text-black dark:text-white tracking-tight tabular-nums">
                  {formatCurrency(data.purchase.amount, data.purchase.currency)}
                </span>
                <span className="text-[11px] font-mono text-[#007A56] dark:text-emerald-400 block font-bold mt-0.5">
                  Seller Protection: ELIGIBLE
                </span>
              </div>
            </div>
          </div>

          {/* 2. Trust Passport Mint Card */}
          <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#111114] p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#002991]/10 dark:bg-[#60CDFF]/15 text-[#002991] dark:text-[#60CDFF] flex items-center justify-center">
                  <ScrollText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-display font-black text-black dark:text-white tracking-tight">
                    Trust Passport: {data.passport.passportNumber}
                  </h2>
                  <p className="text-xs text-[#6C7378] dark:text-white/60 font-mono">
                    Ed25519 Platform Signature · Merkle Chain Anchored
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#007A56]/15 text-[#007A56] dark:text-emerald-400 border border-[#007A56]/30">
                Score: {data.passport.disputeReadinessScore}/100
              </span>
            </div>

            {/* Grid of Key Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6C7378] dark:text-white/40 block">
                  PayPal Order Reference
                </span>
                <span className="text-xs font-mono font-bold text-black dark:text-white">
                  {data.purchase.paypalOrderId}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6C7378] dark:text-white/40 block">
                  PayPal Capture ID
                </span>
                <span className="text-xs font-mono font-bold text-[#007A56] dark:text-emerald-400">
                  {data.purchase.paypalCaptureId || "CAPTURE-PENDING"}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 space-y-1 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6C7378] dark:text-white/40">
                    Cryptographic Passport Hash (SHA-256)
                  </span>
                  <button
                    type="button"
                    onClick={() => copyHash(data.passport.passportHash)}
                    className="inline-flex items-center gap-1 text-[11px] font-mono text-[#002991] dark:text-[#60CDFF] hover:underline"
                  >
                    {copiedHash ? (
                      <>
                        <Check className="w-3 h-3 text-[#007A56]" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Fingerprint</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="text-xs font-mono text-[#0A2540] dark:text-white/90 break-all select-all pt-0.5">
                  {data.passport.passportHash}
                </div>
              </div>
            </div>

            {/* Pill CTA Bar */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href={`/passports/${data.passport.id}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-black text-white bg-black dark:bg-white dark:text-black hover:bg-black/80 transition-all shadow-sm active:scale-[0.98]"
              >
                <span>Inspect Passport Attestation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <Link
                href={`/verify/${data.passport.passportNumber}`}
                target="_blank"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-black text-[#002991] bg-[#60CDFF] hover:bg-[#4bc3fa] transition-all shadow-sm active:scale-[0.98]"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Public Verification Proof</span>
                <ExternalLink className="w-3 h-3" />
              </Link>

              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-black text-[#1D1E20] dark:text-white bg-white dark:bg-[#18181C] border border-black/10 dark:border-white/10 hover:bg-black/5 transition-all shadow-sm"
              >
                Return to Dashboard
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

