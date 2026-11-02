import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function truncateHash(hash: string, lead: number = 8, trail: number = 6): string {
  if (!hash || hash.length <= lead + trail) return hash || "";
  return `${hash.slice(0, lead)}...${hash.slice(-trail)}`;
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((d.getTime() - now.getTime()) / 1000);

  if (diffInSeconds < 0) {
    const past = Math.abs(diffInSeconds);
    if (past < 60) return `${past}s ago`;
    if (past < 3600) return `${Math.floor(past / 60)}m ago`;
    if (past < 86400) return `${Math.floor(past / 3600)}h ago`;
    return `${Math.floor(past / 86400)}d ago`;
  }

  if (diffInSeconds < 60) return `in ${diffInSeconds}s`;
  if (diffInSeconds < 3600) return `in ${Math.floor(diffInSeconds / 60)}m`;
  if (diffInSeconds < 86400) return `in ${Math.floor(diffInSeconds / 3600)}h`;
  return `in ${Math.floor(diffInSeconds / 86400)}d`;
}

