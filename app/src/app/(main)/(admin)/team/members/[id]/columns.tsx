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
import { MoreHorizontal } from "lucide-react";
import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import { Designation, StaffProfile, TeamDesignation, User } from "@prisma/client";
import MakeHeadOfDept from "../../_components/make-staff-head";

export const teamMemberColumns: ColumnDef<StaffProfile & {user: User; team_designation: (TeamDesignation & {designation: Designation} | null)}>[] = [
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
    cell: ({row}) => {
        const name = row.original.user.first_name;
        const last_name = row.original.user.last_name;

        return (
            <div>{name + " " + last_name}</div>
        );
    }
  },
  {
    accessorKey: "designation",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Designation" />
    ),
    cell: ({row}) => {
        const name = row.original.team_designation?.designation?.name;

        return (
            <div>{name}</div>
        );
    }
  },
  {
    accessorKey: "is_head_of_dept",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Head of Dept" />
    ),
    cell: ({row}) => {
        const head = row.original.is_head_of_dept;

        return (
            <div>{head ? "Yes" : "No"}</div>
        );
    }
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Joined At" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"));
      return <div>{date.toLocaleDateString()}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const team = row.original;

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
              <MakeHeadOfDept id={team.id}/>
              </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

