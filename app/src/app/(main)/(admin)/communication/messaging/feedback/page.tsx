"use client";

import { useState } from "react";
import { ArrowLeft, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { trpc } from "@/app/_providers/trpc-provider";
import { useRouter } from "next/navigation";
import { ChatStatus } from "@prisma/client";
import useActiveOrganizationStore from "@/app/server/store/active-organization.store";

interface FeedbackChat {
  id: string;
  name: string | null;
  description: string;
  status: ChatStatus;
  timestamp: string;
}

function SearchBar({ search, setSearch }: { search: string; setSearch: (value: string) => void }) {
  return (
    <div className="pl-4 py-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          className="w-full h-12 rounded-xl pl-10"
          placeholder="Search feedback..."
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
    </div>
  );
}

function FeedbackList({ feedback, filter, onFeedbackClick }: { feedback: FeedbackChat[]; filter: string; onFeedbackClick: (id: string) => void }) {
  const filteredFeedback = feedback.filter(item => {
    if (filter === "all") return true;
    return item.status === filter;
  });

  return (
    <div className="divide-y">
      {filteredFeedback.map((item) => (
        <div
          key={item.id}
          onClick={() => onFeedbackClick(item.id)}
          className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer"
        >
          <div className="space-y-1">
            <div className="font-medium">{item.name}</div>
            <div className="text-sm text-muted-foreground">{item.description}</div>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant={item.status === "OPEN" ? "default" : "secondary"}
              className={cn(
                "capitalize",
                item.status === "OPEN" ? "bg-primaryTheme-500" : "bg-zinc-600"
              )}
            >
              {item.status}
            </Badge>
            <div className="text-sm text-muted-foreground">{item.timestamp}</div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function FeedbackDesk() {
  const [filter, setFilter] = useState<"all" | "OPEN" | "RESOLVED">("all");
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const router = useRouter();
  const { organizationSlug } = useActiveOrganizationStore();
  const { data: feedback, } = trpc.getFeedbackChats.useQuery({
    slug: organizationSlug as string,
    page,
    limit: 10
  });

  const handleFeedbackClick = (id: string) => {
    router.push(`/communication/messaging/${id}`);
  };

  return (
    <div className="h-[calc(100vh-65px)]">
      <SearchBar search={search} setSearch={setSearch} />
      <div className="bg-white rounded-xl h-[calc(70vh-65px)] mx-4 my-2 shadow-sm flex flex-col">
        <div className="p-4 sticky top-0 bg-background z-10 space-y-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-semibold">Feedback Desk</h1>
          </div>

          <div className="flex gap-2">
            {["all", "OPEN", "RESOLVED"].map((tab) => (
              <Button
                key={tab}
                onClick={() => setFilter(tab as typeof filter)}
                variant={filter === tab ? "secondary" : "ghost"}
                className="capitalize"
                size="sm"
              >
                {tab}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <FeedbackList feedback={feedback as FeedbackChat[] || []} filter={filter} onFeedbackClick={handleFeedbackClick} />
        </div>

        <div className="p-4 border-t">
          <div className="flex justify-between">
            <Button
              onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
              className="bg-primaryTheme-500 text-white"
              disabled={page === 0}
            >
              Previous
            </Button>
            <Button
              onClick={() => setPage((prev) => prev + 1)}
              className="bg-primaryTheme-500 text-white"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 