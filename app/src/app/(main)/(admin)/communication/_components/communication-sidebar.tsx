"use client";

import React, { useState } from "react";
import { Bell, FileText, Layout, MessageSquare, Settings, Calendar, Cake } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItemProps = {
    icon: React.ReactNode;
    label: string;
    badgeCount?: number;
    children?: React.ReactNode;
    href?: string;
    isDefaultOpen?: boolean;
};

type SidebarProps = {
    notifications: {
        events: number;
        birthdays: number;
        messages: number;
        updates: number;
        notifications: number;
    };
};

const NavItem = ({ icon, label, badgeCount, children, href, isDefaultOpen = false }: NavItemProps) => {
    const [isOpen, setIsOpen] = useState(isDefaultOpen);
    const hasChildren = Boolean(children);
    const pathname = usePathname();
    const isActive = href ? pathname === href : false;

    const ButtonContent = () => (
        <div className='flex items-center gap-3'>
            {icon}
            <span className='text-sm font-medium'>{label}</span>
            {hasChildren && (
                <ChevronDown className={`ml-2 h-4 w-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
            )}
        </div>
    );

    return (
        <div className='space-y-1'>
            {href ? (
                <Link href={href} className='block'>
                    <Button
                        variant='ghost'
                        className={`w-full justify-between rounded-lg px-3 py-2 text-left hover:bg-gray-100 ${isActive ? "bg-gray-100" : ""}`}
                    >
                        <ButtonContent />
                        {badgeCount !== undefined && (
                            <Badge className='ml-auto bg-emerald-600 hover:bg-emerald-600'>{badgeCount}</Badge>
                        )}
                    </Button>
                </Link>
            ) : (
                <Button
                    variant='ghost'
                    className='w-full justify-between rounded-lg px-3 py-2 text-left hover:bg-gray-100'
                    onClick={() => hasChildren && setIsOpen(!isOpen)}
                >
                    <ButtonContent />
                    {badgeCount !== undefined && (
                        <Badge className='ml-auto bg-emerald-600 hover:bg-emerald-600'>{badgeCount}</Badge>
                    )}
                </Button>
            )}
            {hasChildren && isOpen && <div className='ml-2'>{children}</div>}
        </div>
    );
};

const CommunicationSidebar = ({ notifications }: SidebarProps) => {
    return (
        <div className='w-72 rounded-2xl bg-white p-4 shadow-sm'>
            <div className='space-y-1'>
                <NavItem
                    icon={<Calendar className='h-5 w-5 text-gray-600' />}
                    label='Calendar'
                    href='/communication'
                    isDefaultOpen={true}
                >
                    <NavItem
                        icon={<Calendar className='h-5 w-5 text-gray-600' />}
                        label='Upcoming Events'
                        badgeCount={notifications.events}
                        href='/communication?view=events'
                    />
                    <NavItem
                        icon={<Cake className='h-5 w-5 text-gray-600' />}
                        label='Birthdays'
                        badgeCount={notifications.birthdays}
                        href='/communication?view=birthdays'
                    />
                </NavItem>

                <NavItem
                    icon={<MessageSquare className='h-5 w-5 text-gray-600' />}
                    label='Unread Messages'
                    badgeCount={notifications.messages}
                    href='/communication/messaging'
                />

                <NavItem
                    icon={<Layout className='h-5 w-5 text-gray-600' />}
                    label='Classroom Updates'
                    badgeCount={notifications.updates}
                    href='/communication/updates'
                />

                <NavItem
                    icon={<Bell className='h-5 w-5 text-gray-600' />}
                    label='Notifications'
                    badgeCount={notifications.notifications}
                    href='/communication/notifications'
                />

                <NavItem
                    icon={<FileText className='h-5 w-5 text-gray-600' />}
                    label='Newsletter & Blog'
                    href='/communication/newsletter'
                />

                <NavItem
                    icon={<Settings className='h-5 w-5 text-gray-600' />}
                    label='Settings'
                    href='/communication/settings'
                />
            </div>
        </div>
    );
};

export default CommunicationSidebar;
