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
import { getActiveOrganizationSlugFromLocalStorage } from "@/lib/helper-function";
import { createTeamSchema } from "@/app/server/dtos";
import { trpc } from "@/app/_providers/trpc-provider";
import { toast } from "sonner";
import Select from "react-select";

interface CreateTeamFormProps {
  onCancel: () => void
}

export function CreateTeamForm({ onCancel }: CreateTeamFormProps) {
  const organization_slug = getActiveOrganizationSlugFromLocalStorage();
  const form = useForm<z.infer<typeof createTeamSchema>>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: {
      organization_id: organization_slug, // This should be set to the current organization's ID
    },
  });
  const utils = trpc.useUtils();

  const { data: parentTeam } = trpc.getAllParentTeams.useQuery();

  const addTeam = trpc.createTeam.useMutation({
    onSuccess: async () => {
      toast.success("New team created successfully");

      utils.getAllTeams.invalidate().then(() => {
        form.reset();
      });
    },
    onError: (error) => {
      console.error(error);
      toast.error("Error creating staff");

    },
  });


  function onSubmit(values: z.infer<typeof createTeamSchema>) {
  
    addTeam.mutate({ ...values });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-lg font-semibold">Add Team</h2>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-sm"
            onClick={onCancel}
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
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium uppercase text-muted-foreground">
                  Team Name
                </FormLabel>
                <FormControl>
                  <Input placeholder="Enter team name" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="py-1">

            <FormField
              control={form.control}
              name={"parent_id"}
              render={() => (
                <FormItem>
                  <FormLabel> Select Parent Team(optional)</FormLabel>
                  <FormControl>
                    <Select
                      {...form.register("parent_id")}
                      placeholder="Select team"
                      options={parentTeam?.map((role) => ({
                        label: role.name,
                        value: role.id,
                      }))}
                      onChange={(selectedOptions) => {
                        form.setValue("parent_id", selectedOptions?.value as string);
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
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium uppercase text-muted-foreground">
                  Description
                </FormLabel>
                <FormControl>
                  <textarea
                    placeholder="Enter team description"
                    className="border block resize-none outline-none p-3 min-h-[100px] w-full"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );

}

