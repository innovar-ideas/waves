"use client";

import { trpc } from "@/app/_providers/trpc-provider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Chat, ChatMember, Message, MessageType, User } from "@prisma/client";
import { useSession } from "next-auth/react";
import useActiveOrganizationStore from "@/app/server/store/active-organization.store";

export default function TrashPage() {
  const router = useRouter();
  const { organizationSlug } = useActiveOrganizationStore();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const session = useSession();

  const { data: trashedMessages } = trpc.getTrashedMessages.useQuery({
    organizationSlug
  });

  const handleChatClick = (chatId: string) => {
    router.push(`/communication/messaging/${chatId}`);
  };

  const filteredTrashedMessages = trashedMessages?.filter(chat => {
    const searchLower = debouncedSearch.toLowerCase();
    return chat.members.some(member =>
      `${member.user.first_name} ${member.user.last_name}`
        .toLowerCase()
        .includes(searchLower)
    );
  });

  const getLastMessage = (chat: Chat & { messages: Message[] }) => {
    if (!chat.messages.length) return "No messages yet";
    const lastMessage = chat.messages?.[0];
    if (lastMessage.message_type === MessageType.TEXT) {
      return lastMessage.content as string;
    }
    return "Attachment";
  };

  const getChatName = (chat: Chat & { messages: Message[], members: (ChatMember & { user: User })[] }) => {
    const otherMember = chat.members.find(m => m.user_id !== session.data?.user.id);
    return `${otherMember?.user.first_name} ${otherMember?.user.last_name}`;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-65px)]">
      <div className="p-4">
        <Input
          placeholder="Search trashed messages..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-12 shadow-sm"
        />
      </div>

      <ScrollArea className="flex-1 bg-white rounded-lg mx-4 my-2 shadow-sm max-h-[calc(70vh-65px)]">
        <div className="space-y-2 ">
          {filteredTrashedMessages?.map((chat) => (
            <div
              key={chat.id}
              className="p-4  cursor-pointer"
              onClick={() => handleChatClick(chat.id)}
            >
              <div className="flex items-center gap-4 border-b border-gray-300 pb-2 hover:bg-accent">
                <Avatar>
                  <AvatarImage src="" />
                  <AvatarFallback>
                    {getChatName(chat)?.[0] || ""}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium truncate text-base">
                      {getChatName(chat)}
                    </h3>
                    {chat.messages[0] && (
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(chat.messages[0].created_at), "HH:mm")}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {getLastMessage(chat)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
} 