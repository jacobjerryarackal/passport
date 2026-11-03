import React from "react";
import { CheckCircle2, AlertTriangle, XCircle, ShieldCheck, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export type StatusType =
  | "approved"
  | "completed"
  | "verified"
  | "active"
  | "pending"
  | "action_required"
  | "co_signed"
  | "blocked"
  | "disputed"
  | "failed"
  | "neutral";

interface StatusPillProps {
  status: string;
  label?: string;
  className?: string;
  showIcon?: boolean;
}

export function StatusPill({ status, label, className, showIcon = true }: StatusPillProps) {
  const normalized = (status || "").toLowerCase().replace(/[\s-]/g, "_");

  let style = "bg-muted text-muted-foreground border-border";
  let icon = <Clock className="w-3 h-3 shrink-0" />;
  let text = label || status.replace(/_/g, " ");

  // 1. Success States (Emerald Only)
  if (
    normalized === "approved" ||
    normalized === "completed" ||
    normalized === "verified" ||
    normalized === "settled" ||
    normalized === "valid"
  ) {
    style = "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30";
    icon = <CheckCircle2 className="w-3 h-3 shrink-0 text-emerald-600 dark:text-emerald-400" />;
    text = label || "Verified";
  }
  // 2. Pending / Human Co-Sign Required (Amber Only)
  else if (
    normalized === "action_required" ||
    normalized === "pending" ||
    normalized === "co_signed" ||
    normalized === "waiting_for_seller_response" ||
    normalized === "under_review"
  ) {
    style = "bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/35";
    icon = <AlertTriangle className="w-3 h-3 shrink-0 text-amber-600 dark:text-amber-400" />;
    text = label || (normalized === "action_required" ? "Action Required" : "Co-Signed");
  }
  // 3. Blocked / Dispute / Risk (Crimson Only)
  else if (
    normalized === "blocked" ||
    normalized === "disputed" ||
    normalized === "failed" ||
    normalized === "chargeback" ||
    normalized === "revoked"
  ) {
    style = "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30";
    icon = <XCircle className="w-3 h-3 shrink-0 text-rose-600 dark:text-rose-400" />;
    text = label || (normalized === "blocked" ? "Blocked" : "Disputed");
  }
  // 4. Active / Neutral System State
  else if (normalized === "active") {
    style = "bg-primary/10 text-primary-700 dark:text-primary-300 border-primary/30";
    icon = <ShieldCheck className="w-3 h-3 shrink-0 text-primary" />;
    text = label || "Active";
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold tracking-wide border leading-none select-none",
        style,
        className
      )}
    >
      {showIcon && icon}
      <span className="capitalize">{text}</span>
    </span>
  );
}
