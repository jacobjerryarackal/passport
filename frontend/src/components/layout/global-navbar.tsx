"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { Menu, X } from "lucide-react";

export interface NavItem {
  name: string;
  href: string;
}

const defaultAppNavItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Mandates", href: "/mandates" },
  { name: "Purchases", href: "/purchases" },
  { name: "Passports", href: "/passports" },
  { name: "Disputes", href: "/disputes" },
  { name: "Evidence", href: "/evidence" },
  { name: "Audit", href: "/audit" },
];

const landingNavItems: NavItem[] = [
  { name: "The problem", href: "#problem" },
  { name: "How it works", href: "#how-it-works" },
  { name: "Dispute defense", href: "#dispute-defense" },
  { name: "Dashboard", href: "/dashboard" },
];

export interface GlobalNavbarProps {
  items?: NavItem[];
}

export function GlobalNavbar({ items }: GlobalNavbarProps = {}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLanding = pathname === "/";
  const navItems = items || (isLanding ? landingNavItems : defaultAppNavItems);

  return (
    <header className="fixed top-4 inset-x-0 z-50 w-full max-w-[1400px] mx-auto px-4 sm:px-6 pointer-events-none">
      <div className="pointer-events-auto relative rounded-full bg-white/80 dark:bg-[#09090B]/80 backdrop-blur-xl border border-black/5 dark:border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between transition-colors">
        {/* Left: Passport Logo & Text - Always Links to "/" */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group" title="Return to Landing Page">
            <div className="w-8 h-8 rounded-full bg-[#0070BA] dark:bg-white flex items-center justify-center text-white dark:text-[#002991] font-display font-black text-sm shadow-sm group-hover:scale-105 transition-transform">
              P
            </div>
            <span className="font-display font-black text-lg tracking-tight text-[#0A2540] dark:text-white">
              Passport
            </span>
          </Link>

          <span className="hidden xl:inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider bg-black/5 dark:bg-white/10 text-[#0070BA] dark:text-[#60CDFF] border border-black/5 dark:border-white/10 uppercase">
            {isLanding ? "Trust Protocol" : "Control Plane"}
          </span>
        </div>

        {/* Center: Navigation Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navItems.map((item) => {
            const isAnchor = item.href.startsWith("#");
            const isActive =
              !isAnchor &&
              (pathname === item.href ||
                (item.href !== "/dashboard" && pathname?.startsWith(item.href)));

            if (isAnchor) {
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#6C7378] dark:text-white/70 hover:text-[#0A2540] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/10 transition-all duration-150"
                >
                  {item.name}
                </a>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? "bg-black/5 dark:bg-white/10 text-[#0070BA] dark:text-[#60CDFF] font-bold shadow-[inset_0_1px_0_rgba(0,0,0,0.05)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
                    : "text-[#6C7378] dark:text-white/70 hover:text-[#0A2540] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/10"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Right: Theme Toggle & Compact Pill CTA */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle className="w-8 h-8 rounded-full border border-black/10 dark:border-white/15 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-[#0A2540] dark:text-white flex items-center justify-center transition-colors" />

          {pathname === "/demo" ? (
            <Link href="/dashboard">
              <span className="inline-flex items-center justify-center px-4 py-2 rounded-full text-xs font-bold text-white bg-[#0070BA] hover:bg-[#005a96] dark:bg-white dark:text-[#002991] dark:hover:bg-white/90 active:scale-[0.98] transition-all shadow-sm">
                Dashboard
              </span>
            </Link>
          ) : (
            <Link href="/demo">
              <span className="inline-flex items-center justify-center px-4 py-2 rounded-full text-xs font-bold text-white bg-[#0070BA] hover:bg-[#005a96] dark:bg-white dark:text-[#002991] dark:hover:bg-white/90 active:scale-[0.98] transition-all shadow-sm">
                Launch Demo
              </span>
            </Link>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden w-8 h-8 rounded-full border border-black/10 dark:border-white/15 bg-black/5 dark:bg-white/10 text-[#0A2540] dark:text-white flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Expandable Glass Panel) */}
      {mobileMenuOpen && (
        <div className="pointer-events-auto lg:hidden mt-2 p-3 rounded-2xl bg-white/95 dark:bg-[#09090B]/95 backdrop-blur-2xl border border-black/10 dark:border-white/15 shadow-2xl flex flex-col gap-1 animate-in fade-in slide-in-from-top-2 duration-150">
          {navItems.map((item) => {
            const isAnchor = item.href.startsWith("#");
            const isActive =
              !isAnchor &&
              (pathname === item.href ||
                (item.href !== "/dashboard" && pathname?.startsWith(item.href)));

            if (isAnchor) {
              return (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[#6C7378] dark:text-white/80 hover:text-[#0A2540] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/10 transition-all"
                >
                  {item.name}
                </a>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-black/5 dark:bg-white/10 text-[#0070BA] dark:text-[#60CDFF] font-bold"
                    : "text-[#6C7378] dark:text-white/80 hover:text-[#0A2540] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/10"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}

export { GlobalNavbar as Navbar };
