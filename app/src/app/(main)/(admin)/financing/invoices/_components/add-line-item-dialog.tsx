"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { useToast } from "@/components/ui/use-toast";
import { trpc } from "@/app/_providers/trpc-provider";
import useActiveOrganizationStore from "@/app/server/store/active-organization.store";
import { addLineItemsSchema, AddLineItemsSchema } from "@/app/server/dtos";

interface AddLineItemDialogProps {
  sourceType: "bill" | "invoice";
  sourceId: string;
  trigger: React.ReactNode;
}

export function AddLineItemDialog({
  sourceType,
  sourceId,
  trigger,
}: AddLineItemDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const utils = trpc.useUtils();
  const { organizationSlug } = useActiveOrganizationStore();
  const form = useForm<AddLineItemsSchema>({
    resolver: zodResolver(addLineItemsSchema),
    defaultValues: {
      organization_slug: organizationSlug,
      source_type: sourceType,
      source_id: sourceId,
      line_items: [{ description: "", quantity: 1, price: 0, amount: 0 }],
    },
  });

  const addLineItems = trpc.addLineItems.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Line items added successfully",
      });
      setOpen(false);
      // Invalidate queries to refresh the data
      utils.getBills.invalidate();
      utils.getInvoices.invalidate();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AddLineItemsSchema) => {
   
    addLineItems.mutate({
      organization_slug: organizationSlug,
      source_type: sourceType,
      source_id: sourceId,
      line_items: data.line_items,
    });
  };

  const addLineItem = () => {
    const currentItems = form.getValues("line_items");
    form.setValue("line_items", [
      ...currentItems,
      { description: "", quantity: 1, price: 0, amount: 0 },
    ]);
  };

  const removeLineItem = (index: number) => {
    const currentItems = form.getValues("line_items");
    form.setValue(
      "line_items",
      currentItems.filter((_, i) => i !== index)
    );
  };

  const calculateAmount = (index: number) => {
    const items = form.getValues("line_items");
    const item = items[index];
    const amount = item.quantity * item.price;
    form.setValue(`line_items.${index}.amount`, amount);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Line Items</DialogTitle>
          <DialogDescription>
            Add one or more items to this {sourceType}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
            console.error(errors);
          })} className="space-y-4">
            {form.watch("line_items").map((_, index) => (
              <div key={index} className="flex gap-4">
                <FormField
                  control={form.control}
                  name={`line_items.${index}.description`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`line_items.${index}.quantity`}
                  render={({ field }) => (
                    <FormItem className="w-24">
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => {
                            field.onChange(Number(e.target.value));
                            calculateAmount(index);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`line_items.${index}.price`}
                  render={({ field }) => (
                    <FormItem className="w-32">
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => {
                            field.onChange(Number(e.target.value));
                            calculateAmount(index);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`line_items.${index}.amount`}
                  render={({ field }) => (
                    <FormItem className="w-32">
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} disabled />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {index > 0 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="mt-8"
                    onClick={() => removeLineItem(index)}
                  >
                    ×
                  </Button>
                )}
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

            <DialogFooter>
              <Button type="submit" disabled={addLineItems.isPending}
              onClick={() => {

                form.handleSubmit(onSubmit, (errors) => {
                  console.error(errors);
                })();
              }}
               className="bg-emerald-500 hover:bg-emerald-600  ">
                {addLineItems.isPending ? "Adding..." : "Add Items"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 