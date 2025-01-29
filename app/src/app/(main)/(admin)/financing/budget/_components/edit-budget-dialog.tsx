"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { trpc } from "@/app/_providers/trpc-provider";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BudgetFormSchema, budgetFormSchema } from "@/app/server/dtos";

interface EditBudgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budget: {
    id: string;
    name: string;
    expense_account_id?: string;
    items: {
      id: string;
      description: string;
      budgeted_amount: number;
    }[];
  };
  organizationSlug: string;
  onSuccess?: () => void;
}

export function EditBudgetDialog({ 
  open, 
  onOpenChange, 
  budget, 
  organizationSlug, 
  onSuccess 
}: EditBudgetDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: accounts } = trpc.getExpenseAccounts.useQuery({ organizationSlug: organizationSlug });
  // const { data: sessions } = trpc.getAllSessions.useQuery({ slug: organizationSlug });
  const utils = trpc.useUtils();

  const form = useForm<BudgetFormSchema>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      name: budget.name,
      expense_account_id: budget.expense_account_id,
      items: budget.items.map(item => ({
        name: item.description,
        amount: item.budgeted_amount,
      })),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const updateBudget = trpc.updateBudget.useMutation({
    onSuccess: () => {
      utils.getBudgets.invalidate();
      toast({
        title: "Success",
        description: "Budget updated successfully",
      });
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (values: BudgetFormSchema) => {
    setIsSubmitting(true);
    try {
      await updateBudget.mutateAsync({
        id: budget.id,
        name: values.name,
        session_id: values.session_id,
        expense_account_id: values.expense_account_id,
        items: values.items,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Budget</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter budget title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="expense_account_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expense Account</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select expense account" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts?.map(account => (
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

              {/* <FormField
                control={form.control}
                name="session_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Session</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select session" />
                      </SelectTrigger>
                      <SelectContent>
                        {sessions?.map(session => (
                          <SelectItem key={session.id} value={session.id}>
                            {session.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Budget Items</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ name: "", amount: 0 })}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-4 items-start">
                  <FormField
                    control={form.control}
                    name={`items.${index}.name`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input placeholder="Item name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`items.${index}.amount`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Amount"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Budget"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 