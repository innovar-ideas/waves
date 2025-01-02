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
import { AssignRoleForm } from "./assign-role-form";
import { UpdateDesignationForm } from "./edith-dessignation";
import { TeamDesignationType } from "@/app/server/module/designation";

interface DesignationColumnsProps {
  teamDesignation: TeamDesignationType
}

export default function DesignationColumns({ teamDesignation }: DesignationColumnsProps) {

  
      return (
        <>
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
                <AssignRoleForm teamId={teamDesignation?.team_id as unknown as string} />
              </DropdownMenuItem>
              <DropdownMenuItem>View team details</DropdownMenuItem>
              <DropdownMenuItem asChild>
              <UpdateDesignationForm
              designation={teamDesignation}

            />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      );


}


export const designationColumns: ColumnDef<
  TeamDesignationType
>[] = [
  {
    accessorKey: "serial_number",
    header: "S/N",
    cell: ({ row }) => <div>{row.index + 1}</div>,
  },
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    cell: ({ row }) => {
      const name = row.original.name;
      return <div>{name}</div>;
    },
  },
  {
    accessorKey: "team",
    header: "Team",
    cell: ({ row }) => {
      const team = row.original.team_name;
      return <div>{team}</div>;
    },
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
  },
  {
    accessorKey: "number_of_staffs",
    header: "No of Members",
    cell: ({ row }) => {
      const staffs = row.original.number_of_staffs;
      return <div>{staffs}</div>;
    },
  },
  {
    accessorKey: "vacancies",
    header: "Vacancies",
    cell: ({ row }) => {
      const { quantity, number_of_staffs } = row.original;
      return <div>{quantity ? quantity - (number_of_staffs ?? 0) : 0}</div>;
    },
  },
 {
  accessorKey: "created_at",
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title="Created At" />
  ),
  cell: ({ row }) => {
    const dateString = row.getValue("created_at") as string; 
    const date = new Date(dateString); 
    
  
    return <div>{date.toLocaleDateString()}</div>;
  },
}
,
  {
    id: "actions",
    cell: ({ row }) => {
      return <DesignationColumns teamDesignation={row.original} />;
    },
  },
];
