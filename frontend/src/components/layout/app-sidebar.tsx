"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  LayoutDashboard,
  FileCheck2,
  Bot,
  ScrollText,
  AlertOctagon,
  Layers,
  History,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  PlayCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import React, { useState } from "react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Spend Mandates", href: "/mandates", icon: FileCheck2 },
  { name: "Agent Purchases", href: "/purchases", icon: Bot },
  { name: "Trust Passports", href: "/passports", icon: ScrollText },
  { name: "Dispute Autopsy", href: "/disputes", icon: AlertOctagon, badge: "1 Active" },
  { name: "Evidence Timeline", href: "/evidence", icon: Layers },
  { name: "Audit Log", href: "/audit", icon: History },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [resetting, setResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleResetDemo = async () => {
    if (confirm("Reset demo data to initial hackathon scenario?")) {
      setResetting(true);
      try {
        const res = await fetch("/api/demo/reset", { method: "POST" });
        if (res.ok) {
          setResetSuccess(true);
          setTimeout(() => {
            window.location.reload();
          }, 800);
        }
      } catch (err) {
        console.error("Failed to reset demo:", err);
      } finally {
        setResetting(false);
      }
    }
  };

  return (
    <aside className="w-64 border-r border-border bg-card/60 backdrop-blur-sm flex flex-col justify-between h-screen sticky top-0 shrink-0">
      <div className="p-4 space-y-6">
        {/* Brand */}
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-primary-900 flex items-center justify-center text-white shadow-sm shadow-primary/20">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold tracking-tight text-base text-foreground block">
                Passport
              </span>
              <span className="text-[10px] text-muted-foreground block -mt-0.5">
                PayPal AI Spend Guard
              </span>
            </div>
          </Link>
          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Sandbox
          </span>
        </div>

        {/* Quick Demo Tour Banner */}
        <Link
          href="/demo"
          className="flex items-center justify-between p-2.5 rounded-xl bg-primary-500/10 border border-primary-500/20 hover:bg-primary-500/15 transition-colors group"
        >
          <div className="flex items-center gap-2">
            <PlayCircle className="w-4 h-4 text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold text-primary-700 dark:text-primary-300">
              Interactive Tour
            </span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-primary-500 group-hover:translate-x-0.5 transition-transform" />
        </Link>

        {/* Navigation */}
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                  isActive
                    ? "bg-primary-600 text-white shadow-sm shadow-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={cn("w-4 h-4", isActive ? "text-white" : "text-muted-foreground")} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.2 rounded-full font-semibold",
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-destructive/15 text-destructive border border-destructive/20"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer System Status & Controls */}
      <div className="p-4 border-t border-border space-y-3">
        <div className="rounded-lg bg-muted/40 p-2.5 border border-border/50 text-[11px] space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>PayPal Gateway</span>
            <span className="text-emerald-500 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Ready
            </span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground font-mono text-[10px]">
            <span>MCP Toolkit</span>
            <span className="truncate max-w-[90px] text-primary-500">mcp.paypal...</span>
          </div>
        </div>

        <button
          onClick={handleResetDemo}
          disabled={resetting}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-card hover:bg-muted text-xs font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          <RotateCcw className={cn("w-3.5 h-3.5", resetting && "animate-spin")} />
          {resetSuccess ? "Resetting State..." : "Reset Hackathon Demo"}
        </button>
      </div>
    </aside>
  );
}

