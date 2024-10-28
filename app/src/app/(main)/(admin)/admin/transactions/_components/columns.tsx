"use client";

import { formatCurrency, formatDate } from "@/lib/utils";
import { Transaction } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import clsx from "clsx";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

export const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "created_at",
    header: "Date",
    cell: ({ row }) => formatDate(row.getValue("created_at")),
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => (
      <span className={clsx("block text-right", row.getValue("type") == "credit" ? "text-green-600" : "text-red-600")}>
        {row.getValue("type") == "credit" ? "+" : "-"}
        {formatCurrency(row.getValue("amount"))}
      </span>
    ),
  },
];
