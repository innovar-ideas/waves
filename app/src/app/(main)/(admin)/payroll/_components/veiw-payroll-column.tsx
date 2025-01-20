import { PayrollTemplateWithStaff } from "@/app/server/types";
import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import { Button } from "@/components/ui/button";
import { ColumnDef, Row } from "@tanstack/react-table";
import { useState } from "react";
import { FaEdit } from "react-icons/fa";
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
          <FaEdit size={18} />
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
          <p className='cursor-pointer font-semibold text-primaryTheme-500'>View</p>
        </Button>
  
        {openView && <PayrollTemplateModal open={openView} setOpen={setOpenView} payrollTemplateData={template} />}
      </>
    );
  }

export const viewPayrollTemplateColumns: ColumnDef<PayrollTemplateWithStaff>[] = [
  {
    id: "serial_number",
    header: "S/N",
    cell: ({ row }) => row.index + 1,
  },
  {
    id: "Name",
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title='Payroll Template' />,
    cell: ({ row }) => <div>{row.getValue("Name")}</div>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "view",
    enableHiding: false,
    header: ({ column }) => <DataTableColumnHeader column={column} title='' />,
    cell: ({ row }) => <ViewCell row={row} />,
  },
  {
    id: "edit",
    enableHiding: false,
    header: ({ column }) => <DataTableColumnHeader column={column} title='' />,
    cell: ({ row }) => <EditCell row={row} />,
  },
];