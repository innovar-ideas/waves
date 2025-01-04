"use client";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/utils";
import { User, UserRole } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import EditUserRole from "./edit-user-role";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

export const columns: ColumnDef<User & {roles: UserRole[]}>[] = [
  {
    header: "Name",
    accessorFn: (user) => `${user?.first_name} ${user?.last_name}`,
  },
  {
    header: "Email",
    accessorFn: (user) => `${user?.email}`,
  },
  {
    header: "Roles",
    accessorFn: (user) => `${user?.roles.map(role => role.role_name)}`,
  },
  {
    accessorKey: "created_at",
    header: "Member Since",
    cell: ({ row }) => formatDate(row.getValue("created_at")),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;

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
              <EditUserRole userID={user.id} />
              </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
