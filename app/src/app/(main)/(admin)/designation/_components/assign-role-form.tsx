"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { designationUserSchema } from "@/app/server/dtos";
import { trpc } from "@/app/_providers/trpc-provider";
import { toast } from "sonner";
import Select from "react-select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface AssignRoleFormProps {
  teamId: string;
}

export function AssignRoleForm({ teamId }: AssignRoleFormProps) {
  const form = useForm<z.infer<typeof designationUserSchema>>({
    resolver: zodResolver(designationUserSchema),
    defaultValues: {
      team_designation_id: teamId,
    },
  });
  const [open, setOpen] = React.useState(false);

  const utils = trpc.useUtils();

  const { data } = trpc.getAllStaffsWithoutRoles.useQuery();

  const designationRole = trpc.designateStaff.useMutation({
    onSuccess: async () => {
      toast.success("New role designated successfully");
      setOpen(false);
      utils.getAllTeamDesignation.invalidate().then(() => {
        console.log("Success");
      });
    },
    onError: (error) => {
      console.error(error);
      toast.error("Error in designating role");

    },
  });


  function onSubmit(values: z.infer<typeof designationUserSchema>) {
    console.log(values);
    designationRole.mutate({ ...values });
  }

  return (

    <div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" className="text-left px-2" > Designate Staff</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Designation</DialogTitle>
            <DialogDescription>
              Create a new designation for your team. Click save when youre done.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">

            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-lg font-semibold">Add Designation</h2>
              </div>
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sm"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="text-sm"
                  onClick={form.handleSubmit(onSubmit)}
                >
                  Save
                </Button>
              </div>
            </div>

            <Form {...form}>
              <form className="space-y-6">

                <div className="py-1">
                  <FormField
                    control={form.control}
                    name={"staff_id"}
                    render={() => (
                      <FormItem>
                        <FormLabel> Select Staff</FormLabel>
                        <FormControl>
                          <Select
                            {...form.register("staff_id")}
                            placeholder="Select staff"
                            options={data?.map((staff) => ({
                              label: staff.user.first_name + " " + staff.user.last_name,
                              value: staff.id,
                            }))}
                            onChange={(selectedOptions) => {
                              form.setValue("staff_id", selectedOptions?.value as string);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </div>

  );
}

