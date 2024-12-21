"use client";
import { DataTable } from "@/components/table/data-table";
import CreateLoanApplication from "./apply-for-loan";
import { columns } from "./columns";
import { trpc } from "../../../_providers/trpc-provider";
import { useSession } from "next-auth/react";
  
function LoanApplicationPage() {
  const { data: session } = useSession();
  const { data: loanApplications, isLoading, isError } = trpc.getAllLoanApplicationByUserId.useQuery({
    id: session?.user.id || ""
  });

  const { data: staff } = trpc.getStaffByUserId.useQuery({ id: session?.user.id || "" });
  const loanSettingCount = staff?.organization?.LoanSetting[0]?.number_of_times || 0;
  const staffNumberOfLoans = staff?.number_of_loans || 0;
  const remainingLoans = loanSettingCount - staffNumberOfLoans;
  const hasReachedLimit = remainingLoans <= 0;
  const isLastLoan = remainingLoans === 1;

  const calculateFirstWorkingDayOfNewYear = () => {
    const currentDate = new Date();
    let nextYear = currentDate.getFullYear();
    if (currentDate.getMonth() >= 11) { 
      nextYear += 1;
    }
    const firstDay = new Date(nextYear, 0, 1);
    
  
    while (firstDay.getDay() === 0 || firstDay.getDay() === 6) {
      firstDay.setDate(firstDay.getDate() + 1);
    }
    
    return firstDay;
  };

  const nextLoanDate = calculateFirstWorkingDayOfNewYear();
  const formattedNextDate = nextLoanDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long"
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-800 dark:border-emerald-400" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-600 dark:text-red-400 dark:bg-gray-900">
        Error loading loan applications. Please try again later.
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 dark:bg-gray-900">
      {hasReachedLimit && (
        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-orange-800 font-medium">
            You have reached your loan limit for this year. Your next loan application will be available from {formattedNextDate}.
          </p>
        </div>
      )}

      {isLastLoan && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 font-medium">
            Please note: This will be your last available loan for this year. Next loan applications will open on {formattedNextDate}.
          </p>
        </div>
      )}
 
      <div className="mb-8 flex justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <div>
          <h1 className="text-2xl font-semibold text-emerald-800 dark:text-emerald-400">
            Loan Application
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            View and manage your loan applications.
          </p>
          {!hasReachedLimit && (
            <p className="mt-2 text-sm text-emerald-600">
              Available Loans: {remainingLoans} of {loanSettingCount}
            </p>
          )}
        </div>
      
        <CreateLoanApplication />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <DataTable
          columns={columns}
          data={loanApplications || []}
          action={<></>}
        />
      </div>
    </div>
  );
}

export default LoanApplicationPage;