"use client";
import { trpc } from "@/app/_providers/trpc-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { loanRepaymentColumns } from "./_components/columns";
import { LoanRepaymentDataTable } from "./_components/data-table";

export default function LoanRepaymentPage() {
  const { data: groupedData, isPending } = trpc.getGroupedLoanRepayments.useQuery();

  if (isPending) {
    <Skeleton className='my-1.5 h-3 w-36' />;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">Loan Repayment Table</h1>

      <LoanRepaymentDataTable columns={loanRepaymentColumns} data={groupedData ?? []} />
    </div>
  );
}

