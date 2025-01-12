import { redirect } from "next/navigation";
import { TbReceiptTax } from "react-icons/tb";
import { PageRole, pageRoleMapping, pages } from "@/lib/constants";
import { auth } from "@/auth";
import MobileNav from "@/components/molecules/app-shell/mobile-nav";
import Link from "next/link";
import Image from "next/image";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  if (!session?.user) redirect(pages.login.pathname);

  const userRoles = session.user.roles?.map(({ role_name }) => role_name) ?? [];
  const userPages = pageRoleMapping[userRoles[0] as PageRole];

  return (
    <div className='grid h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]'>
      <div className='hidden border-r bg-muted/40 md:block'>
        <div className='flex h-full max-h-screen flex-col gap-2'>
          <div className='flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6'>
            <Link href={userPages[0].pathname} className='flex items-center gap-2'>
              <TbReceiptTax className='hidden h-6 w-6' />
              <div>
                <div className="flex items-end gap-1 justify-start my-2">
                  {session.user.organization?.slug === "okoh" ? 
                  <Image src="/okoh.jpeg" alt="Innovar Ideas" width={40} height={20} /> :
                  session.user.organization?.slug === "innovar" ?
                   <Image src="/innovar.png" alt="Okoh ERP Software" width={40} height={28} /> : ""}
                  <div className='truncate font-mono font-semibold'>{session.user.organization?.name}</div>
                </div>
                <div className='truncate text-xs capitalize mb-2'>{session.user.roles?.[0].role_name}</div>
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
