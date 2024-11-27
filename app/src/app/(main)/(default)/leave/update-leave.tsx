"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormField, FormLabel, FormMessage, FormControl, FormItem } from "@/components/ui/form";
import { Form } from "@/components/ui/form";
import { LeaveApplication } from "@prisma/client";
import { updateLeaveApplicationSchema, UpdateLeaveApplicationSchema } from "../../../server/dtos";

import { trpc } from "../../../_providers/trpc-provider";
interface UpdateLeaveSettingFormProps {
  leaveApplication: LeaveApplication;
}

export default function UpdateLeaveSettingForm({ leaveApplication }: UpdateLeaveSettingFormProps) {
  const { toast } = useToast();
  const utils = trpc.useUtils();
  const [open, setOpen] = useState(true);
  const { data: allLeaveSettings } = trpc.getAllLeaveSetting.useQuery();

  const form = useForm<UpdateLeaveApplicationSchema>({
    resolver: zodResolver(updateLeaveApplicationSchema),
    defaultValues: {
      id: leaveApplication.id,
      start_date: leaveApplication.start_date,
      end_date: leaveApplication.end_date,
      reason: leaveApplication.reason || "",
    },
    mode: "onChange",
  });

  const updateLeaveApplication = trpc.updateLeaveApplication.useMutation({
    onSuccess: async () => {
      toast({
        title: "Success",
        variant: "default",
        description: "Leave Application Updated Successfully",
      });

      await utils.getAllLeaveApplication.invalidate();
      setOpen(false);
      form.reset();
    },
    onError: async (error) => {
      toast({
        title: "Error",
        variant: "destructive",
        description: error.message || "Failed to update leave setting",
      });
    },
  });

  const onSubmit = (values: UpdateLeaveApplicationSchema) => {
    const submissionData: UpdateLeaveApplicationSchema = {
      ...values,
      id: leaveApplication.id,
    };

    updateLeaveApplication.mutate(submissionData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-screen max-w-[500px] overflow-y-auto bg-gradient-to-br from-gray-50 to-white">
        <DialogHeader className="bg-emerald-50 p-4 rounded-t-lg">
          <DialogTitle className="text-emerald-800 text-xl font-semibold">Update Leave Setting</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-4">
            <fieldset disabled={updateLeaveApplication.isPending} className="space-y-4">
              <FormField
                control={form.control}
                name="leave_setting_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Leave Type</FormLabel>
                    <FormControl>
                      <select
                        className="w-full border border-gray-200 rounded-md p-2 text-sm focus:ring-emerald-500 focus:border-emerald-500"
                        onChange={field.onChange}
                        value={field.value}
                        data-cy="leave_setting_id"
                      >
                        <option value="">Select a leave type</option>
                        {allLeaveSettings?.map((setting) => (
                          <option key={setting.id} value={setting.id}>
                            {setting.name}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage className="text-sm text-red-500" />
                  </FormItem>
                )}
              />
  
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Start Date</FormLabel>
                    <FormControl>
                      <input
                        type="date"
                        className="w-full border border-gray-200 rounded-md p-2 text-sm focus:ring-emerald-500 focus:border-emerald-500 bg-white hover:border-emerald-400 transition-colors duration-200"
                        onChange={field.onChange}
                        value={field.value ? new Date(field.value).toISOString().split("T")[0] : ""}
                        data-cy="start_date"
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </FormControl>
                    <FormMessage className="text-sm text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">End Date</FormLabel>
                    <FormControl>
                      <input
                        type="date"
                        className="w-full border border-gray-200 rounded-md p-2 text-sm focus:ring-emerald-500 focus:border-emerald-500 bg-white hover:border-emerald-400 transition-colors duration-200"
                        onChange={field.onChange}
                        value={field.value ? new Date(field.value).toISOString().split("T")[0] : ""}
                        data-cy="end_date"
                        min={form.watch("start_date") 
                          ? new Date(form.watch("start_date") as unknown as string).toISOString().split("T")[0] 
                          : new Date().toISOString().split("T")[0]}
                      />
                    </FormControl>
                    <FormMessage className="text-sm text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Reason</FormLabel>
                    <FormControl>
                      <textarea
                        data-cy="reason"
                        placeholder="Enter reason for leave"
                        className="w-full border border-gray-200 rounded-md p-2 text-sm focus:ring-emerald-500 focus:border-emerald-500 bg-white hover:border-emerald-400 transition-colors duration-200"
                        rows={4}
                        {...field}
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
                disabled={updateLeaveApplication.isPending}
              >
                {updateLeaveApplication.isPending ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </span>
                ) : (
                    "Update Leave Application"
                )}
              </Button>
            </fieldset>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}