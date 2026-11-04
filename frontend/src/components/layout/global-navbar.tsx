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

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Mandates", href: "/mandates" },
  { name: "Purchases", href: "/purchases" },
  { name: "Passports", href: "/passports" },
  { name: "Disputes", href: "/disputes" },
  { name: "Evidence", href: "/evidence" },
  { name: "Audit", href: "/audit" },
];

export function GlobalNavbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-2 sm:top-3 z-50 w-full max-w-[1400px] mx-auto px-4 sm:px-6">
      <div className="relative rounded-full bg-white/80 dark:bg-[#09090B]/80 backdrop-blur-xl border border-black/5 dark:border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between transition-colors">
        {/* Left: Passport Logo */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-full bg-[#002991] dark:bg-white flex items-center justify-center text-white dark:text-[#002991] font-display font-black text-sm shadow-sm group-hover:scale-105 transition-transform">
              P
            </div>
            <span className="font-display font-black text-lg tracking-tight text-[#1D1E20] dark:text-white">
              Passport
            </span>
          </Link>

          <span className="hidden xl:inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider bg-black/5 dark:bg-white/10 text-[#0070BA] dark:text-[#60CDFF] border border-black/5 dark:border-white/10 uppercase">
            Control Plane
          </span>
        </div>

        {/* Center: Navigation Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname?.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? "bg-black/5 dark:bg-white/10 text-[#0070BA] dark:text-[#60CDFF] font-bold shadow-[inset_0_1px_0_rgba(0,0,0,0.05)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
                    : "text-[#6C7378] dark:text-white/70 hover:text-black dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/10"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Right: Theme Toggle & Compact "Launch Demo" Pill CTA */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle className="w-8 h-8 rounded-full border border-black/10 dark:border-white/15 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-[#1D1E20] dark:text-white flex items-center justify-center transition-colors" />

          <Link href="/demo">
            <span className="inline-flex items-center justify-center px-4 py-2 rounded-full text-xs font-bold text-white bg-[#002991] hover:bg-[#001C64] dark:bg-white dark:text-[#002991] dark:hover:bg-white/90 active:scale-[0.98] transition-all shadow-sm">
              Launch Demo
            </span>
          </Link>

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden w-8 h-8 rounded-full border border-black/10 dark:border-white/15 bg-black/5 dark:bg-white/10 text-[#1D1E20] dark:text-white flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Expandable Glass Panel) */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-2 p-3 rounded-2xl bg-white/95 dark:bg-[#09090B]/95 backdrop-blur-2xl border border-black/10 dark:border-white/15 shadow-2xl flex flex-col gap-1 animate-in fade-in slide-in-from-top-2 duration-150">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname?.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-black/5 dark:bg-white/10 text-[#0070BA] dark:text-[#60CDFF] font-bold"
                    : "text-[#6C7378] dark:text-white/80 hover:text-black dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/10"
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
