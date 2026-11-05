"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertOctagon,
  ArrowRight,
  Lock,
  RefreshCw,
  FileCheck,
  ExternalLink,
  Sparkles,
  Zap,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusPill } from "@/components/ui/status-pill";

interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  amount: number;
  currency: string;
  category: string;
  merchant: string;
}

interface Mandate {
  id: string;
  title: string;
  maxAmount: number;
  currency: string;
  allowedCategories: string[];
  status: string;
  revoked?: boolean;
}

interface Passport {
  id: string;
  passportNumber: string;
  passportHash: string;
  signature: string;
  mandateId?: string;
  status: string;
  createdAt: string;
  expiresAt?: string;
}

interface CheckoutResponse {
  success: boolean;
  reasonCode?: string;
  error?: string;
  merchantOrder?: {
    id: string;
    orderNumber: string;
    amount: number;
    currency: string;
    status: string;
    verificationStatus: string;
    paypalOrderId?: string;
    paypalCaptureId?: string;
    rejectionReason?: string;
    simulated?: boolean;
    createdAt: string;
    product?: Product;
  };
  captured?: {
    orderId: string;
    captureId: string;
    sellerProtectionStatus?: string;
    isSimulated?: boolean;
  };
}

export default function StorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeMandate, setActiveMandate] = useState<Mandate | null>(null);
  const [activePassport, setActivePassport] = useState<Passport | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingOutId, setCheckingOutId] = useState<string | null>(null);
  const [checkoutResult, setCheckoutResult] = useState<CheckoutResponse | null>(null);
  const [activeScenarioLabel, setActiveScenarioLabel] = useState<string>("");

  useEffect(() => {
    fetchStoreData();
  }, []);

  async function fetchStoreData() {
    try {
      setLoading(true);
      const [prodRes, mandRes, passRes] = await Promise.all([
        fetch("/api/merchant/products"),
        fetch("/api/mandates"),
        fetch("/api/passports"),
      ]);

      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(prodData.products || []);
      }

      if (mandRes.ok) {
        const mandData = await mandRes.json();
        const active = (mandData.mandates || []).find((m: any) => m.status === "ACTIVE") || mandData.mandates?.[0];
        if (active) setActiveMandate(active);
      }

      if (passRes.ok) {
        const passData = await passRes.json();
        const validPass = (passData.passports || []).find((p: any) => p.status === "VALID") || passData.passports?.[0];
        if (validPass) setActivePassport(validPass);
      }
    } catch (err) {
      console.error("Failed to load store data:", err);
    } finally {
      setLoading(false);
    }
  }

  // Create an attested passport on-demand if buyer hasn't minted one yet
  async function mintBuyerPassport(): Promise<Passport | null> {
    try {
      if (!activeMandate) return null;
      const res = await fetch("/api/purchases/propose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mandateId: activeMandate.id,
          itemName: "GiftCardCo Digital Pass · $75",
          amount: 75.0,
          currency: "USD",
          category: "digital gift cards",
          merchant: "GiftCardCo",
          recipient: "client-recipient@authorized-partner.internal",
          reasoning: "Merchant-attested procurement pass for corporate client",
        }),
      });

      if (!res.ok) return null;
      const propData = await res.json();
      if (!propData.proposal?.id) return null;

      const execRes = await fetch("/api/purchases/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposalId: propData.proposal.id }),
      });

      if (!execRes.ok) return null;
      const execData = await execRes.json();
      if (execData.orderId) {
        const capRes = await fetch("/api/purchases/capture", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: execData.orderId }),
        });
        if (capRes.ok) {
          const capData = await capRes.json();
          if (capData.passport) {
            setActivePassport(capData.passport);
            return capData.passport;
          }
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  // Execute checkout against GiftCardCo merchant sentinel
  async function executeMerchantCheckout(
    productId: string,
    passportOverride?: any,
    scenarioName?: string
  ) {
    try {
      setCheckingOutId(productId);
      setActiveScenarioLabel(scenarioName || "");
      setCheckoutResult(null);

      let passportToUse = passportOverride || activePassport;

      // If no passport exists, mint one automatically so user is never blocked
      if (!passportToUse && !passportOverride) {
        passportToUse = await mintBuyerPassport();
      }

      const res = await fetch("/api/merchant/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          passport: passportToUse,
          idempotencyKey: `mreq-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        }),
      });

      const data = await res.json();
      setCheckoutResult(data);
    } catch (err) {
      setCheckoutResult({
        success: false,
        reasonCode: "NETWORK_ERROR",
        error: (err as Error).message || "Merchant checkout gateway error",
      });
    } finally {
      setCheckingOutId(null);
    }
  }

  // Quick preset triggers
  const runCompliantCheckout = () => {
    const p75 = products.find((p) => p.amount === 75) || products[0];
    if (p75) {
      executeMerchantCheckout(
        p75.id,
        activePassport,
        "Compliant Agent Requisition ($75.00 against $80.00 Mandate)"
      );
    }
  };

  const runOverLimitCheckout = () => {
    const p120 = products.find((p) => p.amount === 120) || products[products.length - 1];
    if (p120) {
      executeMerchantCheckout(
        p120.id,
        activePassport,
        "Over-Limit Requisition ($120.00 against $80.00 Mandate)"
      );
    }
  };

  const runTamperedSignatureCheckout = () => {
    const p75 = products.find((p) => p.amount === 75) || products[0];
    if (p75 && activePassport) {
      const tamperedPassport = {
        ...activePassport,
        signature: "corrupted_ed25519_signature_payload_tampered_by_attacker",
      };
      executeMerchantCheckout(
        p75.id,
        tamperedPassport,
        "Tampered Attestation (Corrupted Ed25519 Signature)"
      );
    }
  };

  const runRevokedMandateCheckout = () => {
    const p75 = products.find((p) => p.amount === 75) || products[0];
    if (p75 && activePassport) {
      const revokedPassport = {
        ...activePassport,
        mandate: {
          ...(activeMandate || {}),
          status: "REVOKED",
          revoked: true,
        },
      };
      executeMerchantCheckout(
        p75.id,
        revokedPassport,
        "Revoked Mandate (Account Owner Kill Switch Active)"
      );
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#09090B] text-[#1D1E20] dark:text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1400px] mx-auto space-y-12">
        {/* Header / Plain Eyebrow */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-[#002991]/5 dark:bg-[#60CDFF]/10 text-[#002991] dark:text-[#60CDFF] border border-[#002991]/10 dark:border-[#60CDFF]/20">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Merchant storefront</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-display font-black tracking-tight text-[#002991] dark:text-white">
            GiftCardCo Digital Vouchers
          </h1>

          <p className="text-lg text-[#6C7378] dark:text-white/70 max-w-3xl">
            Automated Commercial Requisitions Only · Attested Trust Passport Required. GiftCardCo
            acts as an independent merchant enforcing cryptographic Ed25519 attestation on all agent
            purchases.
          </p>
        </div>

        {/* Two-Party Architecture Notice Banner */}
        <div className="p-6 rounded-2xl bg-[#002991]/5 dark:bg-[#002991]/20 border border-[#002991]/15 dark:border-[#60CDFF]/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider uppercase text-[#002991] dark:text-[#60CDFF]">
              <ShieldCheck className="w-4 h-4 text-[#002991] dark:text-[#60CDFF]" />
              <span>Independent Merchant Sentinel Active</span>
            </div>
            <p className="text-sm text-[#1D1E20] dark:text-white/90">
              Unlike traditional checkouts, GiftCardCo independently validates that the agent’s spend
              mandate is active, unrevoked, unexpired, and strictly sufficient for the item amount
              before triggering PayPal capture.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/merchant"
              className="px-5 py-2.5 rounded-full text-xs font-bold text-white bg-[#002991] hover:bg-[#001f70] dark:bg-[#60CDFF] dark:text-[#002991] dark:hover:bg-[#4bc3fa] transition-colors shadow-sm flex items-center gap-2"
            >
              <span>Merchant Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Connected Buyer Agent State */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10">
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#6C7378] dark:text-white/60">
              Buyer Spend Mandate
            </span>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-base text-[#002991] dark:text-white">
                {activeMandate?.title || "Corporate Procurement Mandate"}
              </span>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                Cap: {activeMandate ? formatCurrency(activeMandate.maxAmount) : "$80.00 USD"}
              </span>
            </div>
            <p className="text-xs text-[#6C7378] dark:text-white/60">
              Authorized Category: <strong>digital gift cards</strong> · Allowed max amount:{" "}
              <strong>$80.00</strong>
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#6C7378] dark:text-white/60">
              Agent Attestation Credential
            </span>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-[#0070BA] dark:text-[#60CDFF] truncate max-w-[250px]">
                {activePassport?.passportNumber || "PASS-2026-6412-US"}
              </span>
              <StatusPill status="verified" label="Attested & Signed" />
            </div>
            <p className="text-xs text-[#6C7378] dark:text-white/60">
              Ed25519 Signed attestation token ready for merchant verification.
            </p>
          </div>
        </div>

        {/* Interactive Scenario Triggers */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#6C7378] dark:text-white/60">
              Interactive Autonomous Requisition Scenarios
            </span>
            <span className="text-xs text-[#6C7378] dark:text-white/60">
              Test compliance and rejection guards against GiftCardCo
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={runCompliantCheckout}
              disabled={loading || checkingOutId !== null}
              className="p-4 rounded-xl text-left bg-white dark:bg-white/5 border border-emerald-500/30 hover:border-emerald-500 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Compliant ($75)
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
              </div>
              <h4 className="text-sm font-bold text-[#1D1E20] dark:text-white">
                In-Limit Purchase ($75)
              </h4>
              <p className="text-xs text-[#6C7378] dark:text-white/70 mt-1">
                Passes all 5 checks. Captured via PayPal and settled.
              </p>
            </button>

            <button
              onClick={runOverLimitCheckout}
              disabled={loading || checkingOutId !== null}
              className="p-4 rounded-xl text-left bg-white dark:bg-white/5 border border-rose-500/30 hover:border-rose-500 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                  Over Limit ($120)
                </span>
                <AlertOctagon className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
              </div>
              <h4 className="text-sm font-bold text-[#1D1E20] dark:text-white">
                Exceeds Cap ($120)
              </h4>
              <p className="text-xs text-[#6C7378] dark:text-white/70 mt-1">
                Rejected with reason code OVER_LIMIT before PayPal capture.
              </p>
            </button>

            <button
              onClick={runTamperedSignatureCheckout}
              disabled={loading || checkingOutId !== null}
              className="p-4 rounded-xl text-left bg-white dark:bg-white/5 border border-rose-500/30 hover:border-rose-500 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                  Tampered Signature
                </span>
                <Lock className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
              </div>
              <h4 className="text-sm font-bold text-[#1D1E20] dark:text-white">
                Forged Attestation
              </h4>
              <p className="text-xs text-[#6C7378] dark:text-white/70 mt-1">
                Rejected with PASSPORT_SIGNATURE_INVALID.
              </p>
            </button>

            <button
              onClick={runRevokedMandateCheckout}
              disabled={loading || checkingOutId !== null}
              className="p-4 rounded-xl text-left bg-white dark:bg-white/5 border border-rose-500/30 hover:border-rose-500 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                  Kill Switch Active
                </span>
                <ShieldAlert className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
              </div>
              <h4 className="text-sm font-bold text-[#1D1E20] dark:text-white">
                Revoked Mandate
              </h4>
              <p className="text-xs text-[#6C7378] dark:text-white/70 mt-1">
                Rejected with MANDATE_REVOKED. Merchant blocks execution.
              </p>
            </button>
          </div>
        </div>

        {/* Live Requisition Result Feedback */}
        {checkoutResult && (
          <div
            className={`p-6 rounded-2xl border transition-all ${
              checkoutResult.success
                ? "bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-100"
                : "bg-rose-500/5 dark:bg-rose-500/10 border-rose-500/30 text-rose-950 dark:text-rose-100"
            }`}
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {checkoutResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <AlertOctagon className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                  )}
                  <h3 className="text-lg font-bold">
                    {checkoutResult.success
                      ? "Merchant Verification Approved · Order Settled"
                      : `Merchant Verification Denied: ${checkoutResult.reasonCode}`}
                  </h3>
                  {activeScenarioLabel && (
                    <span className="text-xs font-mono font-bold opacity-75">
                      ({activeScenarioLabel})
                    </span>
                  )}
                </div>

                <p className="text-sm opacity-90 max-w-2xl">
                  {checkoutResult.success
                    ? `GiftCardCo accepted order ${checkoutResult.merchantOrder?.orderNumber}. PayPal capture ${checkoutResult.captured?.captureId || checkoutResult.merchantOrder?.paypalCaptureId} completed with verified seller protection.`
                    : checkoutResult.error}
                </p>

                {checkoutResult.merchantOrder && (
                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono pt-1">
                    <span>
                      Order: <strong>{checkoutResult.merchantOrder.orderNumber}</strong>
                    </span>
                    <span>
                      Amount: <strong>{formatCurrency(checkoutResult.merchantOrder.amount)}</strong>
                    </span>
                    <span>
                      Capture ID:{" "}
                      <strong>
                        {checkoutResult.merchantOrder.paypalCaptureId || "SIMULATED-CAPT-001"}
                      </strong>
                    </span>
                    {checkoutResult.merchantOrder.simulated && (
                      <span className="px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 uppercase font-bold text-[10px]">
                        SIMULATED
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Link
                  href="/merchant"
                  className="px-5 py-2.5 rounded-full text-xs font-bold text-white bg-[#002991] hover:bg-[#001f70] dark:bg-white dark:text-[#002991] transition-colors shadow-sm"
                >
                  View in Merchant Console
                </Link>
                {checkoutResult.success && (
                  <Link
                    href="/evidence"
                    className="px-5 py-2.5 rounded-full text-xs font-bold text-[#002991] dark:text-white border border-[#002991]/20 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    View Dispute Defense
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 4 Products Catalog Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-display font-black text-[#002991] dark:text-white">
              GiftCardCo Product Catalog
            </h2>
            <span className="text-xs font-mono text-[#6C7378] dark:text-white/60">
              4 digital passes available
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              const isOverLimit = product.amount > 80.0;
              const isCurrentlyExecuting = checkingOutId === product.id;

              return (
                <div
                  key={product.id}
                  className="p-6 rounded-2xl bg-white dark:bg-[#002991]/10 border border-black/10 dark:border-white/10 hover:border-[#002991]/30 dark:hover:border-[#60CDFF]/40 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.2)] transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-[#6C7378] dark:text-white/60">
                        {product.sku}
                      </span>
                      {isOverLimit ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20">
                          Exceeds $80 Cap
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                          Within $80 Cap
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-[#1D1E20] dark:text-white leading-snug">
                        {product.name}
                      </h3>
                      <div className="mt-2 text-3xl font-display font-black text-[#002991] dark:text-[#60CDFF]">
                        {formatCurrency(product.amount)}
                      </div>
                    </div>

                    <p className="text-xs text-[#6C7378] dark:text-white/70 leading-relaxed">
                      {product.description}
                    </p>

                    <div className="pt-2 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-[11px] font-mono text-[#6C7378] dark:text-white/60">
                      <span>Category: {product.category}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                        Attestation Req.
                      </span>
                    </div>
                  </div>

                  <div className="pt-6">
                    <button
                      onClick={() =>
                        executeMerchantCheckout(
                          product.id,
                          activePassport,
                          `Direct Purchase: ${product.name}`
                        )
                      }
                      disabled={isCurrentlyExecuting || loading}
                      className={`w-full py-3 px-4 rounded-full text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 ${
                        isOverLimit
                          ? "bg-rose-600 hover:bg-rose-700 text-white"
                          : "bg-black hover:bg-black/80 dark:bg-white dark:text-[#002991] dark:hover:bg-white/90 text-white"
                      }`}
                    >
                      {isCurrentlyExecuting ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Verifying Attestation...</span>
                        </>
                      ) : (
                        <>
                          <span>Order with Attested Passport</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Merchant Verification Sentinel Specs */}
        <div className="p-8 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#6C7378] dark:text-white/60">
              Merchant Security Architecture
            </span>
            <h3 className="text-xl font-display font-black text-[#002991] dark:text-white">
              Why GiftCardCo Rejects Unattested Requisitions
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-xl bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 space-y-2">
              <div className="w-8 h-8 rounded-full bg-[#002991]/10 dark:bg-[#60CDFF]/10 flex items-center justify-center text-[#002991] dark:text-[#60CDFF]">
                <Lock className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold">1. Cryptographic Non-Repudiation</h4>
              <p className="text-xs text-[#6C7378] dark:text-white/70">
                GiftCardCo independently re-verifies the Ed25519 signature on the passport hash.
                Tampered or forged tokens are blocked immediately.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 space-y-2">
              <div className="w-8 h-8 rounded-full bg-[#002991]/10 dark:bg-[#60CDFF]/10 flex items-center justify-center text-[#002991] dark:text-[#60CDFF]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold">2. Mandate Cap Enforcement</h4>
              <p className="text-xs text-[#6C7378] dark:text-white/70">
                Requisitions exceeding the human-authorized spend cap ($80.00) are intercepted
                with reason code OVER_LIMIT before settlement occurs.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 space-y-2">
              <div className="w-8 h-8 rounded-full bg-[#002991]/10 dark:bg-[#60CDFF]/10 flex items-center justify-center text-[#002991] dark:text-[#60CDFF]">
                <FileCheck className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold">3. Dispute-Proof Evidence</h4>
              <p className="text-xs text-[#6C7378] dark:text-white/70">
                Because the passport ID is embedded into PayPal order custom_id, GiftCardCo has an
                unshakeable defense against chargebacks under PayPal Seller Protection.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

