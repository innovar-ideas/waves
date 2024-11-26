"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { trpc } from "../../../_providers/trpc-provider";
import { UpdateLeaveSettingSchema } from "../../../server/dtos";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormField, FormLabel, FormMessage, FormControl, FormItem } from "@/components/ui/form";
import { Pencil } from "lucide-react";
import { Form } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@radix-ui/react-radio-group";
import { Input } from "@/components/ui/input";
import { LeaveSetting } from "@prisma/client";
import { updateLeaveSettingSchema } from "../../../server/dtos";

interface UpdateLeaveSettingFormProps {
  leaveSettings: LeaveSetting;
}

export default function UpdateLeaveSettingForm({ leaveSettings }: UpdateLeaveSettingFormProps) {
  const { toast } = useToast();
  const utils = trpc.useUtils();
  const [open, setOpen] = useState(true);

  const form = useForm<UpdateLeaveSettingSchema>({
    resolver: zodResolver(updateLeaveSettingSchema),
    defaultValues: {
      id: leaveSettings.id,
      name: leaveSettings.name,
      type: leaveSettings.type,
      duration: leaveSettings.duration,
      applicable_to: leaveSettings.applicable_to,
    },
    mode: "onChange",
  });

  const updateLeaveSetting = trpc.updateLeaveSetting.useMutation({
    onSuccess: async () => {
      toast({
        title: "Success",
        variant: "default",
        description: "Leave Setting Updated Successfully",
      });

      await utils.getAllLeaveSetting.invalidate();
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

  const onSubmit = (values: UpdateLeaveSettingSchema) => {
    const submissionData: UpdateLeaveSettingSchema = {
      ...values,
      duration: Number(values.duration),
      id: leaveSettings.id,
    };

    updateLeaveSetting.mutate(submissionData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-screen max-w-[500px] overflow-y-auto bg-gradient-to-br from-gray-50 to-white">
        <DialogHeader className="bg-emerald-50 p-4 rounded-t-lg">
          <DialogTitle className="text-emerald-800 text-xl font-semibold">Update Leave Setting</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6">
            <fieldset disabled={updateLeaveSetting.isPending}>
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="bg-white p-4 rounded-lg shadow-sm">
                      <FormLabel className="text-emerald-700 font-medium">Leave Name</FormLabel>
                      <FormControl>
                        <Input 
                          data-cy="name" 
                          placeholder="e.g. Annual Leave, Sick Leave"
                          className="border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />


                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem className="bg-white p-4 rounded-lg shadow-sm">
                      <FormLabel className="text-emerald-700 font-medium">Duration (Days)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          min="1"
                          data-cy="duration" 
                          placeholder="Enter number of days"
                          className="border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500" 
                          {...field}
                          onChange={e => field.onChange(e.target.valueAsNumber)}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
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

              </div>

              <Button
                data-cy="submit"
                type="submit"
                className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
                disabled={updateLeaveSetting.isPending}
              >
                {updateLeaveSetting.isPending ? "Updating..." : "Update Leave Setting"}
              </Button>
            </fieldset>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}