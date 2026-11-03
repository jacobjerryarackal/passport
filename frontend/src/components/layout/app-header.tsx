"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import { ShieldAlert, ArrowUpRight } from "lucide-react";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";

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
        setWebhookMessage(`Dispute ${data.dispute?.paypalDisputeId || "PP-D-..."} triggered!`);
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
    <header className="h-14 border-b border-border bg-card/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
      <div>
        <h1 className="text-sm font-semibold tracking-tight text-foreground">
          {title || "Control Plane"}
        </h1>
        {subtitle && (
          <p className="text-[11px] text-muted-foreground">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-2.5">
        {webhookMessage && (
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-mono font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/25">
            {webhookMessage}
          </span>
        )}

        <Button
          variant="outline"
          size="sm"
          loading={triggeringWebhook}
          onClick={handleSimulateWebhook}
          leadingIcon={<ShieldAlert className="w-3.5 h-3.5 text-amber-500" />}
        >
          Simulate Dispute Webhook
        </Button>

        <div className="h-4 w-px bg-border mx-1" />

        <Link href="/" tabIndex={-1}>
          <Button
            variant="ghost"
            size="sm"
            trailingIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
          >
            Overview
          </Button>
        </Link>

        <ThemeToggle />
      </div>
    </header>
  );
}
