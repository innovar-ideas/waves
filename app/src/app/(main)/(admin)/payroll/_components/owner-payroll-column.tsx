"use client";

import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { FaPrint, FaDownload } from "react-icons/fa";
import { openInSameTab } from "@/lib/helper-function";
import { GroupedPayrollResponse } from "@/app/server/module/types";

interface ActionProps {
  month: Date;
  templateId: string;
}

function ViewCell({ month, templateId }: ActionProps) {
  const params = new URLSearchParams({ month: month.toISOString() });

  return (
    <Button
      variant='ghost'
      className='h-8 w-fit p-2'
      onClick={() => openInSameTab(`/payroll/generated-payroll/new/${templateId}/?${params.toString()}`)}
    >
      <span className='sr-only'>View Button</span>
      <p className='cursor-pointer font-semibold text-primaryTheme-500'>View</p>
    </Button>
  );
}

export const viewPayrollColumns: ColumnDef<GroupedPayrollResponse>[] = [
  {
    id: "serial_number",
    header: "S/N",
    cell: ({ row }) => row.index + 1,
  },
  {
    id: "Payroll",
    accessorKey: "payroll",
    header: ({ column }) => <DataTableColumnHeader column={column} title='Payroll' />,
    cell: ({ row }) => {
      const date = row.original.month;
      const template = row.original.templateName;

      return (
        <p className='font-semibold'>
          {date.toLocaleString("en-US", { month: "long", year: "numeric" })} {template}
        </p>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "approved_status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.approved_status;

      return(
        <p>
          {status}
        </p>
      );

    }
  },
  {
    accessorKey: "approverNames",
    header: "Approved By",
    cell: ({ row }) => {
      const approver = row.original.approverNames;

      return(
        <p>
          {approver}
        </p>
      );

    }
  },
  {
    id: "view",
    enableHiding: false,
    header: ({ column }) => <DataTableColumnHeader column={column} title='' />,
    cell: ({ row }) => {
      const payrollTemplateId = row.original?.templateId;
      const month = row.original?.month;

      console.log(payrollTemplateId, "see template Id");

      return (
        <ViewCell month={month} templateId={payrollTemplateId} />
      );
    },
  },
  {
    id: "download",
    enableHiding: false,
    header: ({ column }) => <DataTableColumnHeader column={column} title='' />,
    cell: () => {
      // const payrollId = row.original.payrolls;
      // const params = new URLSearchParams({ action: "download" });

      return (
        <div className='flex items-center justify-center'>
          <Button
            variant='ghost'
            className='h-8 w-8 p-0'
            // onClick={() => openInNewTab(`/locale/payroll-preview/${payrollId}/?${params.toString()}`)}
          >
            <span className='sr-only'>Download Button</span>
            <FaDownload />
          </Button>
        </div>
      );
    },
  },
  {
    id: "print",
    enableHiding: false,
    header: ({ column }) => <DataTableColumnHeader column={column} title='' />,
    cell: () => {
      // const payrollId = row.original.id;
      // const params = new URLSearchParams({ action: "print" });

      return (
        <div className='flex items-center justify-center'>
          <Button
            variant='ghost'
            className='h-8 w-8 p-0'
            // onClick={() => openInNewTab(`/locale/payroll-preview/${payrollId}/?${params.toString()}`)}
          >
            <span className='sr-only'>Print Button</span>
            <FaPrint />
          </Button>
        </div>
      );
    },
  },
];
