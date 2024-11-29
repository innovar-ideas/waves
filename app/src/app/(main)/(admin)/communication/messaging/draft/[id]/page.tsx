"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { trpc } from "@/app/_providers/trpc-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import useActiveOrganizationStore from "@/app/server/store/active-organization.store";
import { RecipientDialog } from "../../../_components/recipient-dialogue";

export type RecipientGroup = "Individuals" | "Staff" | "Groups";

interface Recipient {
  id: string
  name: string
  group: RecipientGroup
  isAll?: boolean
}

export default function DraftPage() {
  const router = useRouter();
  const params = useParams();
  const draftId = params.id as string;
  const { toast } = useToast();
  const { organizationSlug } = useActiveOrganizationStore();

  const { data: draftChat } = trpc.getDraftChatById.useQuery({ draftId });
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [selectedRecipients, setSelectedRecipients] = useState<Recipient[]>([]);
  const [isRecipientDialogOpen, setIsRecipientDialogOpen] = useState(false);
  useEffect(() => {
    if (draftChat) {
      setSubject(draftChat.name || "");
      setContent(draftChat.messages[0]?.content as string || "");
      setSelectedRecipients(draftChat.members.map(member => ({
        id: member.user.id,
        name: `${member.user.first_name} ${member.user.last_name}`,
        group: "Individuals"
      })));
      // Assuming channels are stored in a specific way, adjust as needed
      setEmailEnabled(draftChat.messages[0]?.deliveries.some(d => d.channel === "EMAIL"));
      setSmsEnabled(draftChat.messages[0]?.deliveries.some(d => d.channel === "SMS"));
      setWhatsappEnabled(draftChat.messages[0]?.deliveries.some(d => d.channel === "WHATSAPP"));
    }
  }, [draftChat]);

  const updateDraft = trpc.updateDraft.useMutation({
    onSuccess: () => {
      toast({
        title: "Draft Updated",
        description: "Draft updated successfully",
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

  const sendDraft = trpc.sendDraft.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Draft sent successfully",
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

  const handleUpdateDraft = (isSending: boolean) => {
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

    const payload = {
      draftId,
      subject,
      content,
      recipients: selectedRecipients.map(r => ({ id: r.id, group: r.group })),
      channels: {
        email: emailEnabled,
        sms: smsEnabled,
        whatsapp: whatsappEnabled
      }
    };

    if (isSending) {
      sendDraft.mutate({ ...payload, organizationSlug });
    } else {
      updateDraft.mutate(payload);
    }
  };



  return (
    <form className="max-w-3xl mx-auto">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between border-b py-2">
          <Button variant="ghost" type="button" onClick={() => router.back()} className="text-lg">
            <span aria-hidden="true">←</span> Edit Draft
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">To:</span>
            <div className="flex flex-wrap gap-1">
              {selectedRecipients.map((recipient) => (
                <Button key={recipient.id} type="button" variant="secondary" size="sm" className="gap-1">
                  {recipient.name}
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
            <Button variant="outline" onClick={() => handleUpdateDraft(false)}>
              Update Draft
            </Button>
            <Button type="button" onClick={() => handleUpdateDraft(true)}>
              Send →
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
  );
}
