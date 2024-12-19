"use client";

import { redirect } from "next/navigation";
import { TbReceiptTax } from "react-icons/tb";
import { Page, PageRole, pageRoleMapping, pages } from "@/lib/constants";
import MobileNav from "@/components/molecules/app-shell/mobile-nav";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = useSession();
  if (!session?.data?.user) redirect(pages.login.pathname);

  const userRoles = session.data?.user?.roles?.map(({ role_name }) => role_name) ?? [];
  const userPages: Page[] = [];

  for (let i = 0; i < userRoles.length; i++) {
    const pages = pageRoleMapping[userRoles[i] as PageRole];
    userPages.push(...pages);
  }
  const pathname = usePathname();

  if(pathname.includes("/performance-review") || pathname.includes("/performance-review-template")){
    const sidebarLinks = [
      {
        label: "Performance Review",
        href: "/performance-review",
        icon: "FileText",
      },
      {
        label: "Performance Review Template",
        href: "/performance-review-template",
        icon: "FileText",
      }
    ];
    return (
      <div className="flex min-h-screen">
        <aside className="w-64 bg-white border-r border-gray-200">
          <nav className="p-4">
            <div className="mb-4 px-4 py-2 font-semibold text-gray-800">
               Performance Management
            </div>
            <Link href="/admin/dashboard" className="mb-4 px-4 py-2 font-semibold text-gray-800">
              Home
            </Link>
            <ul className="space-y-2">
              {sidebarLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`block px-4 py-2 rounded-md transition-colors ${
                      pathname === link.href
                        ? "bg-green-50 text-green-600"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    );
  }
  if(pathname.includes("/manage-leave-application") || pathname.includes("/leave-application-settings")){
    const sidebarLinks = [
      {
        label: "Leave Application",
        href: "/manage-leave-application",
        icon: "FileText",
      },
      {
        label: "Leave Settings",
        href: "/leave-application-settings",
        icon: "FileText",
      }
    ];
    return (
      <div className="flex min-h-screen">
        <aside className="w-64 bg-white border-r border-gray-200">
          <nav className="p-4">
            <div className="mb-4 px-4 py-2 font-semibold text-gray-800">
              Leave Management
            </div>
            <Link href="/admin/dashboard" className="mb-4 px-4 py-2 font-semibold text-gray-800">
              Home
            </Link>
            <ul className="space-y-2">
              {sidebarLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`block px-4 py-2 rounded-md transition-colors ${
                      pathname === link.href
                        ? "bg-green-50 text-green-600"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    );
  }

  if (pathname.includes("/loan-settings") || pathname.includes("/manage-loan") || pathname.includes("/loan-repayment")) {
    const sidebarLinks = [
      {
        label: "Loan Repayment",
        href: "/loan-repayment",
        icon: "ChartBar",
      },
      {
        label: "Loan Management",
        href: "/manage-loan",
        icon: "FileText",
      },
      {
        label: "Loan Settings",
        href: "/loan-settings",
        icon: "FileText",
      }
    ];

    return (
      <div className="flex min-h-screen">
        <aside className="w-64 bg-white border-r border-gray-200">
          <nav className="p-4">
            <div className="mb-4 px-4 py-2 font-semibold text-gray-800">
              Loan Management
            </div>
            <Link href="/admin/dashboard" className="mb-4 px-4 py-2 font-semibold text-gray-800">
              Home
            </Link>
            <ul className="space-y-2">
              {sidebarLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`block px-4 py-2 rounded-md transition-colors ${
                      pathname === link.href
                        ? "bg-green-50 text-green-600"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className='grid h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]'>
      <div className='hidden border-r bg-muted/40 md:block'>
        <div className='flex h-full max-h-screen flex-col gap-2'>
          <div className='flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6'>
            <Link href={userPages[0].pathname} className='flex items-center gap-2'>
              <TbReceiptTax className='hidden h-6 w-6' />
              <div>
                <div className='truncate font-mono font-semibold'>Starter App</div>
                <div className='truncate text-xs capitalize'>{session.data?.user?.roles?.[0].role_name}</div>
              </div>
            </Link>
          </div>
          <div className='flex-1'>
            <nav className='grid items-start px-2 text-sm font-medium lg:px-4'>
              {userPages.map((page) => (
                <Link
                  key={page.pathname}
                  href={page.pathname}
                  className='flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-green-50 hover:text-green-600'
                >
                  <div className='size-5'>{page.icon}</div>
                  {page.title}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
      <div className='relative flex h-[calc(100svh-61px)] flex-col overflow-y-auto lg:h-svh'>
        <main className='flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6'>{children}</main>
        <MobileNav pages={userPages.slice(0, 4)} />
      </div>
    </div>
  );
}
