import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import {ColumnDef} from "@tanstack/react-table";
import { Contract, ContractTemplate } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { UpdateContractTemplateForm } from "./update-contract-template";

const ActionCell = ({ template }: { template: ContractTemplate & {contract: Contract[]} }) => {
  const [open, setOpen] = useState(false);
  
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
          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(template.id)}>
            Copy template ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>View template</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpen(true)}>Edit template</DropdownMenuItem>
          <DropdownMenuItem>Delete template</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {open && <UpdateContractTemplateForm open={open} setOpen={setOpen} template={template} />}
    </>
  );
};

export const contractTemplateColumns: ColumnDef<ContractTemplate & {contract: Contract[]}>[] = [
    {
        accessorKey: "serial_number",
        header: "S/N",
        cell: ({ row }) => row.index + 1,
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div className="lowercase">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "type",
      header: "Contract Type", 
      cell: ({ row }) => <div>{row.getValue("type")}</div>,
    },
    {
      accessorKey: "created_at",
      header: "Created At",
      cell: ({ row }) => {
        return (
          <div>{new Date(row.getValue("created_at")).toLocaleDateString()}</div>
        );
      },
    },
    {
      accessorKey: "updated_at",
      header: "Updated At",
      cell: ({ row }) => {
        return (
          <div>{new Date(row.getValue("updated_at")).toLocaleDateString()}</div>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => <ActionCell template={row.original} />
    },
];