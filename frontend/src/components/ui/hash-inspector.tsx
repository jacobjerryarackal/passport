"use client";

import React, { useState } from "react";
import { Copy, Check, Lock } from "lucide-react";
import { truncateHash, cn } from "@/lib/utils";

interface HashInspectorProps {
  hash: string;
  lead?: number;
  trail?: number;
  truncateLength?: number;
  showIcon?: boolean;
  className?: string;
}

export function HashInspector({
  hash,
  lead,
  trail,
  truncateLength,
  showIcon = true,
  className,
}: HashInspectorProps) {
  const [copied, setCopied] = useState(false);
  const effectiveLead = lead ?? truncateLength ?? 6;
  const effectiveTrail = trail ?? truncateLength ?? 6;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!hash) return;
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      type="button"
      title={`Click to copy full SHA-256 hash: ${hash}`}
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-surfaceSubtle border border-border/80 font-mono text-[11px] text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors group cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary",
        className
      )}
    >
      {showIcon && <Lock className="w-2.5 h-2.5 text-primary-500 opacity-80" />}
      <span className="tabular-nums font-medium">{truncateHash(hash, effectiveLead, effectiveTrail)}</span>
      {copied ? (
        <Check className="w-3 h-3 text-emerald-400" />
      ) : (
        <Copy className="w-2.5 h-2.5 opacity-40 group-hover:opacity-100 transition-opacity" />
      )}
    </button>
  );
}
