"use client";

import { trpc } from "@/app/_providers/trpc-provider";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams } from "next/navigation";
import { CreateTeamForm } from "../../_components/create-team-form";
import { TeamDataTable } from "../../_components/team-data-table";
import { useState } from "react";
import { teamColumns } from "../../_components/team-columns";

const ViewSubTeam = () => {
    const params = useParams();
    const id = params?.id as string;
    const [open, setOpen] = useState(false);

  const { data: teams, isLoading } = trpc.getSingleTeamById.useQuery({ id });

  if(isLoading){
    <Skeleton className='my-1.5 h-3 w-36' />;

  }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-5">Sub Teams</h1>
      <div className="mb-5">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Create New Team</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
              <DialogDescription>
                Create a new team for your organization. Click save when youre done.
              </DialogDescription>
            </DialogHeader>
            <CreateTeamForm onCancel={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
      <TeamDataTable columns={teamColumns} data={teams?.childTeams ?? []} />
        </div>
    );
};

export default ViewSubTeam;