"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { MoreHorizontal } from "lucide-react";
import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import { LoanApplication, LoanRepayment, User } from "@prisma/client";
import { LoanRepaymentTable } from "./view-repayment-history";

export const loanRepaymentColumns: ColumnDef<{ loan: LoanApplication & { user: User }; repayments: LoanRepayment[] }>[] = [
  {
    accessorKey: "serial_number",
    header: "S/N",
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      const designation = row.original.loan;
      return <div>{`${designation?.user?.first_name}  ${designation?.user?.last_name}`}</div>;
    }
  },

  {
    accessorKey: "team",
    header: "Loan Amount",
    cell: ({ row }) => {
      const loan = row.original.loan;
      return <div>{loan?.amount}</div>;
    }
  },
  {
    accessorKey: "fully_paid",
    header: "Fully Paid",
    cell: ({ row }) => {
      const loan = row.original.loan;
      return <div>{loan?.fully_paid ? "Yes" : "No"}</div>;
    }
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created At" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.original.loan.created_at);
      return <div>{date.toLocaleDateString()}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const repayments = row.original.repayments;

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

              <Drawer>
                <DrawerTrigger className="p-2"> View Loan History</DrawerTrigger>
                <DrawerContent className="h-[70%]">
                  <div className="mx-auto w-full px-14">
                    <div className="flex items-center justify-between flex-row-reverse px-10">
                      <DrawerClose asChild>
                        <Button variant="outline">Close</Button>
                      </DrawerClose>
                      <DrawerHeader>
                        <DrawerTitle>Loan Repayment History</DrawerTitle>
                        <DrawerDescription>
                          Viewing information
                        </DrawerDescription>
                      </DrawerHeader>
                    </div>

                    <div className="w-full">
                      <LoanRepaymentTable repayments={repayments} />

                    </div>

                  </div>
                </DrawerContent>
              </Drawer>

            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

