  "use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { trpc } from "../../../_providers/trpc-provider";
import { ApplyForLoanSchema, applyForLoanSchema } from "../../../server/dtos";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormField, FormLabel, FormMessage, FormControl, FormItem } from "@/components/ui/form";
import { Plus } from "lucide-react";
import { Form } from "@/components/ui/form";
import { useSession } from "next-auth/react";
import { getActiveOrganizationSlugFromLocalStorage } from "@/lib/helper-function";

interface CreateLoanSettingFormProps {
  onSuccess?: () => void;
}

export default function CreateLoanSettingForm({ onSuccess }: CreateLoanSettingFormProps) {
  const orgSlug = getActiveOrganizationSlugFromLocalStorage();
  const { toast } = useToast();
  const utils = trpc.useUtils();
  const [open, setOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const session = useSession().data?.user.id;
  const staff = trpc.getStaffByUserId.useQuery({ id: session || "" });
  const loanSettingCount = staff.data?.organization?.LoanSetting[0]?.number_of_times || 0;
  const staffNumberOfLoans = staff.data?.number_of_loans || 0;
  const remainingLoans = loanSettingCount - staffNumberOfLoans;
  const hasReachedLimit = remainingLoans <= 0;

  const calculateNextJanuary = () => {
    const currentDate = new Date();
    let nextYear = currentDate.getFullYear();
    if (currentDate.getMonth() >= 11) { 
      nextYear += 1;
    }
    return new Date(nextYear, 0, 1); 
  };

  const nextLoanDate = calculateNextJanuary();
  const formattedNextDate = nextLoanDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const form = useForm<ApplyForLoanSchema>({
    resolver: zodResolver(applyForLoanSchema),
    defaultValues: {    
      organization_id: orgSlug,
      user_id: session,
      amount: 0,
      repayment_period: 0,
      reason: "",
    },
    mode: "onChange",
  });

  console.log(form.formState.errors);
  const applyForLoan = trpc.applyForLoan.useMutation({
    onSuccess: async () => {
      toast({
        title: "Success",
        variant: "default",
        description: "Loan Application Created Successfully",
      });
      setErrorMessage("");
      utils.getAllLoanApplicationByUserId.invalidate().then(() => {
        setOpen(false);
      });

      form.reset();
      onSuccess?.();
    },
    onError: async (error) => {
      setErrorMessage(error.message);
      toast({
        title: "Error",
        variant: "destructive",
        description: error.message || "Loan Application Failed",
      });
    },
  });


  const onSubmit = (values: ApplyForLoanSchema) => {
    if (hasReachedLimit) {
      setErrorMessage("You have reached the maximum number of loans allowed");
      return;
    }

    const submissionData: ApplyForLoanSchema = {
      ...values,
      organization_id: orgSlug,
      user_id: session || "", 
    };

    applyForLoan.mutate(submissionData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          size="sm" 
          className={`shadow-lg transition-all duration-200 ${hasReachedLimit ? "bg-gray-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700 text-white"}`}
          data-cy="create-leave-setting"
          disabled={hasReachedLimit}
          title={hasReachedLimit ? `You have exhausted your loan limit for this year. Next loan application will be available from ${formattedNextDate}` : "Apply for a new loan"}
        >
          <Plus className="mr-2 h-4 w-4" />
          <span>Apply For Loan</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-white rounded-lg shadow-xl">
        <DialogHeader className="bg-emerald-50 p-4 rounded-t-lg border-b border-emerald-100">
          <DialogTitle className="text-emerald-800 text-lg font-semibold">Apply For Loan</DialogTitle>
        </DialogHeader>

        <div className="p-4 bg-blue-50 border-b border-blue-100">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <div className="text-sm text-blue-700">
                <span className="font-medium">Loans Taken:</span> {staffNumberOfLoans}/{loanSettingCount}
              </div>
              <div className="text-sm text-blue-700">
                <span className="font-medium">Remaining Loans:</span> {remainingLoans}
              </div>
            </div>
            {hasReachedLimit && (
              <div className="text-sm text-orange-600 bg-orange-50 p-3 rounded-md">
                You have exhausted your loan limit for this year. Your next loan application will be available from {formattedNextDate}.
              </div>
            )}
          </div>
        </div>

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
            <fieldset disabled={applyForLoan.isPending || hasReachedLimit} className="space-y-4">
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
                        value={field.value || ""}
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
                        value={field.value || ""}
                        data-cy="repayment_period"
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
                className={`w-full mt-6 text-sm font-medium py-2 px-4 rounded-md shadow transition-colors duration-200 ${
                  hasReachedLimit 
                    ? "bg-gray-400 cursor-not-allowed" 
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                }`}
                disabled={applyForLoan.isPending || hasReachedLimit}
              >
                {applyForLoan.isPending ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Applying...
                  </span>
                ) : hasReachedLimit ? (
                  `Next loan available: ${formattedNextDate}`
                ) : (
                  "Apply For Loan"
                )}
              </Button>
            </fieldset>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}