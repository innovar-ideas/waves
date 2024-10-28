import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(input?: number | string): string {
  return Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(
    Number(input ?? 0)
  );
}

export function groupVoucherNumber(voucher: string) {
  const groups: string[] = [];
  for (let i = 0; i < voucher.length; i += 4) {
    groups.push(voucher.substring(i, i + 4));
  }

  return groups;
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    // hour: "2-digit",
    // minute: "2-digit",
    // hour12: true
  }).format(date);
}
