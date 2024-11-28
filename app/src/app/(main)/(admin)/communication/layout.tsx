"use client";

import { usePathname } from "next/navigation";
import { Navigation } from "./_components/navigation";
import CommunicationSidebar from "./_components/communication-sidebar";

export default function CommunicationLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const shouldShowSidebar =
        pathname?.startsWith("/communication") &&
        !pathname?.startsWith("/communication/teachers") &&
        !pathname?.startsWith("/communication/parents") &&
        !pathname?.startsWith("/communication/messaging");

    const notifications = {
        events: 5,
        birthdays: 12,
        messages: 9,
        updates: 0,
        notifications: 8,
    }; // to be replaced with actual notification count data

    return (
        <div className='min-h-screen bg-emerald-50 p-6'>
            <Navigation />
            <div className='flex w-full gap-6'>
                {shouldShowSidebar && <CommunicationSidebar notifications={notifications} />}
                <div className='flex-1'>
                    {children}
                </div>
            </div>
        </div>
    );
}
