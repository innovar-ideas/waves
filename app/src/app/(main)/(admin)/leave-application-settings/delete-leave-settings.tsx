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
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { trpc } from "@/app/_providers/trpc-provider";
import { LeaveSetting } from "@prisma/client";

interface DeleteLeaveSettingModalProps {
    leaveSettings: LeaveSetting;
    open: boolean;
    setOpen: (open: boolean) => void;
}

function DeleteLeaveSettingModal({ leaveSettings, open, setOpen }: DeleteLeaveSettingModalProps) {
  const { toast } = useToast();
  const utils = trpc.useUtils();

  const deleteLeaveSetting = trpc.deleteLeaveSetting.useMutation({
    onSuccess: () => {
      toast({ description: "Leave setting removed successfully." });
      setOpen(false);

      utils.getLeaveSettingByOrganizationId.invalidate();
    },
    onError: (error) => {
      toast({ description: error.message, variant: "destructive" });
    },
  });

  const onDelete = () => {
    deleteLeaveSetting.mutate({ id: leaveSettings.id });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-lg shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-emerald-800 text-xl font-semibold">Delete Leave Setting</DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            Are you sure you want to delete this leave setting? This action cannot be undone.
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
            onClick={onDelete}
          >
            Confirm Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DeleteLeaveSettingModal;