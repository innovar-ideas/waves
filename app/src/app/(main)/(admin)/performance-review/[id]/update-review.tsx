"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { trpc } from "@/app/_providers/trpc-provider";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

const updatePerformanceReviewSchema = z.object({
  feedback: z.array(z.object({
    column_name: z.string().optional(),
    column_description: z.string().optional(),
    column_type: z.enum(["number", "date", "text", "link", "boolean", "select", "multi-select", "other"]).optional(),
    column_value: z.any().optional()
  }))
});

export type updatePerformanceReviewType = {
  feedback: {
    column_name: string | undefined;
    column_description: string | undefined;
    column_type: "number" | "date" | "text" | "link" | "boolean" | "select" | "multi-select" | "other";
    column_value: string | number | boolean | null | undefined;
  }[];
};
export type updatePerformanceReviewValueType = {
  column_name: string | undefined;
  column_description: string | undefined;
  column_type: "number" | "date" | "text" | "link" | "boolean" | "select" | "multi-select" | "other";
  column_value: string | number | boolean | null | undefined;
};



type UpdatePerformanceReviewProps = {
 
    reviewId: string;
    initialData: updatePerformanceReviewType;
};

export default function UpdatePerformanceReview({
  
  reviewId,
  initialData
}: UpdatePerformanceReviewProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const form = useForm<z.infer<typeof updatePerformanceReviewSchema>>({
    resolver: zodResolver(updatePerformanceReviewSchema),
    defaultValues: {
      feedback: initialData?.feedback || []
    }
  });

  const updateReview = trpc.updatePerformanceReview.useMutation({
    onSuccess: () => {
      toast.success("Performance review updated successfully");
      router.refresh();
      setOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "Something went wrong");
    }
  });

  const onSubmit = (values: z.infer<typeof updatePerformanceReviewSchema>) => {
    const simplifiedFeedback = values.feedback.map(item => ({
      column_name: item.column_name,
      column_value: String(item.column_value)
    }));

    updateReview.mutate({
      id: reviewId,
      feedback: simplifiedFeedback
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
         <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg transition-all duration-200" data-cy="create-leave-setting">
          <Plus className="mr-2 h-4 w-4" />
          <span>Update Review</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader className="bg-emerald-50 p-4 rounded-t-lg border-b border-emerald-100">
          <DialogTitle className="text-emerald-800 text-lg font-semibold">
            Update Performance Review
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 space-y-4">
            <fieldset disabled={updateReview.isPending}>
              {initialData?.feedback?.map((feedback: updatePerformanceReviewValueType, index: number) => (
                <FormField
                  key={index}
                  control={form.control}
                  name={`feedback.${index}.column_value`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        {feedback.column_name}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type={feedback.column_type === "number" ? "number" : "text"}
                          className="w-full border-gray-200 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </FormControl>
                      <FormMessage className="text-sm text-red-500" />
                    </FormItem>
                  )}
                />
              ))}

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="border-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  onClick={form.handleSubmit(onSubmit, (error) => console.error(error))}
                  type="submit"
                  className="bg-emerald-600 text-white hover:bg-emerald-700"
                  disabled={updateReview.isPending}
                
                >
                  {updateReview.isPending ? "Updating..." : "Update Review"}
                </Button>
              </div>
            </fieldset>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
