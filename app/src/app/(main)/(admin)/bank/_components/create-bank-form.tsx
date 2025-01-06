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
import { createBankSchema } from "@/app/server/dtos";
import { trpc } from "@/app/_providers/trpc-provider";
import { toast } from "sonner";
import useActiveOrganizationStore from "@/app/server/store/active-organization.store";


interface CreateTeamFormProps {
  onCancel: () => void
}

export function CreateBankForm({ onCancel }: CreateTeamFormProps) {
  const { organizationSlug } = useActiveOrganizationStore();
  const form = useForm<z.infer<typeof createBankSchema>>({
    resolver: zodResolver(createBankSchema),
    defaultValues: {
      organization_id: organizationSlug
    },
  });
  const utils = trpc.useUtils();


  const addBank = trpc.createBank.useMutation({
    onSuccess: async () => {
      toast.success("New bank created successfully");

      utils.getAllBanks.invalidate().then(() => {
        form.reset();
        onCancel();
      });
    },
    onError: (error) => {
      console.error(error);
      toast.error("Error creating bank");

    },
  });


  function onSubmit(values: z.infer<typeof createBankSchema>) {
    addBank.mutate({ ...values });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-green-100 pb-4">
        <div>
          <h2 className="text-lg font-semibold text-green-700">Add Bank</h2>
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
                  Bank Name
                </FormLabel>
                <FormControl>
                  <Input placeholder="Enter bank name" className="border-green-200 focus:border-green-400" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <div>
                  <FormField
                    control={form.control}
                    name="sort_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sort Code</FormLabel>
                        <FormControl>
                          <Input 
                           placeholder="Enter sort code"
                            {...field}
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
  );
}
