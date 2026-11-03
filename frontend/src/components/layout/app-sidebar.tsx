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
  PlayCircle,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Spend Mandates", href: "/mandates", icon: FileCheck2 },
  { name: "Agent Purchases", href: "/purchases", icon: Bot },
  { name: "Trust Passports", href: "/passports", icon: ScrollText },
  { name: "Dispute Autopsy", href: "/disputes", icon: AlertOctagon, badge: "1 Urgent" },
  { name: "Evidence Timeline", href: "/evidence", icon: Layers },
  { name: "Audit Ledger", href: "/audit", icon: History },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [resetting, setResetting] = useState(false);

  const handleResetSandbox = async () => {
    if (confirm("Reset sandbox environment to clean baseline state?")) {
      setResetting(true);
      try {
        const res = await fetch("/api/demo/reset", { method: "POST" });
        if (res.ok) {
          window.location.reload();
        }
      } catch (err) {
        console.error("Failed to reset sandbox:", err);
      } finally {
        setResetting(false);
      }
    }
  };

  return (
    <aside className="hidden md:flex w-60 border-r border-border bg-card flex-col justify-between h-screen sticky top-0 shrink-0">
      <div className="p-3.5 space-y-4">
        {/* Brand */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center text-primary-foreground shadow-xs shadow-primary/25">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-bold tracking-tight text-xs text-foreground block">
                Passport
              </span>
              <span className="text-[10px] text-muted-foreground block -mt-0.5">
                Financial Control Plane
              </span>
            </div>
          </Link>
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
            SANDBOX
          </span>
        </div>

        {/* Interactive Tour Action Banner */}
        <Link
          href="/demo"
          className="flex items-center justify-between p-2 rounded-md bg-primary/10 border border-primary/25 hover:bg-primary/15 transition-colors group"
        >
          <div className="flex items-center gap-2">
            <PlayCircle className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary">
              Guided Tour
            </span>
          </div>
          <ChevronRight className="w-3 h-3 text-primary group-hover:translate-x-0.5 transition-transform" />
        </Link>

        {/* Navigation */}
        <nav className="space-y-0.5">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-2.5 py-2 rounded-md text-xs font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                <div className="flex items-center gap-2">
                  <Icon className={cn("w-3.5 h-3.5", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={cn(
                      "text-[9px] px-1.5 py-0.5 rounded font-mono font-bold leading-none",
                      isActive
                        ? "bg-white/25 text-white"
                        : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25"
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

      {/* Footer Status Controls */}
      <div className="p-3.5 border-t border-border space-y-2.5">
        <div className="rounded p-2 bg-secondary/60 border border-border text-[10px] space-y-1 font-mono">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>PayPal Gateway</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-2.5 h-2.5" /> READY
            </span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Policy Engine</span>
            <span className="text-foreground truncate max-w-[85px]">Gemini 1.5 Pro</span>
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={handleResetSandbox}
          disabled={resetting}
          loading={resetting}
          leadingIcon={<RotateCcw className="w-3 h-3" />}
          className="w-full text-[11px]"
        >
          Reset Sandbox State
        </Button>
      </div>
    </aside>
  );
}
