"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { ColDef } from "ag-grid-community";
import { DataGrid } from "@/components/ui/data-grid";
import { StatusPill } from "@/components/ui/status-pill";
import {
  Store,
  ShieldCheck,
  ShieldAlert,
  AlertOctagon,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  ArrowRight,
  Lock,
  FileCheck,
  ShoppingBag,
} from "lucide-react";
import { formatCurrency, formatDate, truncateHash } from "@/lib/utils";

interface MerchantProduct {
  id: string;
  sku: string;
  name: string;
  amount: number;
  currency: string;
  category: string;
  merchant: string;
}

interface MerchantOrder {
  id: string;
  orderNumber: string;
  productId: string;
  passportId: string;
  passportNumber: string;
  mandateId?: string;
  amount: number;
  currency: string;
  status: "PENDING" | "CAPTURED" | "REJECTED";
  verificationStatus: "VERIFIED" | "REJECTED" | "UNVERIFIED";
  rejectionReason?: string;
  paypalOrderId?: string;
  paypalCaptureId?: string;
  simulated?: boolean;
  createdAt: string;
  product?: MerchantProduct;
}

interface MerchantStats {
  totalOrders: number;
  verifiedSettled: number;
  rejectedCount: number;
  grossSettledVolume: number;
}

export default function MerchantConsolePage() {
  const [orders, setOrders] = useState<MerchantOrder[]>([]);
  const [stats, setStats] = useState<MerchantStats>({
    totalOrders: 0,
    verifiedSettled: 0,
    rejectedCount: 0,
    grossSettledVolume: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/merchant/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error("Failed to load merchant orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const rejectedOrders = useMemo(() => {
    return orders.filter((o) => o.status === "REJECTED" || o.verificationStatus === "REJECTED");
  }, [orders]);

  const columnDefs: ColDef[] = useMemo(() => {
    return [
      {
        headerName: "Order Number",
        field: "orderNumber",
        minWidth: 160,
        flex: 1.2,
        cellRenderer: (params: any) => {
          const order = params.data as MerchantOrder;
          if (!order) return null;
          return (
            <div className="flex flex-col justify-center h-full">
              <span className="font-mono font-bold text-[#002991] dark:text-[#60CDFF]">
                {order.orderNumber}
              </span>
              <span className="text-[10px] text-[#6C7378] dark:text-white/40 font-mono">
                {formatDate(order.createdAt)}
              </span>
            </div>
          );
        },
      },
      {
        headerName: "Product",
        field: "product.name",
        minWidth: 200,
        flex: 1.5,
        cellRenderer: (params: any) => {
          const order = params.data as MerchantOrder;
          if (!order) return null;
          return (
            <div className="flex flex-col justify-center h-full">
              <span className="font-semibold text-black dark:text-white truncate">
                {order.product?.name || "GiftCardCo Digital Pass"}
              </span>
              <span className="text-[10px] text-[#6C7378] dark:text-white/50 font-mono">
                SKU: {order.product?.sku || order.productId}
              </span>
            </div>
          );
        },
      },
      {
        headerName: "Amount",
        field: "amount",
        minWidth: 120,
        flex: 0.9,
        cellRenderer: (params: any) => {
          const order = params.data as MerchantOrder;
          if (!order) return null;
          return (
            <div className="flex items-center h-full font-mono font-bold text-black dark:text-white">
              {formatCurrency(order.amount)}
            </div>
          );
        },
      },
      {
        headerName: "Verification Status",
        field: "verificationStatus",
        minWidth: 160,
        flex: 1.1,
        cellRenderer: (params: any) => {
          const order = params.data as MerchantOrder;
          if (!order) return null;
          const isVerified = order.verificationStatus === "VERIFIED";
          return (
            <div className="flex items-center h-full">
              <StatusPill
                status={isVerified ? "verified" : "blocked"}
                label={isVerified ? "Verified & Settled" : "Intercepted / Blocked"}
              />
            </div>
          );
        },
      },
      {
        headerName: "Rejection Reason",
        field: "rejectionReason",
        minWidth: 170,
        flex: 1.3,
        cellRenderer: (params: any) => {
          const order = params.data as MerchantOrder;
          if (!order) return null;
          if (!order.rejectionReason) {
            return (
              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 flex items-center h-full">
                None (Attested)
              </span>
            );
          }
          return (
            <div className="flex items-center h-full">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                {order.rejectionReason}
              </span>
            </div>
          );
        },
      },
      {
        headerName: "PayPal Capture ID",
        field: "paypalCaptureId",
        minWidth: 180,
        flex: 1.3,
        cellRenderer: (params: any) => {
          const order = params.data as MerchantOrder;
          if (!order || !order.paypalCaptureId) {
            return (
              <span className="text-xs font-mono text-[#6C7378] dark:text-white/40 flex items-center h-full">
                —
              </span>
            );
          }
          return (
            <div className="flex items-center gap-1.5 h-full">
              <span className="font-mono text-xs text-[#002991] dark:text-[#60CDFF] truncate">
                {order.paypalCaptureId}
              </span>
              {order.simulated && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-black/5 dark:bg-white/10">
                  SIM
                </span>
              )}
            </div>
          );
        },
      },
      {
        headerName: "Passport Attestation",
        field: "passportNumber",
        minWidth: 170,
        flex: 1.2,
        cellRenderer: (params: any) => {
          const order = params.data as MerchantOrder;
          if (!order) return null;
          return (
            <Link
              href={`/verify/${order.passportNumber || order.passportId}`}
              className="font-mono text-xs font-bold text-[#0070BA] dark:text-[#60CDFF] hover:underline flex items-center gap-1 h-full"
            >
              <span>{order.passportNumber}</span>
              <ExternalLink className="w-3 h-3 shrink-0" />
            </Link>
          );
        },
      },
      {
        headerName: "Defense Action",
        minWidth: 150,
        flex: 1,
        cellRenderer: (params: any) => {
          const order = params.data as MerchantOrder;
          if (!order || order.status !== "CAPTURED") return null;
          return (
            <div className="flex items-center h-full">
              <Link
                href="/evidence"
                className="px-3 py-1 rounded-full text-[11px] font-bold text-[#002991] dark:text-white border border-[#002991]/20 dark:border-white/20 hover:bg-[#002991]/5 dark:hover:bg-white/5 transition-colors"
              >
                Dispute Evidence
              </Link>
            </div>
          );
        },
      },
    ];
  }, []);

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* Header / Eyebrow */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-[#002991]/5 dark:bg-[#60CDFF]/10 text-[#002991] dark:text-[#60CDFF] border border-[#002991]/10 dark:border-[#60CDFF]/20">
              <Store className="w-3.5 h-3.5" />
              <span>Merchant Operations & Risk Sentinel</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-display font-black tracking-tight text-[#002991] dark:text-white">
              GiftCardCo Merchant Console
            </h1>

            <p className="text-lg text-[#6C7378] dark:text-white/70 max-w-3xl">
              Real-time ledger of agent-initiated checkouts, independent cryptographic verification,
              and automated dispute defense under PayPal Seller Protection.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchOrders}
              disabled={loading}
              className="px-4 py-2 rounded-full text-xs font-bold text-[#002991] dark:text-white border border-[#002991]/20 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh Ledger</span>
            </button>
            <Link
              href="/store"
              className="px-5 py-2.5 rounded-full text-xs font-bold text-white bg-[#002991] hover:bg-[#001f70] dark:bg-[#60CDFF] dark:text-[#002991] dark:hover:bg-[#4bc3fa] transition-colors shadow-sm flex items-center gap-2"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Visit Storefront</span>
            </Link>
          </div>
        </div>

        {/* Telemetry Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#6C7378] dark:text-white/60">
              Total Requisitions
            </span>
            <div className="text-3xl font-display font-black text-[#1D1E20] dark:text-white">
              {stats.totalOrders}
            </div>
            <p className="text-xs text-[#6C7378] dark:text-white/60">
              Commercial agent checkout attempts
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Verified & Settled
            </span>
            <div className="text-3xl font-display font-black text-emerald-700 dark:text-emerald-400">
              {formatCurrency(stats.grossSettledVolume)}
            </div>
            <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80">
              {stats.verifiedSettled} captured orders via PayPal
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20 space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
              Rejections Intercepted
            </span>
            <div className="text-3xl font-display font-black text-rose-700 dark:text-rose-400">
              {stats.rejectedCount}
            </div>
            <p className="text-xs text-rose-700/80 dark:text-rose-400/80">
              Rogue or over-limit agent attempts blocked
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#002991]/5 dark:bg-[#002991]/20 border border-[#002991]/20 space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#002991] dark:text-[#60CDFF]">
              Seller Protection
            </span>
            <div className="text-3xl font-display font-black text-[#002991] dark:text-[#60CDFF]">
              100%
            </div>
            <p className="text-xs text-[#002991]/80 dark:text-[#60CDFF]/80">
              Attested cryptographic evidence on file
            </p>
          </div>
        </div>

        {/* Section: Settled Orders Ledger (AG Grid) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#6C7378] dark:text-white/60">
                Settled orders ledger
              </span>
              <h2 className="text-2xl font-display font-black text-[#002991] dark:text-white">
                Commercial Requisitions & Attestations
              </h2>
            </div>
            <span className="text-xs font-mono text-[#6C7378] dark:text-white/60">
              AG Grid Community v32
            </span>
          </div>

          <div className="rounded-2xl border border-black/10 dark:border-white/10 overflow-hidden bg-white dark:bg-[#09090B]">
            <DataGrid rowData={orders} columnDefs={columnDefs} rowHeight={68} />
          </div>
        </div>

        {/* Section: Rejection Sentinel Log */}
        {rejectedOrders.length > 0 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Risk sentinel feed
              </span>
              <h2 className="text-2xl font-display font-black text-[#002991] dark:text-white">
                Intercepted Policy Violations
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rejectedOrders.slice(0, 6).map((rej) => (
                <div
                  key={rej.id}
                  className="p-5 rounded-2xl bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                      {rej.rejectionReason || "REJECTED"}
                    </span>
                    <span className="text-[10px] font-mono text-[#6C7378] dark:text-white/50">
                      {formatDate(rej.createdAt)}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-[#1D1E20] dark:text-white">
                      {rej.product?.name || "Digital Gift Card Requisition"}
                    </h4>
                    <p className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                      Attempted: {formatCurrency(rej.amount)}
                    </p>
                  </div>

                  <p className="text-xs text-[#6C7378] dark:text-white/70">
                    Order {rej.orderNumber} blocked before PayPal capture. Platform Merkle audit log
                    persisted.
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dispute Defense Architecture */}
        <div className="p-8 rounded-2xl bg-[#002991] text-white space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#60CDFF]">
                Dispute defense architecture
              </span>
              <h3 className="text-2xl sm:text-3xl font-display font-black tracking-tight">
                Automated Dispute Defense via Attested Passport
              </h3>
              <p className="text-sm text-white/80 leading-relaxed">
                GiftCardCo protects its revenues against chargebacks and “unauthorized purchase”
                claims. Every accepted transaction embeds the Trust Passport identifier in PayPal’s
                custom_id. When a dispute is detected, GiftCardCo automatically packages the buyer’s
                Ed25519 signed spend mandate and LLM agent reasoning logs directly to PayPal’s
                Provide Evidence API.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <Link
                href="/evidence"
                className="w-full sm:w-auto px-6 py-3 rounded-full text-xs font-bold text-[#002991] bg-white hover:bg-white/90 transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <FileCheck className="w-4 h-4" />
                <span>Inspect Evidence Dossier</span>
              </Link>
              <Link
                href="/disputes"
                className="w-full sm:w-auto px-6 py-3 rounded-full text-xs font-bold text-white border border-white/20 hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
              >
                <span>Dispute Center</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
  );
}

