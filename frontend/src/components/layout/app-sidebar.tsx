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

  const handleResetDemo = async () => {
    if (confirm("Reset demo data to initial hackathon scenario?")) {
      setResetting(true);
      try {
        const res = await fetch("/api/demo/reset", { method: "POST" });
        if (res.ok) {
          window.location.reload();
        }
      } catch (err) {
        console.error("Failed to reset demo:", err);
      } finally {
        setResetting(false);
      }
    }
  };

  return (
    <aside className="w-60 border-r border-border bg-[#0C0C0F] dark:bg-[#09090B] flex flex-col justify-between h-screen sticky top-0 shrink-0">
      <div className="p-3.5 space-y-5">
        {/* Brand */}
        <div className="flex items-center justify-between pb-3 border-b border-border/80">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-[#0070BA] flex items-center justify-center text-white shadow-sm shadow-[#0070BA]/20">
              <Shield className="w-3.5 h-3.5 text-white" />
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
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
            Sandbox
          </span>
        </div>

        {/* Guided Tour Banner */}
        <Link
          href="/demo"
          className="flex items-center justify-between p-2 rounded-md bg-[#0070BA]/10 border border-[#0070BA]/25 hover:bg-[#0070BA]/15 transition-colors group"
        >
          <div className="flex items-center gap-2">
            <PlayCircle className="w-3.5 h-3.5 text-[#0070BA] dark:text-[#38BDF8]" />
            <span className="text-xs font-semibold text-[#0070BA] dark:text-[#38BDF8]">
              Guided Demo Tour
            </span>
          </div>
          <ChevronRight className="w-3 h-3 text-[#0070BA] dark:text-[#38BDF8] group-hover:translate-x-0.5 transition-transform" />
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
                  "flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors",
                  isActive
                    ? "bg-[#0070BA] text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-surfaceSubtle"
                )}
              >
                <div className="flex items-center gap-2">
                  <Icon className={cn("w-3.5 h-3.5", isActive ? "text-white" : "text-muted-foreground")} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={cn(
                      "text-[9px] px-1.5 py-0.2 rounded font-mono font-bold",
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-amber-500/15 text-amber-400 border border-amber-500/20"
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

      {/* Footer Controls */}
      <div className="p-3.5 border-t border-border/80 space-y-2.5">
        <div className="rounded p-2 bg-surfaceSubtle border border-border/80 text-[10px] space-y-1 font-mono">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>PayPal Gateway</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-2.5 h-2.5" /> LIVE
            </span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Agent Toolkit</span>
            <span className="text-primary-400 truncate max-w-[85px]">mcp.sandbox</span>
          </div>
        </div>

        <button
          onClick={handleResetDemo}
          disabled={resetting}
          className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded border border-border/80 bg-surfaceSubtle hover:bg-muted text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          <RotateCcw className={cn("w-3 h-3", resetting && "animate-spin")} />
          <span>{resetting ? "Resetting..." : "Reset Scenario Data"}</span>
        </button>
      </div>
    </aside>
  );
}
