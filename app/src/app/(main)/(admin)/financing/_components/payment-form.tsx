"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/app/_providers/trpc-provider";
import { useToast } from "@/components/ui/use-toast";
import { TransactionType } from "@prisma/client";
import useActiveOrganizationStore from "@/app/server/store/active-organization.store";
import { paymentSchema, PaymentSchema } from "@/app/server/dtos";

interface PaymentFormProps {
  sourceType: "invoice" | "bill" | "account";
  sourceId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  defaultAmount?: number;
}

export function PaymentForm({
  sourceType,
  sourceId,
  onSuccess,
  onCancel,
  defaultAmount,
}: PaymentFormProps) {
  const { toast } = useToast();
  const { organizationSlug } = useActiveOrganizationStore();
  const { data: bankAccounts } = trpc.getBankAccounts.useQuery({ organizationSlug });

  const { data: sourceOptions } = trpc.getPaymentSources.useQuery({
    organizationSlug,
    sourceType,
  }, {
    enabled: !sourceId
  });

  const form = useForm<PaymentSchema>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: defaultAmount || 0,
      payment_date: new Date(),
      payment_method: "BANK_TRANSFER",
      description: "",
      reference: "",
      bank_reference: "",
      transaction_type: sourceType === "bill" ? TransactionType.OUTFLOW : TransactionType.INFLOW,
      organization_slug: organizationSlug,
      bank_account_id: bankAccounts?.find(account => account.is_default)?.id || "",
      [sourceType === "invoice" ? "invoice_id" : sourceType === "bill" ? "bill_id" : "account_id"]: sourceId || "",
    },
  });

  const createPayment = trpc.createPayment.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Payment recorded successfully",
      });
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

  const onSubmit = (data: PaymentSchema) => {

    createPayment.mutate({
      ...data,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
        console.error(errors);
      })} className="space-y-4">
        {!sourceId && (
          <FormField
            control={form.control}
            name={sourceType === "invoice" ? "invoice_id" : sourceType === "bill" ? "bill_id" : "account_id"}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select {sourceType}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={`Select ${sourceType}`} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {sourceOptions?.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="Enter amount" 
                  {...field}
                  onChange={e => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="payment_method"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Method</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                  <SelectItem value="CARD">Card</SelectItem>
                  <SelectItem value="CHEQUE">Cheque</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />




        {form.watch("payment_method") === "BANK_TRANSFER" && (
          <FormField
            control={form.control}
            name="bank_account_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bank Account</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select bank account" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {bankAccounts?.map((account) => (
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
        )}

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Payment description" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reference"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reference Number</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Payment reference" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />



        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline"
           onClick={onCancel}
           disabled={createPayment.isPending}>
            Cancel
          </Button>
          <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600"
           disabled={createPayment.isPending} onClick={() => form.handleSubmit(onSubmit, (errors) => {
            console.error(errors);
          })}>Record Payment</Button>
        </div>
      </form>
    </Form>
  );
} 