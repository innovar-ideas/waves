"use client";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";


import ReactQuill from "react-quill";
import { useToast } from "@/components/ui/use-toast";
import { trpc } from "@/app/_providers/trpc-provider";
import { updatePolicyAndProcedureSchema } from "../../../../server/dtos";
import { UpdatePolicyAndProcedureSchema } from "../../../../server/dtos";
import "react-quill/dist/quill.snow.css";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormField, FormLabel, FormMessage, FormControl, FormItem } from "@/components/ui/form";
import { PolicyAndProcedure } from "@prisma/client";

interface AddContentProps {
  policyAndProcedure: PolicyAndProcedure;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function AddContent({ policyAndProcedure, open, setOpen }: AddContentProps) {
  const utils = trpc.useUtils();
  const { toast } = useToast();

  const form = useForm<UpdatePolicyAndProcedureSchema>({
    resolver: zodResolver(updatePolicyAndProcedureSchema),
    defaultValues: {
      id: policyAndProcedure.id,
      content: policyAndProcedure.content || "",
    },
    mode: "onChange",
  });

  const updatePolicyAndProcedure = trpc.updatePolicyAndProcedure.useMutation({
    onSuccess: async () => {
      toast({
        title: "Success",
        variant: "default",
        description: "Content updated successfully",
      });

      utils.getAllPolicyAndProcedureByOrganization.invalidate().then(() => {
        setOpen(false);
      });

      form.reset();
    },
    onError: async (error) => {
      toast({
        title: "Error",
        variant: "destructive",
        description: error.message || "Failed to update content",
      });
    },
  });

  const onSubmit = (values: UpdatePolicyAndProcedureSchema) => {
    updatePolicyAndProcedure.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          size="sm" 
          className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg transition-all duration-200"
        >
          Add/Edit Content
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl bg-white rounded-lg shadow-xl">
        <DialogHeader className="bg-emerald-50 p-4 rounded-t-lg border-b border-emerald-100">
          <DialogTitle className="text-emerald-800 text-lg font-semibold">
            Add or Edit Policy Content
          </DialogTitle>
        </DialogHeader>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 space-y-6">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Content</FormLabel>
                  <FormControl>
                    <ReactQuill
                      theme="snow"
                      placeholder="Enter your policy content here..."
                      className="bg-white min-h-[400px] mb-12 rounded-lg border border-gray-200"
                      modules={{
                        toolbar: [
                          [{ header: [1, 2, 3, false] }],
                          ["bold", "italic", "underline", "strike"],
                          [{ list: "ordered" }, { list: "bullet" }],
                          ["link", "blockquote"],
                          [{ color: [] }, { background: [] }],
                          ["clean"]
                        ],
                      }}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage className="text-sm text-red-500" />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={updatePolicyAndProcedure.isPending}
              >
                {updatePolicyAndProcedure.isPending ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
