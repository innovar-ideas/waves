import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { StaffWithContractTemplate } from "@/app/server/module/types";
import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import IndeterminateCheckbox from "@/components/class/check-box";
import CreatePayrollModal from "../../payroll/_components/new/create-payrollModal";
import Link from "next/link";

function Action({ row }: { row: StaffWithContractTemplate }) {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const staffId = row.id;
  const { contracts } = row;
  const templateId = contracts[0]?.id;
  const hasTemplate = contracts[0]?.id != null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger data-cy='payroll-action' asChild>
          <Button variant='ghost' className='h-8 w-8 p-0'>
            <span className='sr-only'>Open menu</span>
            <MoreHorizontal className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Button className='w-full' data-cy='generate-payroll-action' onClick={() => setOpenModal(true)} disabled={!hasTemplate}>
              Generate Payroll
            </Button>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Link href={`/contract/view/${staffId}`}>
                <Button className='w-full'>
                View
                </Button>
            </Link>

          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {openModal && (
        <CreatePayrollModal
          isOpen={openModal}
          onClose={() => setOpenModal(false)}
          isSingleStaff={true}
          staffId={staffId}
          templateId={templateId}
        />
      )}
    </>
  );
}

export const assignContractColumns: ColumnDef<StaffWithContractTemplate>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <IndeterminateCheckbox
        {...{
          checked: table.getIsAllRowsSelected(),
          indeterminate: table.getIsSomeRowsSelected(),
          onChange: table.getToggleAllRowsSelectedHandler(),
        }}
      />
    ),
  },
  {
    id: "name",
    accessorKey: "staff.user.first_name",
    header: ({ column }) => <DataTableColumnHeader className='font-bold' column={column} title='Assign Staff' />,
    cell: ({ row }) => {
      const firstName = row.original?.user.first_name;
      const lastName = row.original?.user.last_name;
      return <div className='select-none text-nowrap py-0.5 text-sm font-medium'>{`${firstName} ${lastName}`}</div>;
    },
    enableSorting: true,
    enableHiding: false,
  },
  {
    id: "template",
    enableHiding: false,
    header: ({ column }) => <DataTableColumnHeader column={column} title='Assigned Template' />,
    cell: ({ row }) => {
      const { contracts } = row.original;
      return <p className='cursor-pointer'>{contracts[0]?.name ?? "N/A"}</p>;
    },
  },
  {
    id: "status",
    enableHiding: false,
    header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
    cell: ({ row }) => {
      const { contracts } = row.original;
        return(
            <p>{contracts[0]?.status}</p>
        );

    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      return <Action row={row.original} />;
    },
  },
];

export default assignContractColumns;
