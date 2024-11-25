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
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatMonth, getMostRecentPayroll } from "@/lib/helper-function";
import { StaffWithPayrollTemplate } from "@/app/server/module/types";
import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import IndeterminateCheckbox from "@/components/class/check-box";
import CreatePayrollModal from "./new/create-payrollModal";

const getBadgeVariant = (payrollDate: Date) => {
  const currentDate = new Date();
  const payrollMonth = new Date(payrollDate).getMonth();
  const currentMonth = currentDate.getMonth();
  const payrollYear = new Date(payrollDate).getFullYear();
  const currentYear = currentDate.getFullYear();

  if (
    (payrollYear === currentYear && payrollMonth >= currentMonth) || 
    (payrollYear > currentYear)
  ) {
    return "bg-green-100 text-green-800";
  }
  return "bg-red-100 text-red-800";
};

function Action({ row }: { row: StaffWithPayrollTemplate }) {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const staffId = row.id;
  const { payroll_template } = row;
  const templateId = payroll_template?.id;
  const hasTemplate = payroll_template?.id != null;

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

export const assignPayrollColumns: ColumnDef<StaffWithPayrollTemplate>[] = [
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
      const { payroll_template } = row.original;
      return <p className='cursor-pointer'>{payroll_template?.name ?? "N/A"}</p>;
    },
  },
  {
    id: "month",
    enableHiding: false,
    header: ({ column }) => <DataTableColumnHeader column={column} title='Last Month Generated' />,
    cell: ({ row }) => {
      const { payrolls } = row.original;
      const mostRecentPayroll = getMostRecentPayroll(payrolls);
      
      if (!mostRecentPayroll) {
        return <span className="text-gray-500">None</span>;
      }

      return (
        <Badge className={getBadgeVariant(mostRecentPayroll.month)}>
          {formatMonth(mostRecentPayroll.month)}
        </Badge>
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

export default assignPayrollColumns;
