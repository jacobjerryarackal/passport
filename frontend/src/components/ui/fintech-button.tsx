"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FintechButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
}

export function FintechButton({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  className,
  disabled,
  ...props
}: FintechButtonProps) {
  const variantStyles = {
    primary:
      "bg-[#0070BA] text-white hover:bg-[#005EA6] active:bg-[#00477D] shadow-sm shadow-[#0070BA]/20 border-transparent",
    secondary:
      "bg-muted/80 text-foreground hover:bg-muted active:bg-muted/60 border-border/80",
    danger:
      "bg-rose-600/90 text-white hover:bg-rose-600 active:bg-rose-700 border-transparent shadow-sm",
    outline:
      "bg-transparent text-foreground hover:bg-muted/50 border-border active:border-borderStrong",
    ghost:
      "bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40 border-transparent",
  };

  const sizeStyles = {
    sm: "h-8 px-3 text-xs gap-1.5",
    md: "h-9 px-4 text-xs font-semibold gap-2",
    lg: "h-11 px-6 text-sm font-semibold gap-2.5",
  };

  return (
    <button
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium tracking-tight border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#0070BA]/30 disabled:opacity-40 disabled:cursor-not-allowed select-none active:scale-[0.99]",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      <span>{children}</span>
    </button>
  );
}

