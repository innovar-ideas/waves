"use client";

import { trpc } from "@/app/_providers/trpc-provider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Chat, Message, MessageType, User } from "@prisma/client";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import useActiveOrganizationStore from "@/app/server/store/active-organization.store";

export default function GroupsPage() {
  const router = useRouter();
  const { organizationSlug } = useActiveOrganizationStore();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const session = useSession();

  const { data: groupChats } = trpc.getGroupChats.useQuery({
    organizationSlug
  });

  const markMessagesAsRead = trpc.markMessagesAsRead.useMutation();

  const handleChatClick = (chatId: string) => {
    markMessagesAsRead.mutate({
      chatId,
      userId: session.data?.user.id || ""
    });
    router.push(`/communication/messaging/groups/${chatId}`);
  };

  const filteredGroupChats = groupChats?.filter(chat => {
    const searchLower = debouncedSearch.toLowerCase();
    return chat.members.some(member =>
      `${member.user.first_name} ${member.user.last_name}`
        .toLowerCase()
        .includes(searchLower)
    );
  });

  const getLastMessage = (chat: Chat & { messages: (Message & { sender: User })[] }) => {
    if (!chat.messages.length) return "No messages yet";
    const lastMessage = chat.messages?.[0];
    const senderName = lastMessage.sender_id === session.data?.user.id ? "me" : `${lastMessage.sender.first_name} ${lastMessage.sender.last_name}`;
    if (lastMessage.message_type === MessageType.TEXT) {
      return `${senderName}: ${lastMessage.content as string}`;
    }
    return `${senderName}: Attachment`;
  };

  function getUnreadCount(chat: Chat & { messages: Message[] }) {
    return chat.messages.filter(message =>
      message.sender_id !== session.data?.user.id && !message.read
    ).length;
  }

  const getLastMessageTimeStyle = (chat: Chat & { messages: Message[] }) => {
    const lastMessage = chat.messages?.[0];
    if (lastMessage && lastMessage.sender_id !== session.data?.user.id && !lastMessage.read) {
      return "text-primaryTheme-500 font-semibold";
    }
    return "text-muted-foreground";
  };

  return (
    <div className="flex h-[calc(100vh-65px)] flex-col ">
      <div className="border-b bg-white p-4">
        <Input
          placeholder="Search group chats..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl pl-4 pr-10 h-12 shadow-sm"
        />
      </div>

      <ScrollArea className="flex-1 bg-white rounded-lg mx-4 my-2 shadow-sm max-h-[calc(70vh-65px)]">
        <div className="space-y-2">
          {filteredGroupChats?.map((chat) => (
            <div
              key={chat.id}
              className="p-4 cursor-pointer"
              onClick={() => handleChatClick(chat.id)}
            >
              <div className="flex items-center gap-2 border-b border-gray-300 pb-2 hover:bg-accent">
                <Avatar>
                  <AvatarImage src="" />
                  <AvatarFallback>
                    {chat.name?.[0] || ""}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium truncate text-base">
                      {chat.name}
                      {getUnreadCount(chat) > 0 && (
                        <Badge className="ml-2 items-center justify-center bg-primaryTheme-500 text-white rounded-full h-6 w-6 text-xs">
                          {getUnreadCount(chat)}
                        </Badge>
                      )}
                    </h3>
                    {chat.messages[0] && (
                      <span className={`text-sm ${getLastMessageTimeStyle(chat)}`}>
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