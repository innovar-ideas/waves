"use client";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { BaseSyntheticEvent, useState } from "react";
import UpdateLoanApplicationModal from "./update-loan";
import { LoanApplication } from "@prisma/client";
import DeleteLoanApplicationModal from "./delete";

interface LoanApplicationColumnsProps{
    loanApplication: LoanApplication
}

export function LoanApplicationColumns({loanApplication}: LoanApplicationColumnsProps){

    const [openUpdateLoanApplicationModal, setOpenUpdateLoanApplicationModal] = useState(false);
    const [openDeleteLoanApplicationModal, setOpenDeleteLoanApplicationModal] = useState(false);
    console.log(openDeleteLoanApplicationModal);

    return (
    <div onClick={(e: BaseSyntheticEvent) => e.stopPropagation()} data-cy='action-container'>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 transition-colors duration-200' data-cy='action-trigger'>
            <span className='sr-only'>Open menu</span>
            <MoreHorizontal className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className="bg-white shadow-lg border border-emerald-100 rounded-lg">
          <DropdownMenuLabel className="text-emerald-800 font-medium">Actions</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-emerald-100" />
          <DropdownMenuItem>
            <Button 
              className='w-full bg-emerald-500 hover:bg-emerald-600 text-white transition-all duration-200 shadow-sm' 
              data-cy='view-class-action' 
              onClick={() => setOpenUpdateLoanApplicationModal(true)}
            >
              Update Loan Application
            </Button>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <DeleteLoanApplicationModal 
              open={openDeleteLoanApplicationModal}
              setOpen={setOpenDeleteLoanApplicationModal}
              key={loanApplication.id} 
              loanApplication={loanApplication} 
            />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {openUpdateLoanApplicationModal && (
          <UpdateLoanApplicationModal
            key={loanApplication.id}
            loanApplication={loanApplication}
        />
      )}
    </div>
  );

}



export const columns: ColumnDef<LoanApplication>[] = [
  {
    id: "amount",
    header: () => <div className="text-emerald-800 font-semibold">Amount</div>,
    accessorKey: "amount", 
    cell: ({ row }) => {
      const amount = row.getValue("amount") as number;
      return (
        <span className="text-gray-700 font-medium">
            {amount.toLocaleString()}
        </span>
      );
    },
  },
  {
    id: "repayment_period",
    header: () => <div className="text-emerald-800 font-semibold">Repayment Period</div>,
    accessorKey: "repayment_period",
    cell: ({ row }) => {
      const repaymentPeriod = row.getValue("repayment_period") as number;
      return (
        <span className="text-gray-700 font-medium">
            {repaymentPeriod} months
        </span>
      );
    },
  },
  {
    id: "monthly_deduction",
    header: () => <div className="text-emerald-800 font-semibold">Monthly Deduction</div>,
    accessorKey: "monthly_deduction",
    cell: ({ row }) => {
      const monthlyDeduction = row.getValue("monthly_deduction") as number;
      return (
        <span className="text-gray-700 font-medium">{monthlyDeduction.toLocaleString()}</span>
      );
    },
  },
  {
    id: "status",
    header: () => <div className="text-emerald-800 font-semibold">Status</div>,
    accessorKey: "status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const statusStyles = {
        rejected: "text-red-600 bg-red-50",
        pending: "text-yellow-600 bg-yellow-50", 
        approved: "text-green-600 bg-green-50"
      }[status] || "text-gray-600 bg-gray-50";

      return (
        <span className={`${statusStyles} font-medium px-3 py-1 rounded-full`}>
          {status}
        </span>
      );
    },
  },
  {
    id: "reason",
    header: () => <div className="text-emerald-800 font-semibold">Reason</div>,
    accessorKey: "reason",
    cell: ({ row }) => {
      const reason = row.getValue("reason") as string;
      const truncatedReason = reason?.length > 50 ? `${reason.slice(0, 50)}...` : reason;
      
      return (
        <div className="relative group">
          <span className="text-gray-700 font-medium cursor-help">
            {truncatedReason}
          </span>
          {reason?.length > 50 && (
            <div className="absolute z-50 invisible group-hover:visible bg-gray-900 text-white p-2 rounded shadow-lg max-w-sm whitespace-normal break-words top-full left-0">
              {reason}
            </div>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-emerald-800 font-semibold">Action</div>,
    cell: ({ row }) => <LoanApplicationColumns loanApplication={row.original} />,
  },
];