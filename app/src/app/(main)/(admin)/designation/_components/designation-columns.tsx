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
import { Designation, StaffProfile, Team, TeamDesignation } from "@prisma/client";
import { AssignRoleForm } from "./assign-role-form";

export const designationColumns: ColumnDef<TeamDesignation & {team: Team; designation: Designation; staffs: StaffProfile[]}>[] = [
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
        const designation = row.original.designation;
      return <div>{designation?.name}</div>;
    }
  },

  {
    accessorKey: "team",
    header: "Team",
    cell: ({ row }) => {
        const team = row.original.team;
      return <div>{team?.name}</div>;
    }
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
  },
  {
    accessorKey: "sttaffs",
    header: "No of Members",
    cell: ({row}) => {
        const staffs = row.original.staffs;
        return <div>{staffs?.length}</div>;
    }
  },
  {
    accessorKey: "quantity",
    header: "Vacancies",
    cell: ({row}) => {
        const staffs = row.original.staffs;
        const quantity = row.original.quantity;
        return <div>{quantity! - staffs?.length}</div>;
    }
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created At" />
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
            <AssignRoleForm teamId={team.id} />

            </DropdownMenuItem>
            <DropdownMenuItem>View team details</DropdownMenuItem>
            <DropdownMenuItem>Edit team</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

