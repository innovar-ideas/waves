"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { trpc } from "@/app/_providers/trpc-provider";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { useSession } from "next-auth/react";
import useActiveOrganizationStore from "@/app/server/store/active-organization.store";

export default function NewChatPage() {
  const { organizationSlug } = useActiveOrganizationStore();
  const router = useRouter();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isGroup, setIsGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const session = useSession();

  const { data: users } = trpc.getActiveUsers.useQuery({
    organizationSlug,
  });

  const createChat = trpc.createChat.useMutation({
    onSuccess: (chat) => {
      router.push(`/communication/messaging/${chat.id}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const filteredUsers = users?.filter(user =>
    user.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    user.email?.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const handleCreateChat = () => {
    if (selectedUsers.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one user",
        variant: "destructive"
      });
      return;
    }

    if (isGroup && !groupName) {
      toast({
        title: "Error",
        description: "Please enter a group name",
        variant: "destructive"
      });
      return;
    }

    createChat.mutate({
      organizationSlug,
      type: isGroup ? "GROUP" : "DIRECT",
      name: groupName,
      memberIds: [...selectedUsers, session.data?.user.id || ""],
      createdBy: session.data?.user.id || ""
    });
  };

  return (
    <div className="p-4 space-y-4 h-[calc(100vh-65px)]">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 h-12 shadow-sm"
        />
        <div className="flex items-center gap-2">
          <Checkbox
            id="group"
            checked={isGroup}
            onCheckedChange={(checked) => setIsGroup(checked as boolean)}
          />
          <label htmlFor="group">Create Group</label>
        </div>
      </div>

      {isGroup && (
        <Input
          placeholder="Group name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
      )}

      <div className="flex-1 bg-white rounded-xl shadow-sm max-h-[calc(72vh-65px)]">
        <ScrollArea className=" max-h-[calc(70vh-65px)]">
          <div className="p-4 space-y-2">
            {filteredUsers?.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-4 p-2 hover:bg-accent rounded-lg"
              >
                <Checkbox
                  checked={selectedUsers.includes(user.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedUsers([...selectedUsers, user.id]);
                    } else {
                      setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                    }
                  }}
                />
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.role}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button onClick={handleCreateChat}
            className="bg-primaryTheme-500 text-white"
            disabled={createChat.isPending}>
            {createChat.isPending ? "Creating..." : "Create Chat"}
          </Button>
        </div>
      </div>
    </div>
  );
}
