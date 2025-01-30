"use client";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { trpc } from "@/app/_providers/trpc-provider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import useActiveOrganizationStore from "@/app/server/store/active-organization.store";
import { InvoiceSchema, invoiceSchema } from "@/app/server/dtos";

interface CreateInvoiceFormProps {
  handleCreate: () => void;
}

interface LineItem {
  description: string;
  quantity: number;
  price: number;
  amount: number;
}

export default function CreateInvoiceForm({ handleCreate }: CreateInvoiceFormProps) {
  const { toast } = useToast();
  const { organizationSlug } = useActiveOrganizationStore();
  const [lineItems, setLineItems] = useState<LineItem[]>([{ description: "", quantity: 1, price: 0, amount: 0 }]);

  // Get income accounts for selection
  const { data: accounts } = trpc.getIncomeAccounts.useQuery({ 
    organizationSlug,
  });

  const form = useForm<InvoiceSchema>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      organization_slug: organizationSlug,
    },
  });

  const createMutation = trpc.createInvoice.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Invoice created successfully",
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

  const addLineItem = () => {
    setLineItems([...lineItems, { description: "", quantity: 1, price: 0, amount: 0 }]);
  };

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    const newLineItems = [...lineItems];
    newLineItems[index] = { ...newLineItems[index], [field]: value };
    
    // Recalculate amount if quantity or price changes
    if (field === "quantity" || field === "price") {
      newLineItems[index].amount = newLineItems[index].quantity * newLineItems[index].price;
    }
    
    setLineItems(newLineItems);
  };

  const onSubmit = async (data: InvoiceSchema) => {
    if (lineItems.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one line item",
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate({
      ...data,
      line_items: lineItems,
    });
  };

  return (
    <div className="container mx-auto p-6 bg-white rounded-lg shadow-md">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="customer_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Name</FormLabel>
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
                  <FormLabel>Income Account</FormLabel>
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

          <div className="space-y-4">
            <h3 className="font-semibold">Line Items</h3>
            {lineItems.map((item, index) => (
              <div key={index} className="grid grid-cols-4 gap-4 items-end">
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input
                      value={item.description}
                      onChange={(e) => updateLineItem(index, "description", e.target.value)}
                    />
                  </FormControl>
                </FormItem>

                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateLineItem(index, "quantity", parseInt(e.target.value))}
                    />
                  </FormControl>
                </FormItem>

                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      value={item.price}
                      onChange={(e) => updateLineItem(index, "price", parseFloat(e.target.value))}
                    />
                  </FormControl>
                </FormItem>

                <div className="flex items-center gap-2">
                  <FormItem className="flex-1">
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={item.amount}
                        disabled
                      />
                    </FormControl>
                  </FormItem>
                  
                  {index > 0 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeLineItem(index)}
                    >
                      ×
                    </Button>
                  )}
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={addLineItem}
              className="w-full"
            >
              Add Another Item
            </Button>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={handleCreate}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending} className="bg-emerald-600 hover:bg-emerald-700">
              Create Invoice
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 