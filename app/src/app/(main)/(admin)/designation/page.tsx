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
import { useState } from "react";
import { trpc } from "@/app/_providers/trpc-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { DesignationDataTable } from "./_components/designation-data-table";
import { designationColumns } from "./_components/designation-columns";
import { CreateDesignationForm } from "./_components/create-designation-form";

export default function TeamsPage() {
    const [open, setOpen] = useState(false);
  const {data, isPending} = trpc.getAllTeamDesignation.useQuery();

  if(isPending){
    <Skeleton className='my-1.5 h-3 w-36' />;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">Designations(Roles)</h1>
      <div className="mb-5">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>New Designation</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Designation</DialogTitle>
              <DialogDescription>
                Create a new designation for your team. Click save when youre done.
              </DialogDescription>
            </DialogHeader>
            <CreateDesignationForm onCancel={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
      <DesignationDataTable columns={designationColumns} data={data ?? []} />
    </div>
  );
}

