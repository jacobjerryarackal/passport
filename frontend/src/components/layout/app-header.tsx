"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import {
  ShieldAlert,
  ArrowUpRight,
  Menu,
  X,
  LayoutDashboard,
  FileCheck2,
  Bot,
  ScrollText,
  AlertOctagon,
  Layers,
  History,
  Shield,
  PlayCircle,
} from "lucide-react";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Spend Mandates", href: "/mandates", icon: FileCheck2 },
  { name: "Agent Purchases", href: "/purchases", icon: Bot },
  { name: "Trust Passports", href: "/passports", icon: ScrollText },
  { name: "Dispute Autopsy", href: "/disputes", icon: AlertOctagon },
  { name: "Evidence Timeline", href: "/evidence", icon: Layers },
  { name: "Audit Ledger", href: "/audit", icon: History },
  { name: "Guided Tour", href: "/demo", icon: PlayCircle },
];

export function AppHeader({ title, subtitle }: { title?: string; subtitle?: string }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    <>
      <header className="h-14 border-b border-border bg-card/80 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden shrink-0"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            ariaLabel="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>

          <div className="min-w-0 truncate">
            <h1 className="text-xs sm:text-sm font-semibold tracking-tight text-foreground truncate">
              {title || "Control Plane"}
            </h1>
            {subtitle && (
              <p className="text-[10px] sm:text-[11px] text-muted-foreground truncate hidden sm:block">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {webhookMessage && (
            <span className="text-[10px] sm:text-[11px] text-amber-600 dark:text-amber-400 font-mono font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/25 hidden sm:inline-block">
              {webhookMessage}
            </span>
          )}

          <Button
            variant="outline"
            size="sm"
            loading={triggeringWebhook}
            onClick={handleSimulateWebhook}
            leadingIcon={<ShieldAlert className="w-3.5 h-3.5 text-amber-500" />}
            className="text-xs"
          >
            <span className="hidden sm:inline">Simulate Dispute Webhook</span>
            <span className="sm:hidden">Simulate</span>
          </Button>

          <div className="h-4 w-px bg-border mx-0.5 hidden sm:block" />

          <Link href="/" tabIndex={-1} className="hidden md:inline-flex">
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

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-card p-3 space-y-1 shadow-lg z-30 animate-in slide-in-from-top-2 duration-150">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <Icon className="w-4 h-4 text-primary" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
