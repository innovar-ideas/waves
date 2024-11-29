"use client";

import { ArrowLeft, Info, Paperclip, Phone, Send, Star } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MessageType } from "@prisma/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trpc } from "@/app/_providers/trpc-provider";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

export default function ChatPage() {
  const session = useSession();
  const params = useParams();
  const chatId = params.id as string;
  const [message, setMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { data: chat, isLoading } = trpc.getChatMessages.useQuery(
    {
      chatId,
      limit: 50,
      cursor: undefined,
    },
    {
      refetchInterval: 3000, // Poll every 3 seconds
    }
  );

  const sendMessage = trpc.sendMessage.useMutation({
    onSuccess: () => {
      setMessage("");
    },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat?.messages]);

  const handleSend = () => {
    if (!message.trim()) return;

    sendMessage.mutate({
      chatId,
      content: message,
      messageType: MessageType.TEXT,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-[calc(100vh-65px)] flex-col ">
      {/* Search Bar */}

      <div className="relative mx-4 mt-4 mb-2 ">
        <Input
          className="w-full rounded-xl pl-4 pr-10 h-12 shadow-sm"
          placeholder="Search here..."
          type="search"
        />
        <svg
          className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
          fill="none"
          height="24"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width="24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </div>


      <div className="bg-white rounded-xl shadow-sm m-4 h-[calc(70.5vh-65px)] flex flex-col">
        {/* Chat Header */}
        <div className="flex items-center justify-between  px-4 py-2 m-4 rounded-xl ">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar>
                  <AvatarImage src="/placeholder.svg?height=40&width=40" />
                  <AvatarFallback>
                    {chat?.messages[0]?.sender.first_name?.[0]}
                    {chat?.messages[0]?.sender.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
              </div>
              <div>
                <h2 className="font-semibold">{chat?.chat?.members?.[0]?.user.first_name} {chat?.chat?.members?.[0]?.user.last_name}</h2>
                <p className="text-sm text-primaryTheme-500">Online</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Phone className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Star className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Info className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea ref={scrollRef} className="flex-1 p-4">
          <div className="space-y-4">
            {isLoading ? (
              // Skeleton loading state
              <>
                <div className="flex justify-start">
                  <div className="max-w-[70%] space-y-2">
                    <Skeleton className="h-10 w-[200px] rounded-2xl" />
                    <Skeleton className="h-4 w-[100px]" />
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="max-w-[70%] space-y-2">
                    <Skeleton className="h-16 w-[300px] rounded-2xl" />
                    <Skeleton className="h-4 w-[100px] ml-auto" />
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="max-w-[70%] space-y-2">
                    <Skeleton className="h-12 w-[250px] rounded-2xl" />
                    <Skeleton className="h-4 w-[100px]" />
                  </div>
                </div>
              </>
            ) : (
              chat?.messages.slice().reverse().map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender_id === session.data?.user.id ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2 ${msg.sender_id === session.data?.user.id ? "bg-primaryTheme-50" : "bg-accent"
                      }`}
                  >
                    <p className="text-sm text-gray-800">{msg.content as string}</p>
                    <div className="mt-1 flex items-center justify-end gap-1">
                      <span className="text-xs text-gray-500">{format(msg.created_at, "h:mm a")}</span>
                      {msg.sender_id === session.data?.user.id && (
                        <svg
                          className="h-4 w-4 text-primaryTheme-500"
                          fill="none"
                          height="24"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          width="24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="border-t bg-white p-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Paperclip className="h-5 w-5" />
            </Button>
            <Input
              className="rounded-xl"
              placeholder="Type a message...."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <Button
              size="icon"
              className="rounded-full bg-primaryTheme-500 hover:bg-primaryTheme-600"
              onClick={handleSend}
              disabled={!message.trim() || sendMessage.isPending}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}