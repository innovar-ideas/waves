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
import { createAdminSchema } from "@/app/server/dtos";
import { trpc } from "@/app/_providers/trpc-provider";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import Select from "react-select";

interface CreateTeamFormProps {
  onCancel: () => void
}

export function CreateAdminForm({ onCancel }: CreateTeamFormProps) {
  const form = useForm<z.infer<typeof createAdminSchema>>({
    resolver: zodResolver(createAdminSchema),
  });
  const [confirmPassword, setConfirmPassword] = React.useState<string>();
  const utils = trpc.useUtils();

  const addAdmin = trpc.createAdmin.useMutation({
    onSuccess: async () => {
      toast.success("New admin created successfully");

      utils.getAllAdmins.invalidate().then(() => {
        form.reset();
      });
    },
    onError: (error) => {
      console.error(error);
      toast.error("Error creating admin");

    },
  });

  const { data } = trpc.getAllOrganization.useQuery();


  function onSubmit(values: z.infer<typeof createAdminSchema>) {
    if (confirmPassword !== form.getValues("password")) {
      toast.error("Password mismatch");
      return;
    }
    addAdmin.mutate({ ...values });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-lg font-semibold">Add Admin</h2>
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
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium uppercase text-muted-foreground">
                  First Name
                </FormLabel>
                <FormControl>
                  <Input placeholder="Enter first name" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium uppercase text-muted-foreground">
                  Last Name
                </FormLabel>
                <FormControl>
                  <Input placeholder="Enter last name" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium uppercase text-muted-foreground">
                  Email
                </FormLabel>
                <FormControl>
                  <Input placeholder="Enter email" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium uppercase text-muted-foreground">
                  Phone No
                </FormLabel>
                <FormControl>
                  <Input placeholder="Enter phone no" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium uppercase text-muted-foreground">
                  Password
                </FormLabel>
                <FormControl>
                  <Input placeholder="Enter password" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <div className="">
            <Label htmlFor="fullName">Confirm Password</Label>
            <Input id="fullName" onChange={(e) => setConfirmPassword(e.target.value)} placeholder="confirm password" />
          </div>

          <div className="py-1">

            <FormField
              control={form.control}
              name={"organization_id"}
              render={() => (
                <FormItem>
                  <FormLabel> Select Organization</FormLabel>
                  <FormControl>
                    <Select
                      {...form.register("organization_id")}
                      placeholder="Select team"
                      options={data?.map((org) => ({
                        label: org.name,
                        value: org.id,
                      }))}
                      onChange={(selectedOptions) => {
                        form.setValue("organization_id", selectedOptions?.value as string);
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
  );

}

