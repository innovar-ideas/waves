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
import { AdminDataTable } from "./_components/admin-data-table";
import { adminColumns } from "./_components/admin-columns";
import { CreateAdminForm } from "./_components/create-admin-form";

export default function OrganizationPage() {
  const [open, setOpen] = useState(false);
  const { data, isPending } = trpc.getAllAdmins.useQuery();

  if (isPending) {
    <Skeleton className='my-1.5 h-3 w-36' />;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">Admins</h1>
      <div className="mb-5">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Create New Admin</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Admin</DialogTitle>
              <DialogDescription>
                Create a new admin. Click save when youre done.
              </DialogDescription>
            </DialogHeader>
            <CreateAdminForm onCancel={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
      <AdminDataTable columns={adminColumns} data={data ?? []} />
    </div>
  );
}

