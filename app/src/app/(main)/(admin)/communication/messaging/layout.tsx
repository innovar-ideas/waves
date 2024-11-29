"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Inbox,
  FileText,
  Users,
  Send,
  Trash2,
  AlertCircle,
  MessageCircle,
  Plus,
  Mail,
  MessageSquare,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { trpc } from "@/app/_providers/trpc-provider";
// import useActiveOrganizationStore from "@/store/active-organization.store";
import { useRouter } from "next/navigation";
// import { SCHOOL_PERMISSIONS } from "@/lib/constants";
// import { usePagePermissionCheck } from "@/lib/helper-function";
import useActiveOrganizationStore from "@/app/server/store/active-organization.store";

export default function MessageSidebar({
  children
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const { organizationSlug } = useActiveOrganizationStore();
  const router = useRouter();
  const { data: unreadCount } = trpc.getUnreadMessageCount.useQuery({
    organizationSlug
  });

  const { data: draftCount } = trpc.getDraftCount.useQuery({
    organizationSlug
  });

  // const hasManageBroadcastPermission = usePagePermissionCheck(SCHOOL_PERMISSIONS.MANAGE_BROADCAST);
  // const isOwner = usePagePermissionCheck(SCHOOL_PERMISSIONS.OWNER);
  // const isParent = usePagePermissionCheck(SCHOOL_PERMISSIONS.GUARDIAN);

  // const shouldShowBroadcastLink = isOwner || hasManageBroadcastPermission;

  return (
    <div className="flex h-[calc(100vh-65px)]">
      <div className="w-64">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="w-full mt-4 h-12 mb-6 bg-primaryTheme-500 hover:bg-primaryTheme-600 text-white">
              <Plus className="mr-2 h-4 w-4" />
              New Message
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[200px]">
            <DropdownMenuItem onClick={() => router.push("/communication/messaging/new-chat")}>
              <MessageSquare className="mr-2 h-4 w-4" />
              New Chat
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/communication/messaging/new-broadcast")}>
              <Mail className="mr-2 h-4 w-4" />
              New Broadcast
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/communication/messaging/new-complaint")}>
              <Mail className="mr-2 h-4 w-4" />
              New Complaint
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/communication/messaging/new-feedback")}>
              <Mail className="mr-2 h-4 w-4" />
              New Feedback
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <nav className="bg-white w-full h-[68%] rounded-lg">
          <Link href="/communication/messaging" className="block mb-5">
            <Button
              variant="ghost"
              className={`w-full justify-start px-4 py-3 border-b border-gray-200 ${pathname === "/communication/messaging" ? "bg-primaryTheme-200" : ""
                }`}
            >
              <Inbox className="mr-3 h-5 w-5 text-muted-foreground" />
              Inbox
              {(unreadCount ?? 0) > 0 && (
                <span className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-primaryTheme-500 text-xs text-white">
                  {unreadCount}
                </span>
              )}
            </Button>
          </Link>
          <Link href="/communication/messaging/draft" className="block mb-5">
            <Button
              variant="ghost"
              className={`w-full justify-start px-4 py-3 border-b border-gray-200 hover:bg-primaryTheme-200 ${pathname === "/communication/messaging/draft" ? "bg-primaryTheme-200" : ""
                }`}
            >
              <FileText className="mr-3 h-5 w-5 text-muted-foreground" />
              Drafts
              {(draftCount ?? 0) > 0 && (
                <span className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-primaryTheme-500 text-xs text-white">
                  {draftCount}
                </span>
              )}
            </Button>
          </Link>
          <Link href="/communication/messaging/groups" className="block mb-5">
            <Button
              variant="ghost"
              className={`w-full justify-start px-4 py-3 border-b border-gray-300 hover:bg-primaryTheme-200 ${pathname === "/communication/messaging/groups" ? "bg-primaryTheme-200" : ""
                }`}
            >
              <Users className="mr-3 h-5 w-5 text-muted-foreground" />
              Groups
            </Button>
          </Link>
          <Link href="/communication/messaging/sent" className="block mb-5">
            <Button
              variant="ghost"
              className={`w-full justify-start px-4 py-3 border-b border-gray-300 hover:bg-primaryTheme-200 ${pathname === "/communication/messaging/sent" ? "bg-primaryTheme-200" : ""
                }`}
            >
              <Send className="mr-3 h-5 w-5 text-muted-foreground" />
              Sent
            </Button>
          </Link>
          <Link href="/communication/messaging/trash" className="block mb-5">
            <Button
              variant="ghost"
              className={`w-full justify-start px-4 py-3 border-b border-gray-300 hover:bg-primaryTheme-200 ${pathname === "/communication/messaging/trash" ? "bg-primaryTheme-200" : ""
                }`}
            >
              <Trash2 className="mr-3 h-5 w-5 text-muted-foreground" />
              Trash
            </Button>
          </Link>
          <Link href="/communication/messaging/complaints" className="block mb-5">
            <Button
              variant="ghost"
              className={`w-full justify-start px-4 py-3 border-b border-gray-300 hover:bg-primaryTheme-200 ${pathname === "/communication/messaging/complaints" ? "bg-primaryTheme-200" : ""
                }`}
            >
              <AlertCircle className="mr-3 h-5 w-5 text-muted-foreground" />
              Complaints Desk
            </Button>
          </Link>
          <Link href="/communication/messaging/feedback" className="block mb-5">
            <Button
              variant="ghost"
              className={`w-full justify-start px-4 py-3 ${pathname === "/communication/messaging/feedback" ? "bg-primaryTheme-200" : ""
                }`}
            >
              <MessageCircle className="mr-3 h-5 w-5 text-muted-foreground" />
              Feedback Desk
            </Button>
          </Link>
        </nav>
      </div>

      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}

