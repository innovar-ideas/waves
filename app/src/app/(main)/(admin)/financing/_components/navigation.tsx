"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationLinks = [
  { href: "/financing", label: "Dashboard" },
  { href: "/financing/income", label: "Income" },
  { href: "/financing/expenses", label: "Expenses" },
  { href: "/financing/budget", label: "Budget" },
  { href: "/financing/cash-flow", label: "Cash Flow" },
  { href: "/financing/chart-of-accounts", label: "Chart of Accounts" },
  { href: "/financing/bills", label: "Bills" },
  { href: "/financing/invoices", label: "Invoices" },

];

export function Navigation() {
  const pathname = usePathname();

  return (
    <div className='mb-4 flex w-full flex-wrap gap-3 md:justify-between'>
      {navigationLinks.map((link) => {
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`inline-flex h-12 flex-1 items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-colors ${
              pathname === link.href
                ? "bg-white text-emerald-700"
                : "bg-emerald-500 text-white hover:bg-emerald-600"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}
