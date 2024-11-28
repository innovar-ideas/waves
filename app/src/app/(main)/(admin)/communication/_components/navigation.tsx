"use client";

// import { SCHOOL_PERMISSIONS } from "@/lib/constants";
// import { usePagePermissionCheck } from "@/lib/helper-function";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationLinks = [
    { href: "/communication", label: "Dashboard" },
    { href: "/communication/calendar", label: "Calendar" },
    { href: "/communication/messaging", label: "Messaging" },
    { href: "/communication/messaging/parents", label: "Parents" },
    { href: "/communication/messaging/teachers", label: "Teachers" },
    { href: "/communication/events", label: "Events" },
    // { href: "/communication/newsletter", label: "Newsletter & Blog" },
    // { href: "/communication/assignment", label: "Assignment & Ticket Out" },

];


export function Navigation() {

    //   const hasManageParentMessagingPermission = usePagePermissionCheck(SCHOOL_PERMISSIONS.MANAGE_PARENT_MESSAGING);
    //   const hasManageTeacherMessagingPermission = usePagePermissionCheck(SCHOOL_PERMISSIONS.MANAGE_TEACHER_MESSAGING);
    //   const isOwner = usePagePermissionCheck(SCHOOL_PERMISSIONS.OWNER);
    const pathname = usePathname();





    //   const shouldShowParentLink = isOwner || hasManageParentMessagingPermission;
    //   const shouldShowTeacherLink = isOwner || hasManageTeacherMessagingPermission;

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
