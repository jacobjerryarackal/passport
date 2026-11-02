"use client";

import Link from "next/link";
import { Shield, Sparkles, Play, ArrowRight, Github } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-primary-900 flex items-center justify-center text-white shadow-sm shadow-primary/20 group-hover:scale-105 transition-transform">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold tracking-tight text-lg text-foreground flex items-center gap-1.5">
              Passport
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-primary-500/10 text-primary-600 dark:text-primary-400 font-semibold border border-primary-500/20">
                AI + PayPal
              </span>
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <Link href="#problem" className="hover:text-foreground transition-colors">
            Problem
          </Link>
          <Link href="#how-it-works" className="hover:text-foreground transition-colors">
            How It Works
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

        <div className="flex items-center gap-3">
          <ThemeToggle />
          
          <Link
            href="/demo"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-medium text-foreground transition-all hover:scale-[1.02]"
          >
            <Play className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400 fill-current" />
            Interactive Demo
          </Link>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-xs sm:text-sm font-medium shadow-sm shadow-primary/25 transition-all hover:scale-[1.02]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Launch App
            <ArrowRight className="w-3.5 h-3.5 hidden sm:inline" />
          </Link>
        </div>
      </div>
    </header>
  );
}

