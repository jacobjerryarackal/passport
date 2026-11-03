import React from "react";
import Link from "next/link";
import { AlertTriangle, XCircle, Inbox, RefreshCw, CheckCircle2 } from "lucide-react";
import { FintechButton } from "./fintech-button";
import { cn } from "@/lib/utils";

interface StateBoundaryProps {
  type: "loading" | "empty" | "error" | "blocked" | "success";
  title?: string;
  description?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  className?: string;
}

export function StateBoundary({
  type,
  title,
  description,
  message,
  actionLabel,
  onAction,
  actionHref,
  className,
}: StateBoundaryProps) {
  const displayDesc = description || message;
  if (type === "loading") {
    return (
      <div className={cn("p-8 rounded-lg border border-border bg-card flex flex-col items-center justify-center space-y-3", className)}>
        <RefreshCw className="w-5 h-5 text-primary-400 animate-spin" />
        <p className="text-xs text-muted-foreground font-mono animate-pulse">{displayDesc || "Loading..."}</p>
      </div>
    );
  }

  const icons = {
    empty: <Inbox className="w-8 h-8 text-muted-foreground/60" />,
    error: <AlertTriangle className="w-8 h-8 text-rose-500" />,
    blocked: <XCircle className="w-8 h-8 text-rose-500" />,
    success: <CheckCircle2 className="w-8 h-8 text-emerald-500" />,
  };

  const borders = {
    empty: "border-border bg-card",
    error: "border-rose-500/30 bg-rose-500/5",
    blocked: "border-rose-500/40 bg-rose-500/5",
    success: "border-emerald-500/30 bg-emerald-500/5",
  };

  return (
    <div
      className={cn(
        "p-8 rounded-lg border text-center flex flex-col items-center justify-center space-y-3",
        borders[type],
        className
      )}
    >
      <div className="p-3 rounded-full bg-surfaceSubtle border border-border/80">
        {icons[type]}
      </div>

      <div className="space-y-1 max-w-md">
        <h4 className="text-sm font-semibold tracking-tight text-foreground">{title}</h4>
        {displayDesc && <p className="text-xs text-muted-foreground leading-relaxed">{displayDesc}</p>}
      </div>

      {actionLabel && (
        <div className="pt-2">
          {actionHref ? (
            <Link href={actionHref}>
              <FintechButton
                variant={type === "blocked" ? "danger" : "primary"}
                size="sm"
              >
                {actionLabel}
              </FintechButton>
            </Link>
          ) : onAction ? (
            <FintechButton
              variant={type === "blocked" ? "danger" : "primary"}
              size="sm"
              onClick={onAction}
            >
              {actionLabel}
            </FintechButton>
          ) : null}
        </div>
      )}
    </div>
  );
}
