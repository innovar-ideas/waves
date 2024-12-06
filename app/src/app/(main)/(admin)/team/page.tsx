"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { teamColumns } from "./_components/team-columns";
import { TeamDataTable } from "./_components/team-data-table";
import { CreateTeamForm } from "./_components/create-team-form";
import { useState } from "react";
import { trpc } from "@/app/_providers/trpc-provider";
import { Skeleton } from "@/components/ui/skeleton";

export default function TeamsPage() {
  const [open, setOpen] = useState(false);
  const {data, isPending} = trpc.getAllParentTeams.useQuery();

  if(isPending){
    <Skeleton className='my-1.5 h-3 w-36' />;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold text-green-700">Teams</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700 text-white">Create New Team</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] border-green-100">
            <DialogHeader className="bg-green-50">
              <DialogTitle className="text-green-700">Create New Team</DialogTitle>
              <DialogDescription className="text-green-600">
                Create a new team for your organization. Click save when youre done.
              </DialogDescription>
            </DialogHeader>
            <CreateTeamForm onCancel={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
      <TeamDataTable columns={teamColumns} data={data ?? []} />
    </div>
  );
}
