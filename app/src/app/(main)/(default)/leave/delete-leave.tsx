"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { trpc } from "@/app/_providers/trpc-provider";
import { LeaveApplication } from "@prisma/client";

interface DeleteLeaveApplicationModalProps {
    leaveApplication: LeaveApplication;
    open: boolean;
    setOpen: (open: boolean) => void;
}

function DeleteLeaveApplicationModal({ leaveApplication, open, setOpen }: DeleteLeaveApplicationModalProps) {
  const { toast } = useToast();
  const utils = trpc.useUtils();

  const deleteLeaveApplication = trpc.deleteLeaveApplication.useMutation({
    onSuccess: () => {
      toast({ description: "Leave application removed successfully." });
      setOpen(false);
      utils.getAllLeaveApplication.invalidate();
      
    },
    onError: (error) => {
      toast({ description: error.message, variant: "destructive" });
    },
  });

  const onConfirmDelete = () => {
    deleteLeaveApplication.mutate({ id: leaveApplication.id });
  };

 
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-lg shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-emerald-800 text-xl font-semibold">Delete Leave Application</DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            Are you sure you want to delete this leave application? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-6 space-x-4">
          <Button
            data-cy='cancel-button'
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
            onClick={onConfirmDelete}
          >
            Confirm Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DeleteLeaveApplicationModal;
