"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/app/_providers/trpc-provider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea";
import useActiveOrganizationStore from "@/app/server/store/active-organization.store";
import { Textarea } from "@/components/ui/textarea";

export default function NewFeedbackPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const { organizationSlug } = useActiveOrganizationStore();

  const createFeedback = trpc.createFeedback.useMutation({
    onSuccess: (data) => {
      router.push(`/communication/messaging/feedback/${data.id}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    createFeedback.mutate({
      subject,
      message,
      organizationSlug
    });
  };

  return (
    <div className="p-4 shadow-sm rounded-lg bg-white h-[calc(100vh-65px)]">
      <h1 className="text-xl font-semibold mb-4">New Feedback</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full"
        />
        <Textarea
          placeholder="Describe your feedback..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full"
        />
        <Button type="submit" className="w-full bg-primaryTheme-500 text-white">
          Submit Feedback
        </Button>
      </form>
    </div>
  );
}
