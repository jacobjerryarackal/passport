"use client";

import Link from "next/link";
import { Shield, Play, Github, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-md bg-[#0070BA] flex items-center justify-center text-white shadow-sm shadow-[#0070BA]/25">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-tight text-sm text-foreground">
              Passport
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surfaceSubtle text-muted-foreground border border-border">
              PayPal AI
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-muted-foreground">
          <Link href="#problem" className="hover:text-foreground transition-colors">
            Problem
          </Link>
          <Link href="#how-it-works" className="hover:text-foreground transition-colors">
            Architecture
          </Link>
          <Link href="#trust-passport" className="hover:text-foreground transition-colors">
            Trust Passport
          </Link>
          <Link href="#chargeback-autopsy" className="hover:text-foreground transition-colors">
            Chargeback Autopsy
          </Link>
          <Link href="#security" className="hover:text-foreground transition-colors">
            Security Model
          </Link>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <ThemeToggle />

          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-surfaceSubtle hover:bg-muted text-xs font-medium text-foreground transition-colors"
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub</span>
          </a>

          <Link
            href="/demo"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#0070BA]/40 bg-[#0070BA]/10 hover:bg-[#0070BA]/20 text-xs font-semibold text-[#0070BA] dark:text-[#38BDF8] transition-colors"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Live Demo</span>
          </Link>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#0070BA] hover:bg-[#005EA6] text-white text-xs font-semibold shadow-sm shadow-[#0070BA]/20 transition-all"
          >
            <span>Control Plane</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </header>
  );
}
