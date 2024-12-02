"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/app/_providers/trpc-provider";
import { toast } from "sonner";

interface DeletePerformanceReviewModalProps {
  reviewId: string;
}

const DeletePerformanceReviewModal = ({ reviewId }: DeletePerformanceReviewModalProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const deletePerformanceReview = trpc.deletePerformanceReview.useMutation({
    onSuccess: () => {
      setIsOpen(false);
      toast.success("Performance review deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete performance review");
    }
  });

  const handleDelete = async () => {
    
    try {
      await deletePerformanceReview.mutateAsync({
        id: reviewId
      });
    } catch (error) {
      console.error("Error deleting performance review:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
        {
            reviewId && (
                <DialogTrigger asChild>
                    <Button
                    onClick={() => setIsOpen(true)}
                    variant="ghost"
          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-100"
        >
          <Trash2 className="h-4 w-4" />
                    </Button>
                </DialogTrigger>
            )
        }
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Delete Performance Review
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Are you sure you want to delete this performance review? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="border-gray-300"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deletePerformanceReview.isPending}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {deletePerformanceReview.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeletePerformanceReviewModal;
