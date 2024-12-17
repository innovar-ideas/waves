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
import { Contract, StaffProfile, User } from "@prisma/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import UploadContract from "./upload-contract";

export const userContractColumns: ColumnDef<Contract & {staff_profile: StaffProfile & {user: User}}>[] = [
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
    cell: ({ row }) => {
      const template = row.original;

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
            <DropdownMenuSeparator />
            <DropdownMenuItem>
               <Link href={`/contract/view/${template.staff_profile.id}`}>
                 
                 <Button className="bg-emerald-800 text-white"> View Contract</Button>

               </Link> 
             </DropdownMenuItem>
             <DropdownMenuSeparator />

             <DropdownMenuItem asChild>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button className="bg-emerald-800 text-white"> Upload Contract</Button>
                  </SheetTrigger>
                  <SheetContent className="w-full lg:w-1/3 overflow-y-scroll">
                    <SheetHeader className="flex text-start mb-5">
                      <SheetTitle className="text-2xl">Upload Contract</SheetTitle>
                    </SheetHeader>
                    <UploadContract />
                  </SheetContent>
                </Sheet>
          </DropdownMenuItem>
          </DropdownMenuContent>

        </DropdownMenu>
      );
    },
  },
];