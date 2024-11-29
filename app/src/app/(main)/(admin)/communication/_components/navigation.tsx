"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationLinks = [
    { href: "/communication", label: "Dashboard" },
    { href: "/communication/calendar", label: "Calendar" },
    { href: "/communication/messaging", label: "Messaging" },
    { href: "/communication/events", label: "Events" },

];


export function Navigation() {

    const pathname = usePathname();

    return (
        <div className='mb-4 flex w-full justify-between gap-2'>
            {navigationLinks.map((link) => {

                if (link.href === "/communication/messaging/parents") {
                    return null;
                }

                if (link.href === "/communication/messaging/teachers") {
                    return null;
                }

                return (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-colors ${pathname === link.href
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
