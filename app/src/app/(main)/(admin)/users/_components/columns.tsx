"use client";

import { formatDate } from "@/lib/utils";
import { User } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

export const columns: ColumnDef<User>[] = [
  {
    header: "Name",
    accessorFn: (user) => `${user?.first_name} ${user?.last_name}`,
  },
  {
    accessorKey: "created_at",
    header: "Member Since",
    cell: ({ row }) => formatDate(row.getValue("created_at")),
  },
];
