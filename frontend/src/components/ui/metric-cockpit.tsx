"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface MetricCockpitProps {
  label: string;
  value: string | number;
  sublabel?: string;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
  isCurrency?: boolean;
  className?: string;
}

export function MetricCockpit({
  label,
  value,
  sublabel,
  badge,
  icon,
  isCurrency = false,
  className,
}: MetricCockpitProps) {
  const [displayValue, setDisplayValue] = useState(typeof value === "number" ? 0 : value);

  useEffect(() => {
    if (typeof value === "number") {
      let start = 0;
      const duration = 400; // 400ms crisp financial animation
      const stepTime = 20;
      const totalSteps = duration / stepTime;
      const stepValue = value / totalSteps;

      const timer = setInterval(() => {
        start += stepValue;
        if (start >= value) {
          setDisplayValue(value);
          clearInterval(timer);
        } else {
          setDisplayValue(start);
        }
      }, stepTime);

      return () => clearInterval(timer);
    } else {
      setDisplayValue(value);
    }
  }, [value]);

  const formatted =
    typeof displayValue === "number"
      ? isCurrency
        ? `$${displayValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : Math.round(displayValue).toLocaleString("en-US")
      : displayValue;

  return (
    <div
      className={cn(
        "p-5 rounded-lg border border-border bg-card relative overflow-hidden flex flex-col justify-between transition-colors",
        className
      )}
    >
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-xs font-medium tracking-tight text-muted-foreground">
          {label}
        </span>
        {icon && <span className="text-muted-foreground opacity-80">{icon}</span>}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold font-mono tracking-tight text-foreground tabular-nums">
          {formatted}
        </span>
        {badge}
      </div>

      {sublabel && (
        <div className="mt-2 text-[11px] text-muted-foreground border-t border-border/40 pt-2 flex items-center justify-between">
          <span>{sublabel}</span>
        </div>
      )}
    </div>
  );
}

