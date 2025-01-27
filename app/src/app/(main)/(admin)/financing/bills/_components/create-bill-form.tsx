"use client";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { trpc } from "@/app/_providers/trpc-provider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BillStatus } from "@prisma/client";
import useActiveOrganizationStore from "@/app/server/store/active-organization.store";
import { BillSchema, billSchema } from "@/app/server/dtos";

interface CreateBillFormProps {
  handleCreate: () => void;
}

export default function CreateBillForm({ handleCreate }: CreateBillFormProps) {
  const { toast } = useToast();
  const { organizationSlug } = useActiveOrganizationStore();

  // Get expense accounts for selection
  const { data: accounts } = trpc.getExpenseAccounts.useQuery({ 
    organizationSlug: organizationSlug 
  });

  const form = useForm<BillSchema>({
    resolver: zodResolver(billSchema),
    defaultValues: {
      organization_slug: organizationSlug,
      status: BillStatus.DRAFT,
    },
  });

  const createMutation = trpc.createBill.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Bill created successfully",
      });
      handleCreate();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: BillSchema) => {
    createMutation.mutate({
      ...data,
    });
  };

  return (
    <div className="container mx-auto p-6 bg-white rounded-lg shadow-md">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="vendor_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vendor Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="account_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expense Account</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {accounts?.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.account_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="due_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      {...field} 
                      value={field.value ? new Date(field.value).toISOString().split("T")[0] : ""}
                      onChange={(e) => field.onChange(new Date(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={handleCreate}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending} className="bg-emerald-600 hover:bg-emerald-700">
              Create Bill
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}