"use client";

import { trpc } from "@/app/_providers/trpc-provider";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MessageType } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { ChevronLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ComplaintChatPage() {
  const session = useSession();
  const params = useParams();
  const chatId = params.id as string;
  const [message, setMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { data: chat, isLoading } = trpc.getParentComplaintAndFeedbackMessages.useQuery(
    { chatId },
    {
      refetchInterval: 3000, // Poll every 3 seconds
    }
  );

  const sendMessage = trpc.sendMessage.useMutation({
    onSuccess: () => {
      setMessage("");
    },
  });

  const markAsClosed = trpc.markComplaintAsClosed.useMutation();

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

  const handleMarkAsClosed = () => {
    markAsClosed.mutate({ chatId });
  };

  return (
    <div className="flex h-[calc(100vh-65px)] flex-col ">
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
      <div className=" bg-white shadow-sm px-4 py-2 m-4 rounded-xl flex flex-col h-[calc(70vh-65px)] ">
        <div className="flex items-center justify-between border-b pb-2">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()}> <ChevronLeftIcon className="h-4 w-4" /></Button>
            <h2 className="font-semibold">{chat?.name || "Complaint Chat"}</h2>
          </div>
          <Button onClick={handleMarkAsClosed} disabled={markAsClosed.isPending}>
            Mark as Closed
          </Button>
        </div>

        <ScrollArea ref={scrollRef} className="flex-1 p-4">
          <div className="space-y-4">
            {isLoading ? (
              <p>Loading messages...</p>
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
                    <p className="text-xs font-semibold">
                      {msg.sender_id === session.data?.user.id ? "me" : `${msg.sender.first_name} ${msg.sender.last_name}`}
                    </p>
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

        <div className="border-t bg-white p-4">
          <div className="flex items-center gap-2">
            <Input
              className="rounded-xl"
              placeholder="Type a message...."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <Button
              size="icon"
              className="rounded-full bg-primaryTheme-500 hover:bg-primaryTheme-600"
              onClick={handleSend}
              disabled={!message.trim() || sendMessage.isPending}
            >
              <svg
                className="h-5 w-5"
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
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 