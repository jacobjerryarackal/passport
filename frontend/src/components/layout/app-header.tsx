"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import { Sparkles, ShieldAlert, CheckCircle2, ArrowUpRight } from "lucide-react";
import React, { useState } from "react";

export function AppHeader({ title, subtitle }: { title?: string; subtitle?: string }) {
  const [triggeringWebhook, setTriggeringWebhook] = useState(false);
  const [webhookMessage, setWebhookMessage] = useState<string | null>(null);

  const handleSimulateWebhook = async () => {
    setTriggeringWebhook(true);
    setWebhookMessage(null);
    try {
      const res = await fetch("/api/webhooks/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventType: "CUSTOMER.DISPUTE.CREATED" }),
      });
      const data = await res.json();
      if (res.ok) {
        setWebhookMessage(`Simulated dispute ${data.dispute?.paypalDisputeId || "PP-D-..."} triggered!`);
        setTimeout(() => {
          window.location.href = `/disputes/${data.dispute?.id || ""}`;
        }, 800);
      } else {
        alert(data.error || "Simulation failed");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTriggeringWebhook(false);
    }
  };

  return (
    <header className="h-16 border-b border-border bg-card/40 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
      <div>
        <h1 className="text-base font-semibold tracking-tight text-foreground">
          {title || "Dashboard"}
        </h1>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {webhookMessage && (
          <span className="text-xs text-amber-500 font-medium animate-pulse bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
            {webhookMessage}
          </span>
        )}

        <button
          onClick={handleSimulateWebhook}
          disabled={triggeringWebhook}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-xs font-medium text-amber-600 dark:text-amber-400 transition-colors disabled:opacity-50"
          title="Simulate incoming PayPal chargeback webhook event"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          {triggeringWebhook ? "Triggering..." : "Simulate Dispute Webhook"}
        </button>

        <div className="h-4 w-px bg-border mx-1" />

        <Link
          href="/"
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
        >
          Landing Page
          <ArrowUpRight className="w-3 h-3" />
        </Link>

        <ThemeToggle />
      </div>
    </header>
  );
}

