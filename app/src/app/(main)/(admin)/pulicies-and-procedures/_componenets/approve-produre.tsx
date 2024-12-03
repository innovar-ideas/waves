"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { trpc } from "@/app/_providers/trpc-provider";
import { PolicyAndProcedure } from "@prisma/client";
import { useSession } from "next-auth/react";

interface ApproveProceduresModalProps {
    policyAndProcedure: PolicyAndProcedure;
    open: boolean;
    setOpen: (open: boolean) => void;
}

function ApproveProceduresModal({ policyAndProcedure, open, setOpen }: ApproveProceduresModalProps) {
  const { toast } = useToast();
  const utils = trpc.useUtils();
    const user_id = useSession().data?.user.id;
  const approvePolicyAndProcedure = trpc.approvePolicyAndProcedure.useMutation({
    onSuccess: () => {
      toast({ description: "Policy and Procedure approved successfully." });
      setOpen(false);

      utils.getPolicyAndProcedureById.invalidate();
    },
    onError: (error) => {
      toast({ description: error.message, variant: "destructive" });
    },
  });

  const onApprove = () => {
    approvePolicyAndProcedure.mutate({ id: policyAndProcedure.id, approved_by: user_id });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white transition-all duration-200">Approve</Button>
      </DialogTrigger>
      <DialogContent className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-lg shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-emerald-800 text-xl font-semibold">Approve Policy and Procedure</DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            Are you sure you want to approve this policy and procedure?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-6 space-x-4">
          <DialogClose>
            <Button
              data-cy='cancel-button'
              key='cancel-button'
              type='submit'
              className='bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-all duration-200'
              variant='outline'
            >
              Cancel
            </Button>
          </DialogClose>

          <Button
            data-cy='submit-button'
            key='submit-button'
            className='bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg transition-all duration-200'
            type='submit'
            onClick={onApprove}
          >
            Confirm Approval
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ApproveProceduresModal;
    