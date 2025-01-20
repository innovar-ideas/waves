"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import { formatAmountToNaira } from "@/lib/helper-function";
import { IPayroll } from "@/app/server/types";

export const payrollColumn: ColumnDef<IPayroll>[] = [
  {
    id: "serialNumber",
    header: ({ column }) => <DataTableColumnHeader column={column} title='S/N' />,
    cell: ({ row }) => <div>{row.index + 1}</div>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "PayslipId",
    accessorKey: "PaySlipId",
    header: ({ column }) => <DataTableColumnHeader column={column} title='Payslip Id' />,
    cell: ({ row }) => <div>{row.original.id}</div>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "Earnings",
    accessorKey: "earningsTotal",
    header: ({ column }) => <DataTableColumnHeader column={column} title='Earnings Total' />,
    cell: ({ row }) => <div>{formatAmountToNaira(row.original.earningsTotal)}</div>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "Deductions",
    accessorKey: "deductionsTotal",
    header: ({ column }) => <DataTableColumnHeader column={column} title='Deductions Total' />,
    cell: ({ row }) => <div>{formatAmountToNaira(row.original.deductionsTotal)}</div>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "Gross Total Pay",
    accessorKey: "grossPay",
    header: ({ column }) => <DataTableColumnHeader column={column} title='Gross Total Pay' />,
    cell: ({ row }) => <div>{formatAmountToNaira(row.original.grossPay)}</div>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "Month",
    accessorKey: "month",
    header: ({ column }) => <DataTableColumnHeader column={column} title='Month' />,
    cell: ({ row }) => {
      const date = new Date(row.original.month);
      const month = new Intl.DateTimeFormat("en-US", { month: "long" }).format(date);
      const year = date.getUTCFullYear();
      return <span>{`${month} - ${year}`}</span>;
    },
    enableSorting: false,
    enableHiding: false,
  },
];
