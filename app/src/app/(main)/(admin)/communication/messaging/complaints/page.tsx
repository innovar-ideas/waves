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
          className="w-full h-12 rounded-xl pl-10 shadow-sm"
          placeholder="Search here..."
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
    </div>
  );
}

function ComplaintsList({ complaints, filter, onComplaintClick }: { complaints: FeedbackChat[]; filter: string; onComplaintClick: (id: string) => void }) {
  const filteredComplaints = complaints.filter(complaint => {
    if (filter === "all") return true;
    return complaint.status === filter;
  });

  return (
    <div className="divide-y">
      {filteredComplaints.map((complaint) => (
        <div
          key={complaint.id}
          onClick={() => onComplaintClick(complaint.id)}
          className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer"
        >
          <div className="space-y-1">
            <div className="font-medium">{complaint.name}</div>
            <div className="text-sm text-muted-foreground">{complaint.description as string}</div>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant={complaint.status === "OPEN" ? "default" : "secondary"}
              className={cn(
                "capitalize",
                complaint.status === "OPEN" ? "bg-blue-600" : "bg-zinc-600"
              )}
            >
              {complaint.status}
            </Badge>
            <div className="text-sm text-muted-foreground">{complaint.timestamp}</div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ComplaintsDesk() {
  const [filter, setFilter] = useState<"all" | "OPEN" | "RESOLVED">("all");
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const router = useRouter();
  const { organizationSlug } = useActiveOrganizationStore();
  const { data: complaints } = trpc.getComplaintChats.useQuery({
    slug: organizationSlug as string,
    page,
    limit: 10
  });



  const handleComplaintClick = (id: string) => {
    router.push(`/communication/messaging/complaints/${id}`);
  };

  return (
    <div className="h-[calc(100vh-65px)]">
      <SearchBar search={search} setSearch={setSearch} />
      <div className=" bg-white rounded-xl h-[calc(70vh-65px)] mx-4 my-2 shadow-sm flex flex-col">
        <div className="p-4 sticky top-0 bg-background z-10 space-y-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-semibold">Complaint Desk</h1>
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
          <ComplaintsList complaints={complaints as FeedbackChat[] || []} filter={filter} onComplaintClick={handleComplaintClick} />
        </div>

        <div className="p-4 border-t">
          <div className="flex justify-between">
            <Button onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
              className=" bg-primaryTheme-500 text-white"
              disabled={page === 0}>
              Previous
            </Button>
            <Button
              onClick={() => setPage((prev) => prev + 1)}
              className=" bg-primaryTheme-500 text-white"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

