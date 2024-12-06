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
import { Input } from "@/components/ui/input";
import { createDesignationSchema } from "@/app/server/dtos";
import { trpc } from "@/app/_providers/trpc-provider";
import { toast } from "sonner";
import Select from "react-select";
import { LuArrowDown, LuArrowRight } from "react-icons/lu";
import useActiveOrganizationStore from "@/app/server/store/active-organization.store";


interface CreateTeamFormProps {
  onCancel: () => void
}

export function CreateDesignationForm({ onCancel }: CreateTeamFormProps) {
  const { organizationSlug } = useActiveOrganizationStore();
  const [openDescription, setOpenDescription] = React.useState(false);
  const form = useForm<z.infer<typeof createDesignationSchema>>({
    resolver: zodResolver(createDesignationSchema),
    defaultValues: {
      organization_id: organizationSlug
    },
  });
  const utils = trpc.useUtils();

  const { data } = trpc.getAllTeams.useQuery();

  const addDesignation = trpc.createDesignation.useMutation({
    onSuccess: async () => {
      toast.success("New role created successfully");

      utils.getAllTeamDesignation.invalidate().then(() => {
        form.reset();
      });
    },
    onError: (error) => {
      console.error(error);
      toast.error("Error creating role");

    },
  });


  function onSubmit(values: z.infer<typeof createDesignationSchema>) {
    console.log(values);
    addDesignation.mutate({ ...values });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-green-100 pb-4">
        <div>
          <h2 className="text-lg font-semibold text-green-700">Add Designation</h2>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            className="text-sm text-green-600 border-green-600 hover:bg-green-50"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            className="text-sm bg-green-600 hover:bg-green-700 text-white"
            onClick={form.handleSubmit(onSubmit)}
          >
            Save
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium uppercase text-green-700">
                  Designation Name
                </FormLabel>
                <FormControl>
                  <Input placeholder="Enter designation name" className="border-green-200 focus:border-green-400" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="py-1">
            <FormField
              control={form.control}
              name={"team_id"}
              render={() => (
                <FormItem>
                  <FormLabel className="text-green-700">Select Team</FormLabel>
                  <FormControl>
                    <Select
                      {...form.register("team_id")}
                      placeholder="Select team"
                      options={data?.map((role) => ({
                        label: role.name,
                        value: role.id,
                      }))}
                      onChange={(selectedOptions) => {
                        form.setValue("team_id", selectedOptions?.value as string);
                      }}
                      className="border-green-200"
                      styles={{
                        control: (base) => ({
                          ...base,
                          borderColor: "#e5f0e5",
                          "&:hover": {
                            borderColor: "#86efac"
                          }
                        })
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium uppercase text-green-700">
                  Quantity
                </FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Enter designation quantity" className="border-green-200 focus:border-green-400" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium uppercase text-green-700">
                  Description
                </FormLabel>
                <FormControl>
                  <textarea
                    placeholder="Enter designation description"
                    className="border border-green-200 block resize-none outline-none p-3 min-h-[100px] w-full focus:border-green-400"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Button
            type="button"
            size="sm"
            className="text-sm bg-green-600 hover:bg-green-700 text-white"
            onClick={() => setOpenDescription((prev => !prev))}
          >
            Add Team Specific JD {openDescription ? <LuArrowDown size={18} /> : <LuArrowRight size={18} />}
          </Button>

          {openDescription && <FormField
            control={form.control}
            name="team_job_description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium uppercase text-green-700">
                  Team Specific Description
                </FormLabel>
                <FormControl>
                  <textarea
                    placeholder="Enter designation description"
                    className="border border-green-200 block resize-none outline-none p-3 min-h-[100px] w-full focus:border-green-400"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />}
        </form>
      </Form>
    </div>
  );
}
