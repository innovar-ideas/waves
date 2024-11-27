"use client";

import { ColumnDef, Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { PayrollTemplateWithStaff } from "@/app/server/module/types";
import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import { Eye, Pencil } from "lucide-react";
import { useState } from "react";
import EditPayrollTemplateModal from "./new/edit-payroll-template-modal";
import PayrollTemplateModal from "./view-payroll-template";

interface ActionProps {
    row: Row<{
      id: string;
      name: string;
    }>;
  }
  
  function EditCell({ row }: ActionProps) {
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const template = row.original;
  
    return (
      <>
        <Button
          data-cy='template-action-update-template'
          variant='ghost'
          className='h-8 w-8 p-0'
          onClick={() => setEditModalOpen(true)}
        >
          <span className='sr-only'>Edit Button</span>
          <Pencil className="h-5 w-5" />
        </Button>
  
        {isEditModalOpen && (
          <EditPayrollTemplateModal
            open={isEditModalOpen}
            setOpen={setEditModalOpen}
            payrollTemplate={template}
            onSuccess={() => setEditModalOpen(false)}
          />
        )}
      </>
    );
  }
  
  function ViewCell({ row }: ActionProps) {
    const [openView, setOpenView] = useState(false);
    const template = row.original;
  
    return (
      <>
        <Button variant='ghost' className='h-8 w-fit p-2' onClick={() => setOpenView(true)}>
          <span className='sr-only'>View Button</span>
          <Eye className="h-5 w-5" />
        </Button>
  
        {openView && <PayrollTemplateModal open={openView} setOpen={setOpenView} payrollTemplateData={template} />}
      </>
    );
  }

export const viewPayrollTempColumns: ColumnDef<PayrollTemplateWithStaff>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="px-1">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-gray-300"
          checked={table.getIsAllPageRowsSelected()}
          onChange={(e) => table.toggleAllPageRowsSelected(!!e.target.checked)}
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="px-1">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-gray-300"
          checked={row.getIsSelected()}
          onChange={(e) => row.toggleSelected(!!e.target.checked)}
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "serial_number",
    header: "S/N",
    cell: ({ row }) => (
      <div className="w-[30px] text-center font-medium text-muted-foreground">
        {row.index + 1}
      </div>
    ),
  },
  {
    id: "Name",
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Payroll Template" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="font-medium">{row.getValue("Name")}</div>
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-2">
        <ViewCell row={row} />
        <EditCell row={row} />
      </div>
    ),
  },
];

