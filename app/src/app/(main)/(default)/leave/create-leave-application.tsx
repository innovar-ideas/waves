"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import useActiveOrganizationStore from "../../../server/store/active-organization.store";
import { useToast } from "@/components/ui/use-toast";
import { trpc } from "../../../_providers/trpc-provider";
import { CreateLeaveApplicationSchema, CreateLeaveSettingSchema } from "../../../server/dtos";
import { createLeaveApplicationSchema } from "../../../server/dtos";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormField, FormLabel, FormMessage, FormControl, FormItem } from "@/components/ui/form";
import { Plus } from "lucide-react";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useSession } from "next-auth/react";

interface CreateLeaveSettingFormProps {
  onSuccess?: () => void;
}

export default function CreateLeaveSettingForm({ onSuccess }: CreateLeaveSettingFormProps) {
  const { toast } = useToast();
  const utils = trpc.useUtils();
  const [open, setOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const { organizationSlug } = useActiveOrganizationStore();
  const { data: allLeaveSettings } = trpc.getAllLeaveSetting.useQuery();
  const session = useSession().data?.user.id;
  const form = useForm<CreateLeaveApplicationSchema>({
    resolver: zodResolver(createLeaveApplicationSchema),
    defaultValues: {    
      organization_id: "4c9dd47e-dc50-4c5e-98ad-6625c492751f",
      user_id: session,
      start_date: new Date(),
      end_date: new Date(),
      leave_setting_id: "",
      reason: "",
    },
    mode: "onChange",
  });
console.log(form.formState.errors)
  const createLeaveApplication = trpc.createLeaveApplication.useMutation({
    onSuccess: async () => {
      toast({
        title: "Success",
        variant: "default",
        description: "Leave Application Created Successfully",
      });
      setErrorMessage("");
      utils.getAllLeaveApplication.invalidate().then(() => {
        setOpen(false);
      });

      form.reset();
      onSuccess?.();
    },
    onError: async (error) => {
      setErrorMessage(error.message);
      toast({
        title: "Error",
        variant: "destructive",
        description: error.message || "Leave Application Creation Failed",
      });
    },
  });

  const onSubmit = (values: CreateLeaveApplicationSchema) => {

    console.log(values,"<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
    const submissionData: CreateLeaveApplicationSchema = {
      ...values,
      organization_id: "4c9dd47e-dc50-4c5e-98ad-6625c492751f",
      user_id: session || "", 
    };

    createLeaveApplication.mutate(submissionData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg transition-all duration-200" data-cy="create-leave-setting">
          <Plus className="mr-2 h-4 w-4" />
          <span>Apply For Leave</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-white rounded-lg shadow-xl">
        <DialogHeader className="bg-emerald-50 p-4 rounded-t-lg border-b border-emerald-100">
          <DialogTitle className="text-emerald-800 text-lg font-semibold">Apply For Leave</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-4">
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                {errorMessage}
              </div>
            )}
            <fieldset disabled={createLeaveApplication.isPending} className="space-y-4">
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
                        value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                        data-cy="start_date"
                        min={new Date().toISOString().split('T')[0]}
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
                        value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                        data-cy="end_date"
                        min={form.watch('start_date') ? new Date(form.watch('start_date')).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
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
                disabled={createLeaveApplication.isPending}
              >
                {createLeaveApplication.isPending ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Applying...
                  </span>
                ) : (
                    "Apply For Leave"
                )}
              </Button>
            </fieldset>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}