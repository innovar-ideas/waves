"use client";

import React, { useState } from "react";
import { BankDataTable } from "./_components/data-table";
import { columns } from "./_components/columns";
import { trpc } from "@/app/_providers/trpc-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateBankForm } from "./_components/create-bank-form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";


const Page = () => {
  const [open, setOpen] = useState(false);
  const { data, isPending } = trpc.getAllBanks.useQuery();
  
      if (isPending) {
        return <Skeleton className="my-1.5 h-3 w-36" />;
      }

  return (
    <>
    <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold text-green-700">Bank</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              Create New Bank
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] border-green-100">
            <DialogHeader className="bg-green-50">
              <DialogTitle className="text-green-700">Create New Bank</DialogTitle>
              <DialogDescription className="text-green-600">
                Add a new bank to your organization. Click save when you&apos;re done.
              </DialogDescription>
            </DialogHeader>
            <CreateBankForm onCancel={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>


      <div className="pt-5 pb-[200px]">
        <BankDataTable
          data={data ?? []}
          columns={columns}
        />

      </div>

    </>
  );
};

export default Page;
