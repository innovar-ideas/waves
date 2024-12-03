"use client";
import { ColumnDef } from "@tanstack/react-table";
import { LoanApplicationWithLoanSetting } from "@/app/server/module/loan";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import DisburseLoanModal from "./disburse-loan";
import Link from "next/link";

export const columns: ColumnDef<LoanApplicationWithLoanSetting>[] = [
  {
    id: "staff_name",
    header: () => <div className="text-emerald-800 font-semibold">Staff Name</div>,
    accessorKey: "user.first_name",
    cell: ({ row }) => {
      const firstName = row.original.user?.first_name || "";
      const lastName = row.original.user?.last_name || "";
      return <span className="text-gray-700 font-medium">{firstName} {lastName}</span>;
    },
  },
  {
    id: "amount",
    header: () => <div className="text-emerald-800 font-semibold">Amount</div>,
    accessorKey: "load.amount",
    cell: ({ row }) => {
      const amount = Number(row.original.load.amount) || 0;
      return <span className="text-gray-700 font-medium">${amount.toLocaleString()}</span>;
    },
  },
  {
    id: "repayment_period",
    header: () => <div className="text-emerald-800 font-semibold">Repayment Period</div>,
    accessorKey: "load.repayment_period",
    cell: ({ row }) => {
      const period = Number(row.original.load.repayment_period) || 0;
      return (
        <span className="text-gray-700 font-medium">
          {period} months
        </span>
      );
    },
  },
  {
    id: "status",
    header: () => <div className="text-emerald-800 font-semibold">Status</div>,
    accessorKey: "load.status",
    cell: ({ row }) => {
      const status = (row.original.load.status as string)?.toLowerCase() || "pending";
      const statusStyles = {
        rejected: "text-red-600 bg-red-50",
        pending: "text-yellow-600 bg-yellow-50",
        approved: "text-green-600 bg-green-50"
      }[status] || "text-gray-600 bg-gray-50";

      return (
        <span className={`${statusStyles} font-medium px-3 py-1 rounded-full`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      );
    },
  },
  {
    id: "reason",
    header: () => <div className="text-emerald-800 font-semibold">Reason</div>,
    accessorKey: "load.reason",
    cell: ({ row }) => {
      const reason = row.original.load.reason || "No reason provided";
      const truncatedReason = reason.length > 50 ? `${reason.slice(0, 50)}...` : reason;

      return (
        <div className="relative group">
          <span className="text-gray-700 font-medium cursor-help">
            {truncatedReason}
          </span>
          {reason.length > 50 && (
            <div className="absolute z-50 invisible group-hover:visible bg-gray-900 text-white p-2 rounded shadow-lg max-w-sm whitespace-normal break-words top-full left-0">
              {reason}
            </div>
          )}
        </div>
      );
    },
  },
  {
    id: "monthly_deduction",
    header: () => <div className="text-emerald-800 font-semibold">Monthly Deduction</div>,
    accessorKey: "load.monthly_deduction",
    cell: ({ row }) => {
      const deduction = Number(row.original.load.monthly_deduction) || 0;
      return <span className="text-gray-700 font-medium">${deduction.toLocaleString()}</span>;
    },
  },
  {
    accessorKey: "is_disbursed",
    header: () => <div className="text-emerald-800 font-semibold">Disbursed</div>,
    cell: ({ row }) => {
      const isDisbursed = row.original.load.is_disbursed;
      return isDisbursed ? (
        <span className="text-green-600 font-medium">Yes</span>
      ) : (
        <span className="text-red-600 font-medium">No</span>
      );
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const loan_id = row.original.loan_id;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              {loan_id && <DisburseLoanModal loan_id={loan_id} />}

            </DropdownMenuItem>
            <DropdownMenuItem className='w-full bg-emerald-500 hover:bg-emerald-600 text-white transition-all duration-200 shadow-sm block my-2'>
              <Link href={`/manage-loan/${row.original.load.id}`}>
                View details
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];