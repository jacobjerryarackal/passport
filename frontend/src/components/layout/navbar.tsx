"use client";

import Link from "next/link";
import { Shield, Play, Github, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground shadow-xs shadow-primary/25">
            <Shield className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-tight text-sm text-foreground">
              Passport
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-secondary text-muted-foreground border border-border">
              Trust Infrastructure
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-muted-foreground">
          <Link href="/#problem" className="hover:text-foreground transition-colors">
            Problem
          </Link>
          <Link href="/#architecture" className="hover:text-foreground transition-colors">
            Architecture
          </Link>
          <Link href="/#credential" className="hover:text-foreground transition-colors">
            Trust Credential
          </Link>
          <Link href="/#autopsy" className="hover:text-foreground transition-colors">
            Dispute Autopsy
          </Link>
          <Link href="/#security" className="hover:text-foreground transition-colors">
            Security Model
          </Link>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            tabIndex={-1}
          >
            <Button
              variant="outline"
              size="sm"
              leadingIcon={<Github className="w-3.5 h-3.5" />}
              className="hidden sm:inline-flex"
            >
              GitHub
            </Button>
          </a>

          <Link href="/demo" tabIndex={-1}>
            <Button
              variant="secondary"
              size="sm"
              leadingIcon={<Play className="w-3 h-3 fill-current text-primary" />}
            >
              Live Demo
            </Button>
          </Link>

          <Link href="/dashboard" tabIndex={-1}>
            <Button
              variant="primary"
              size="sm"
              trailingIcon={<ArrowRight className="w-3 h-3" />}
            >
              Control Plane
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
