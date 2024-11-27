"use client";
import { DataTable } from "@/components/table/data-table";
import CreateLoanApplication from "./apply-for-loan";
import { columns } from "./columns";

import { trpc } from "../../../_providers/trpc-provider";
import { useSession } from "next-auth/react";

function LoanApplicationPage() {
  const session = useSession().data?.user.id;
  const { data: loanApplications, isLoading, isError } = trpc.getAllLoanApplicationByUserId.useQuery({
    id: session || ""
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
    <div className="container mx-auto px-4 py-8 dark:bg-  gray-900">
 
      <div className="mb-8 flex justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <div>
        <h1 className="text-2xl font-semibold text-emerald-800 dark:text-emerald-400">
          Loan Application
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
        View and manage your loan applications.
        </p>
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