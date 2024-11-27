"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormField, FormLabel, FormMessage, FormControl, FormItem } from "@/components/ui/form";
import { Form } from "@/components/ui/form";
import { LoanApplication } from "@prisma/client";

import { trpc } from "../../../_providers/trpc-provider";
import { updateLoanApplicationSchema } from "@/app/server/dtos";
import { UpdateLoanApplicationSchema } from "@/app/server/dtos";
import { useSession } from "next-auth/react";
import { getActiveOrganizationSlugFromLocalStorage } from "@/lib/helper-function";
interface UpdateLoanApplicationFormProps {
  loanApplication: LoanApplication;
}

export default function UpdateLoanApplicationForm({ loanApplication }: UpdateLoanApplicationFormProps) {
  const { toast } = useToast();
  const utils = trpc.useUtils();
  const [open, setOpen] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const user_id = useSession().data?.user.id;
  const org = getActiveOrganizationSlugFromLocalStorage();

  const form = useForm<UpdateLoanApplicationSchema>({
    resolver: zodResolver(updateLoanApplicationSchema),
    defaultValues: {
      id: loanApplication.id,
      amount: loanApplication.amount,
      repayment_period: loanApplication.repayment_period,
      monthly_deduction: loanApplication.monthly_deduction || 0,
      reason: loanApplication.reason || "",
      user_id: user_id,
      organization_id: org
    },
    mode: "onChange",
  });

  const updateLoanApplication = trpc.updateLoanApplication.useMutation({
    onSuccess: async () => {
      toast({
        title: "Success",
        variant: "default",
        description: "Loan Application Updated Successfully",
      });

      await utils.getAllLoanApplicationByUserId.invalidate();
      setOpen(false);
      form.reset();
    },
    onError: async (error) => {
      setErrorMessage(error.message || "Failed to update loan application");
      toast({
        title: "Error",
        variant: "destructive",
        description: error.message || "Failed to update loan application",
      });
    },
  });

  const onSubmit = (values: UpdateLoanApplicationSchema) => {
    const submissionData: UpdateLoanApplicationSchema = {
      ...values,
      id: loanApplication.id,
      user_id: user_id,
      organization_id: org
    };

    updateLoanApplication.mutate(submissionData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-screen max-w-[500px] overflow-y-auto bg-gradient-to-br from-gray-50 to-white">
        <DialogHeader className="bg-emerald-50 p-4 rounded-t-lg">
          <DialogTitle className="text-emerald-800 text-xl font-semibold">Update Loan Application</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-4">
          {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                {errorMessage.includes("Staff not found") || 
                 errorMessage.includes("Loan setting not found") || 
                 errorMessage.includes("Staff salary information not found")
                  ? "An error occurred. Please try again later."
                  : errorMessage}
              </div>
            )}
            <fieldset disabled={updateLoanApplication.isPending} className="space-y-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Loan Amount</FormLabel>
                    <FormControl>
                      <input
                        type="number"
                        className="w-full border border-gray-200 rounded-md p-2 text-sm focus:ring-emerald-500 focus:border-emerald-500 bg-white hover:border-emerald-400 transition-colors duration-200"
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        value={field.value}
                        data-cy="amount"
                        min={0}
                      />
                    </FormControl>
                    <FormMessage className="text-sm text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="repayment_period"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Repayment Period</FormLabel>
                    <FormControl>
                      <input
                        type="number"
                        className="w-full border border-gray-200 rounded-md p-2 text-sm focus:ring-emerald-500 focus:border-emerald-500 bg-white hover:border-emerald-400 transition-colors duration-200"
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        value={field.value}
                        data-cy="repayment_period"
                      />
                    </FormControl>
                    <FormMessage className="text-sm text-red-500" />
                  </FormItem>
                )}
              />


<FormField
                control={form.control}
                name="monthly_deduction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Monthly Deduction</FormLabel>
                    <FormControl>
                      <input
                        type="number"
                        className="w-full border border-gray-200 rounded-md p-2 text-sm focus:ring-emerald-500 focus:border-emerald-500 bg-white hover:border-emerald-400 transition-colors duration-200"
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        value={field.value}
                        data-cy="monthly_deduction"
                      />
                    </FormControl>
                    <FormMessage className="text-sm text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Reason</FormLabel>
                    <FormControl>
                      <textarea
                        data-cy="reason"
                        placeholder="Enter reason for leave"
                        className="w-full border border-gray-200 rounded-md p-2 text-sm focus:ring-emerald-500 focus:border-emerald-500 bg-white hover:border-emerald-400 transition-colors duration-200"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-sm text-red-500" />
                  </FormItem>
                )}
              />

              <Button
                data-cy="submit"
                type="submit"
                className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2 px-4 rounded-md shadow transition-colors duration-200"
                disabled={updateLoanApplication.isPending}
              >
                {updateLoanApplication.isPending ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    updating...
                  </span>
                ) : (
                    "update For Loan"
                )}
              </Button>
            </fieldset>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}