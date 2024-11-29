"use client";

import { trpc } from "@/app/_providers/trpc-provider";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Chat, ChatMember, Message, MessageType, User } from "@prisma/client";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import useActiveOrganizationStore from "@/app/server/store/active-organization.store";
import { useDebounce } from "@/hooks/use-debounce";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function MessagingPage() {
  const router = useRouter();
  const { organizationSlug } = useActiveOrganizationStore();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const session = useSession();

  const { data: chats } = trpc.getUserChats.useQuery({
    organizationSlug
  }, {
    refetchInterval: 5000 // Poll every 5 seconds
  });

  const markMessagesAsRead = trpc.markMessagesAsRead.useMutation();

  const handleChatClick = (chatId: string) => {
    markMessagesAsRead.mutate({
      chatId,
      userId: session.data?.user.id || ""
    });
    router.push(`/communication/messaging/${chatId}`);
  };

  const filteredChats = chats?.filter(chat => {
    const searchLower = debouncedSearch.toLowerCase();
    // For direct chats, search in member names
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

  const getChatName = (chat: Chat & { messages: Message[], members: (ChatMember & { user: User })[] }) => {
    const otherMember = chat.members.find(m => m.user_id !== session.data?.user.id);
    return `${otherMember?.user.first_name} ${otherMember?.user.last_name}`;
  };

  function getUnreadCount(chat: Chat & { messages: Message[] }) {
    return chat.messages.filter(message => message.sender_id !== session.data?.user.id && !message.read).length;
  }

  const getLastMessageTimeStyle = (chat: Chat & { messages: Message[] }) => {
    const lastMessage = chat.messages?.[0];
    if (lastMessage && lastMessage.sender_id !== session.data?.user.id && !lastMessage.read) {
      return "text-primaryTheme-500 font-semibold";
    }
    return "text-muted-foreground";
  };

  return (
    <div className="flex flex-col h-[calc(100vh-65px)]">
      <div className="p-4">
        <Input
          placeholder="Search chats..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-12 rounded-xl  "
        />
      </div>

      <ScrollArea className="flex-1 bg-white rounded-xl mx-4 my-2 border-1 border-gray-400 max-h-[calc(70vh-65px)]">
        <div className="space-y-2 ">
          {filteredChats?.map((chat) => (
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
                      {getUnreadCount(chat) > 0 && (
                        <Badge className="ml-2 items-center justify-center bg-primaryTheme-500 text-white rounded-full h-6 w-6  text-xs">
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