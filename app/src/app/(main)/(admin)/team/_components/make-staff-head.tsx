"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { trpc } from "@/app/_providers/trpc-provider";
import { useState } from "react";

interface DisburseLoanApplicationModalProps {
  id: string;
}

function MakeHeadOfDept({ id }: DisburseLoanApplicationModalProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const utils = trpc.useUtils();

  const makeHeadOfTeam = trpc.makeStaffHeadOfDepartment.useMutation({
    onSuccess: () => {
      toast({ description: " Staff is now head of team." });
      setOpen(false);
      setIsLoading(false);
      utils.getAllTeamMember.invalidate();

    },
    onError: (error) => {
      toast({ description: error.message, variant: "destructive" });
    },
  });

  const onConfirmUpdate = () => {
    setIsLoading(true);
    makeHeadOfTeam.mutate({ id: id });
  };


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className='w-full bg-emerald-500 hover:bg-emerald-600 text-white transition-all duration-200 shadow-sm'
        >
          Make Head of Team
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-lg shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-emerald-800 text-xl font-semibold"> Make head of Team</DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            Are you sure you want to make this staff head of team? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-6 space-x-4">
          <Button
            key='cancel-button'
            type='button'
            className='bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-all duration-200'
            variant='outline'
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>

          <Button
            data-cy='submit-button'
            key='submit-button'
            className='bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg transition-all duration-200'
            type='button'
            onClick={onConfirmUpdate}
          >
            {isLoading ? "Loading..." : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default MakeHeadOfDept;
