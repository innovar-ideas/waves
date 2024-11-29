"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { trpc } from "@/app/_providers/trpc-provider";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { X } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import useActiveOrganizationStore from "@/app/server/store/active-organization.store";
import { RecipientDialog } from "../../_components/recipient-dialogue";

interface Recipient {
  id: string
  name: string
  group: "Individuals" | "Staff" | "Groups"
}

export default function NewBroadcastPage() {
  const { organizationSlug } = useActiveOrganizationStore();
  const router = useRouter();
  const { toast } = useToast();
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [selectedRecipients, setSelectedRecipients] = useState<Recipient[]>([]);
  const [isRecipientDialogOpen, setIsRecipientDialogOpen] = useState(false);
  const methods = useForm();

  const createBroadcast = trpc.createBroadcast.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Broadcast sent successfully",
        variant: "default"
      });
      router.push("/communication/messaging/sent");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const saveDraft = trpc.saveBroadcastDraft.useMutation({
    onSuccess: () => {
      toast({
        title: "Draft Saved",
        description: "Broadcast draft saved successfully",
        variant: "default"
      });
      router.push("/communication/messaging/draft");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleCreateBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !content) {
      toast({
        title: "Error",
        description: "Subject and content cannot be empty",
        variant: "destructive"
      });
      return;
    }

    if (selectedRecipients.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one recipient",
        variant: "destructive"
      });
      return;
    }

    createBroadcast.mutate({
      organizationSlug,
      subject,
      content,
      recipients: selectedRecipients.map(r => ({ id: r.id, group: r.group })),
      channels: {
        email: emailEnabled,
        sms: smsEnabled,
        whatsapp: whatsappEnabled
      }
    });
  };

  const handleSaveAsDraft = (e: React.FormEvent) => {
    e.preventDefault();
    saveDraft.mutate({
      organizationSlug,
      subject,
      content,
      recipients: selectedRecipients.map(r => ({ id: r.id, group: r.group })),
      channels: {
        email: emailEnabled,
        sms: smsEnabled,
        whatsapp: whatsappEnabled
      }
    });
  };

  const removeRecipient = (recipientId: string) => {
    setSelectedRecipients(prev => prev.filter(r => r.id !== recipientId));
  };

  return (
    <FormProvider {...methods}>
      <form className="max-w-3xl mx-auto">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between border-b py-2">
            <Button variant="ghost" type="button" onClick={() => router.back()} className="text-lg">
              <span aria-hidden="true">←</span> New Message
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">To:</span>
              <div className="flex flex-wrap gap-1">
                {selectedRecipients.map((recipient) => (
                  <Button key={recipient.id}
                    type="button" variant="secondary" size="sm" className="gap-1">
                    {recipient.name}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeRecipient(recipient.id)}
                      aria-label={`Remove ${recipient.name}`}
                    />
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                type="button"
                size="sm"
                onClick={() => setIsRecipientDialogOpen(true)}
              >
                Add Recipients
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Subject:</span>
              <Input
                placeholder="Enter subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="flex-1"
                aria-label="Subject"
              />
            </div>
            <div className="border rounded-md">
              <Input
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-40 p-4 resize-none border-0 focus:ring-0"
                placeholder="Type your message here..."
                aria-label="Message content"
              />
            </div>
          </div>

          <div className="flex justify-between items-center border-t pt-4">
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <span>Whatsapp</span>
                <Switch
                  checked={whatsappEnabled}
                  onCheckedChange={setWhatsappEnabled}
                />
              </div>
              <div className="flex items-center gap-2">
                <span>Email</span>
                <Switch
                  checked={emailEnabled}
                  onCheckedChange={setEmailEnabled}
                />
              </div>
              <div className="flex items-center gap-2">
                <span>Text Message</span>
                <Switch
                  checked={smsEnabled}
                  onCheckedChange={setSmsEnabled}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button variant="outline" onClick={handleSaveAsDraft} disabled={createBroadcast.isPending}>
                Save as Draft
              </Button>
              <Button type="button" onClick={handleCreateBroadcast} disabled={createBroadcast.isPending}>
                {createBroadcast.isPending ? "Sending..." : "Send →"}
              </Button>
            </div>
          </div>
        </div>

        <RecipientDialog
          open={isRecipientDialogOpen}
          onOpenChange={setIsRecipientDialogOpen}
          selectedRecipients={selectedRecipients}
          onRecipientsChange={setSelectedRecipients}
        />
      </form>
    </FormProvider>
  );
}

