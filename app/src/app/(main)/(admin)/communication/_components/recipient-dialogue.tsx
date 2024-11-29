"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { trpc } from "@/app/_providers/trpc-provider";
import useActiveOrganizationStore from "@/app/server/store/active-organization.store";

export type RecipientGroup = "Individuals" | "Staff" | "Groups";

interface Recipient {
  id: string
  name: string
  group: RecipientGroup
  isAll?: boolean
}

interface RecipientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedRecipients: Recipient[]
  onRecipientsChange: (recipients: Recipient[]) => void
}

export function RecipientDialog({
  open,
  onOpenChange,
  selectedRecipients,
  onRecipientsChange,
}: RecipientDialogProps) {
  const [selectedGroup, setSelectedGroup] = useState<RecipientGroup>("Staff");
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { organizationSlug } = useActiveOrganizationStore();
  const { data, isLoading } = trpc.getRecipients.useQuery({ organizationSlug });

  useEffect(() => {
    if (data) {
      const allRecipients = [
        { id: "all-staffs", name: "All Staff", group: "Staff", isAll: true },
        ...data.staff.map(s => ({ id: s.id, name: `${s.first_name} ${s.last_name}`, group: "Staff" })),
        ...data.groups.map(g => ({ id: g.id, name: g.name || "Unnamed Group", group: "Groups" }))
      ];
      setRecipients(allRecipients as Recipient[]);
    }
  }, [data]);

  const filteredRecipients = recipients.filter((r) =>
    r.group === selectedGroup && r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRecipientToggle = (recipient: Recipient) => {
    const isSelected = selectedRecipients.some((r) => r.id === recipient.id);
    if (isSelected) {
      onRecipientsChange(selectedRecipients.filter((r) => r.id !== recipient.id));
    } else {
      onRecipientsChange([...selectedRecipients, recipient]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Receiver</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Send To</label>
            <Select value={selectedGroup} onValueChange={(value: RecipientGroup) => setSelectedGroup(value)}>
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Select group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Parents">Parents</SelectItem>
                <SelectItem value="Individuals">Individuals</SelectItem>
                <SelectItem value="Classes">Classes</SelectItem>
                <SelectItem value="Staff">Staff</SelectItem>
                <SelectItem value="Groups">Groups</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Search {selectedGroup}</label>
            <Input
              placeholder={`Search ${selectedGroup}`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-2"
            />
            <ScrollArea className="h-[200px]">
              {isLoading ? (
                <p>Loading...</p>
              ) : (
                filteredRecipients.map((recipient) => (
                  <div key={recipient.id} className="p-2 hover:bg-muted">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={selectedRecipients.some((r) => r.id === recipient.id)}
                        onCheckedChange={() => handleRecipientToggle(recipient)}
                        id={recipient.id}
                      />
                      <label htmlFor={recipient.id} className="text-sm">
                        {recipient.name}
                      </label>
                    </div>
                  </div>
                ))
              )}
            </ScrollArea>
          </div>

          <Button
            className="w-full"
            type="button"
            onClick={() => onOpenChange(false)}
          >
            Add Selection
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

