"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Accounts, AccountTypeEnum } from "@prisma/client";
import { trpc } from "@/app/_providers/trpc-provider";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import useActiveOrganizationStore from "@/app/server/store/active-organization.store";
import { AccountFormValues, accountSchema } from "@/app/server/dtos";


interface AccountFormDialogProps {
  accountType?: AccountTypeEnum;
  trigger?: React.ReactNode;
  editData?: Accounts;
  parentId?: string;
}

export function AccountFormDialog({
  accountType,
  trigger,
  editData,
  parentId,
}: AccountFormDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { organizationSlug } = useActiveOrganizationStore();
  const utils = trpc.useUtils();

  // Get parent accounts for dropdown
  const { data: parentAccounts } = trpc.getParentAccounts.useQuery({
    organizationSlug,
    accountType: accountType || AccountTypeEnum.INCOME,
  });

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: editData ? {
      account_name: editData.account_name,
      account_type_enum: editData.account_type_enum,
      parent_id: editData.parent_id || undefined,
      description: editData.description || "",
      account_number: editData.account_number || undefined,
      bank_name: editData.bank_name || undefined,
      bank_branch: editData.bank_branch || undefined,
      swift_code: editData.swift_code || undefined,
      routing_number: editData.routing_number || undefined,
      is_default: editData.is_default || false,
    } : {
      organization_slug: organizationSlug,
      account_type_enum: accountType || AccountTypeEnum.INCOME,
      parent_id: parentId,
      is_default: false,
      description: "",
    },
  });

  const createMutation = trpc.createAccount.useMutation({
    onSuccess: () => {
      utils.getAccountTypeDetails.invalidate();
      utils.getAllExpensesAccounts.invalidate();
      utils.getAllIncomeAccounts.invalidate();
      utils.getInvoices.invalidate();
      utils.getBills.invalidate();
      setIsOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Account created successfully",
      });
    },
    onError: (error: { message: string }) => {
      toast({
        title: "Error",
        variant: "destructive",
        description: error.message,
      });
    },
  });

  const updateMutation = trpc.updateAccount.useMutation({
    onSuccess: () => {
      utils.getAccountTypeDetails.invalidate();
      utils.getAllExpensesAccounts.invalidate();
      utils.getAllIncomeAccounts.invalidate();
      utils.getInvoices.invalidate();
      utils.getBills.invalidate();
      setIsOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Account updated successfully",
      });
    },
    onError: (error: { message: string }) => {
      toast({
        title: "Error",
        variant: "destructive",
        description: error.message,
      });
    },
  });

  const onSubmit = (data: AccountFormValues) => {
    if (editData?.id) {
      updateMutation.mutate({
        ...data,
        id: editData.id,
      });
    } else {
      createMutation.mutate({
        ...data,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen} modal={true}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
   
      <DialogContent className="max-w-2xl"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            {editData ? "Edit Account" : "Create New Account"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, (error) => {
            console.error(error);
            toast({
              title: "Error",
              variant: "destructive",
              description: "Please fill all required fields",
            }); 
          })} className="space-y-6">
            {/* Basic Account Info */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="account_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

            </div>

            {accountType !== AccountTypeEnum.BANK && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="parent_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parent Account</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Parent Account" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {parentAccounts?.map((account) => (
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
              </div>
            )}

            {/* Bank Account Fields */}
            {accountType === AccountTypeEnum.BANK && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="account_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Number</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bank_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bank Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="bank_branch"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bank Branch</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="swift_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Swift Code</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="routing_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Routing Number</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="is_default"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>Set as Default Account</FormLabel>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-primaryTheme-500 hover:bg-primaryTheme-600">
                {editData ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 