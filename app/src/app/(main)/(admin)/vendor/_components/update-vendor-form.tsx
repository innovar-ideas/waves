"use client";

import * as React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { getActiveOrganizationSlugFromLocalStorage } from "@/lib/helper-function";
import { vendorSchema } from "@/app/server/dtos";
import { trpc } from "@/app/_providers/trpc-provider";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Accounts, AccountTypeEnum, Address, Supplier } from "@prisma/client";

const ADDRESS_TYPES = [
  { value: "billing", label: "Billing" },
  { value: "shipping", label: "Shipping" },
  { value: "office", label: "Office" },
  { value: "home", label: "Home" },
] as const;

interface UpdateVendorFormProps {
  vendor: Supplier & {addresses: Address[], accounts: Accounts[]};
  onSuccess?: () => void
};

export function UpdateVendorForm({ vendor, onSuccess }: UpdateVendorFormProps) {
  const [open, setOpen] = React.useState(false);
  const organization_slug = getActiveOrganizationSlugFromLocalStorage();
  const formattedAddress = vendor.addresses.map(item => ({
    ...item,
    street: item.street ?? undefined,
    city: item.city ?? undefined,
    state: item.state ?? undefined,
    country: item.country ?? undefined,
    postal_code: item.postal_code ?? undefined,
    type: item.type ?? undefined,
  }));

  const formattedAccounts = vendor.accounts.map(account => ({
    ...account,
    account_name: account.account_name ?? undefined,
    account_type_enum: account.account_type_enum ?? undefined,
    account_number: account.account_number ?? undefined,
    description: account.description ?? undefined,
    supplier_id: account.supplier_id ?? undefined,
    parent_id: account.parent_id ?? undefined,
    is_default: account.is_default ?? undefined,
    bank_name: account.bank_name?? undefined,
    bank_branch: account.bank_branch?? undefined,
    swift_code: account.swift_code?? undefined,
    routing_number: account.routing_number?? undefined,
  }));
  

  const form = useForm<z.infer<typeof vendorSchema>>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      ...vendor,
      phone_number: vendor?.phone_number?? undefined,
      email: vendor?.email?? undefined,
      // other_fields: vendor?.other_fields ?? undefined,
      organization_id: organization_slug,
      addresses: formattedAddress || [],
      accounts: formattedAccounts || [],
    },
  });

  const {
    fields: addressFields,
    append: appendAddress,
    remove: removeAddress,
  } = useFieldArray({
    control: form.control,
    name: "addresses",
  });

  const {
    fields: bankFields,
    append: appendBank,
    remove: removeBank,
  } = useFieldArray({
    control: form.control,
    name: "accounts",
  });

  const utils = trpc.useUtils();

  const updateVendor = trpc.updateVendor.useMutation({
    onSuccess: async () => {
      toast.success("Vendor updated successfully");
      setOpen(false);
      utils.getAllVendorsByOrganizations.invalidate().then(() => {
        onSuccess?.();
      });
    },
    onError: (error) => {
      console.error(error);
      toast.error("Error updating vendor");
    },
  });

  function onSubmit(values: z.infer<typeof vendorSchema>) {
    updateVendor.mutate({ ...values, id: vendor.id });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Update Vendor</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update Vendor</DialogTitle>
          <DialogDescription>Update vendor information. Click save when you&apos;re done.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, (e) => console.error("form: ", e))}  className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium uppercase text-muted-foreground">Vendor Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter vendor name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium uppercase text-muted-foreground">Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter vendor email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium uppercase text-muted-foreground">Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Addresses Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <FormLabel className="text-xs font-medium uppercase text-muted-foreground">Addresses</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    appendAddress({
                      type: "billing",
                      street: "",
                      city: "",
                      state: "",
                      country: "",
                      postal_code: "",
                    })
                  }
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Address
                </Button>
              </div>

              {addressFields.map((field, index) => (
                <Card key={field.id}>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`addresses.${index}.type`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select address type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {ADDRESS_TYPES.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
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
                        name={`addresses.${index}.street`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Street</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter street" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`addresses.${index}.city`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter city" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`addresses.${index}.state`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter state" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`addresses.${index}.country`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter country" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`addresses.${index}.postal_code`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Postal Code</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter postal code" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <div className="flex items-end">
                        <Button type="button" variant="destructive" size="sm" onClick={() => removeAddress(index)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Bank Accounts Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <FormLabel className="text-xs font-medium uppercase text-muted-foreground">Bank Accounts</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    appendBank({
                      organization_slug,
                      account_name: "",
                      account_type_enum: AccountTypeEnum.EXPENSE,
                      account_number: "",
                      bank_name: "",
                      bank_branch: "",
                      swift_code: "",
                      is_default: false,
                    })
                  }
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Bank Account
                </Button>
              </div>

              {bankFields.map((field, index) => (
                <Card key={field.id}>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`accounts.${index}.account_name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Account Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter account name" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`accounts.${index}.account_number`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Account Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter account number" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`accounts.${index}.bank_name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bank Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter bank name" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`accounts.${index}.bank_branch`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bank Branch</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter bank branch" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`accounts.${index}.swift_code`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Swift Code</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter swift code" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <div className="flex items-end">
                        <Button type="button" variant="destructive" size="sm" onClick={() => removeBank(index)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Update Vendor
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

