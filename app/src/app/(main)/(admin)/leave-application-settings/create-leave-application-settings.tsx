"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import useActiveOrganizationStore from "../../../server/store/active-organization.store";
import { useToast } from "@/components/ui/use-toast";
import { trpc } from "../../../_providers/trpc-provider";
import { CreateLeaveSettingSchema } from "../../../server/dtos";
import { createLeaveSettingSchema } from "../../../server/dtos";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormField, FormLabel, FormMessage, FormControl, FormItem } from "@/components/ui/form";
import { Plus } from "lucide-react";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface CreateLeaveSettingFormProps {
  onSuccess?: () => void;
}

export default function CreateLeaveSettingForm({ onSuccess }: CreateLeaveSettingFormProps) {
  const { toast } = useToast();
  const utils = trpc.useUtils();
  const [open, setOpen] = useState(false);
  const { organizationSlug } = useActiveOrganizationStore();

  const form = useForm<CreateLeaveSettingSchema>({
    resolver: zodResolver(createLeaveSettingSchema),
    defaultValues: {
      slug: organizationSlug,
      name: "",
      type: "paid",
      duration: 0,
      applicable_to: "both",
    },
    mode: "onChange",
  });
console.log(form.formState.errors);
  const createLeaveSetting = trpc.createLeaveSetting.useMutation({
    onSuccess: async () => {
      toast({
        title: "Success",
        variant: "default",
        description: "Leave Settings Created Successfully",
      });

      utils.getAllLeaveSetting.invalidate().then(() => {
        setOpen(false);
      });

      form.reset();
      onSuccess?.();
    },
    onError: async (error) => {
      toast({
        title: "Error",
        variant: "destructive",
        description: error.message || "Failed to create leave setting",
      });
    },
  });

  const onSubmit = (values: CreateLeaveSettingSchema) => {

     const submissionData: CreateLeaveSettingSchema = {
      ...values,
      slug: organizationSlug,
      duration: Number(values.duration),
    };

    createLeaveSetting.mutate(submissionData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg transition-all duration-200" data-cy="create-leave-setting">
          <Plus className="mr-2 h-4 w-4" />
          <span>Add Leave Setting</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-white rounded-lg shadow-xl">
        <DialogHeader className="bg-emerald-50 p-4 rounded-t-lg border-b border-emerald-100">
          <DialogTitle className="text-emerald-800 text-lg font-semibold">Add Leave Setting</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-4">
            <fieldset disabled={createLeaveSetting.isPending} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Leave Name</FormLabel>
                    <FormControl>
                      <Input 
                        data-cy="name" 
                        placeholder="e.g. Annual Leave, Sick Leave" 
                        className="w-full border-gray-200 focus:ring-emerald-500 focus:border-emerald-500"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-sm text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Leave Type</FormLabel>
                    <FormControl>
                      <select
                        className="w-full border border-gray-200 rounded-md p-2 text-sm focus:ring-emerald-500 focus:border-emerald-500"
                        onChange={field.onChange}
                        value={field.value}
                        data-cy="type"
                      >
                        <option value="paid">Paid</option>
                        <option value="unpaid">Unpaid</option>
                      </select>
                    </FormControl>
                    <FormMessage className="text-sm text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="applicable_to"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Applicable To</FormLabel>
                    <FormControl>
                      <select
                        className="w-full border border-gray-200 rounded-md p-2 text-sm focus:ring-emerald-500 focus:border-emerald-500"
                        onChange={field.onChange}
                        value={field.value}
                        data-cy="applicable_to"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="both">Both</option>
                      </select>
                    </FormControl>
                    <FormMessage className="text-sm text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Duration (Days)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        min="1"
                        data-cy="duration" 
                        placeholder="Enter number of days" 
                        className="w-full border-gray-200 focus:ring-emerald-500 focus:border-emerald-500"
                        {...field}
                        onChange={e => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage className="text-sm text-red-500" />
                  </FormItem>
                )}
              />

              <Button
                data-cy="submit"
                type="submit"
                className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2 px-4 rounded-md shadow transition-colors duration-200"
                disabled={createLeaveSetting.isPending}
              >
                {createLeaveSetting.isPending ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </span>
                ) : (
                  "Create Leave Setting"
                )}
              </Button>
            </fieldset>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}