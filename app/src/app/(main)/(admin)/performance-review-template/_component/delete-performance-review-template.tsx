
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { trpc } from "@/app/_providers/trpc-provider";
import { PerformanceReviewTemplate } from "@prisma/client";

interface DeletePerformanceReviewTemplateModalProps {
    performanceReviewTemplate: PerformanceReviewTemplate;
    open: boolean;
    setOpen: (open: boolean) => void;
}

function DeletePerformanceReviewTemplateModal({ performanceReviewTemplate, open, setOpen }: DeletePerformanceReviewTemplateModalProps) {
  const { toast } = useToast();
  const utils = trpc.useUtils();

  const deletePerformanceReviewTemplate = trpc.deletePerformanceReviewTemplate.useMutation({
    onSuccess: () => {
      toast({ description: "Performance review template removed successfully." });
      setOpen(false);

      utils.getAllPerformanceReviewTemplateByOrganizationSlug.invalidate();
    },
    onError: (error) => {
      toast({ description: error.message, variant: "destructive" });
    },
  });

  const onDelete = () => {
    deletePerformanceReviewTemplate.mutate({ id: performanceReviewTemplate.id });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-lg shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-emerald-800 text-xl font-semibold">Delete Performance Review Template</DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            Are you sure you want to delete this performance review template? This action cannot be undone.
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

export default DeletePerformanceReviewTemplateModal;
    