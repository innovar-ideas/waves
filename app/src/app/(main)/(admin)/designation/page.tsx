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

export default function DesignationPage() {
  const [open, setOpen] = useState(false);
  const { data: designations, isPending } = trpc.getAllTeamDesignation.useQuery();

  if (isPending) {
    return <Skeleton className="my-1.5 h-3 w-36" />;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold text-green-700">Designations</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              Create New Designation
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] border-green-100">
            <DialogHeader className="bg-green-50">
              <DialogTitle className="text-green-700">Create New Designation</DialogTitle>
              <DialogDescription className="text-green-600">
                Create a new designation for your team. Click save when you&apos;re done.
              </DialogDescription>
            </DialogHeader>
            <CreateDesignationForm onCancel={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
      <DesignationDataTable 
        columns={designationColumns} 
        data={designations ?? []} 
      />
    </div>
  );
}
