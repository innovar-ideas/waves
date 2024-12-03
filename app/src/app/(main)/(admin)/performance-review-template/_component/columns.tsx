"use client";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { PerformanceReviewTemplate } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { BaseSyntheticEvent, useState } from "react";
import DeletePerformanceReviewTemplateModal from "./delete-performance-review-template";
import UpdatePerformanceReviewTemplateModal from "./update-performance-review-template";

interface PerformanceReviewTemplateColumnsProps{
    performanceReviewTemplate: PerformanceReviewTemplate
}

export function PerformanceReviewTemplateColumns({performanceReviewTemplate}: PerformanceReviewTemplateColumnsProps){

    const [openUpdatePerformanceReviewTemplateModal, setOpenUpdatePerformanceReviewTemplateModal] = useState(false);
    const [openDeletePerformanceReviewTemplateModal, setOpenDeletePerformanceReviewTemplateModal] = useState(false);   

    return (
    <div onClick={(e: BaseSyntheticEvent) => e.stopPropagation()} data-cy='action-container'>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 transition-colors duration-200' data-cy='action-trigger'>
            <span className='sr-only'>Open menu</span>
            <MoreHorizontal className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className="bg-white shadow-lg border border-emerald-100 rounded-lg">
          <DropdownMenuLabel className="text-emerald-800 font-medium">Actions</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-emerald-100" />
          <DropdownMenuItem>
            <Button 
              className='w-full bg-emerald-500 hover:bg-emerald-600 text-white transition-all duration-200 shadow-sm' 
              data-cy='view-class-action' 
              onClick={() => setOpenUpdatePerformanceReviewTemplateModal(true)}
            >
              Update Performance Review Template
            </Button>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Button
              data-cy='expense-action-delete-expense'
              className='w-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-all duration-200'
              variant='outline'
              onClick={() => setOpenDeletePerformanceReviewTemplateModal(true)}
            >
                Delete
            </Button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {openUpdatePerformanceReviewTemplateModal && (
        <UpdatePerformanceReviewTemplateModal
            key={performanceReviewTemplate.id}
          performanceReviewTemplate={performanceReviewTemplate}
          open={openUpdatePerformanceReviewTemplateModal}
          setOpen={setOpenUpdatePerformanceReviewTemplateModal}
        />
      )}
      {openDeletePerformanceReviewTemplateModal && (
        <DeletePerformanceReviewTemplateModal 
          key={performanceReviewTemplate.id} 
          performanceReviewTemplate={performanceReviewTemplate} 
          open={openDeletePerformanceReviewTemplateModal} 
          setOpen={setOpenDeletePerformanceReviewTemplateModal} 
        />
      )}
    </div>
  );

}


export const columns: ColumnDef<PerformanceReviewTemplate>[] = [
  {
    id: "name",
    header: () => <div className="text-emerald-800 font-semibold">Name</div>,
    accessorKey: "name",
    cell: ({ row }) => (
      <span className="text-gray-700 font-medium">{row.getValue("name")}</span>
    ),
  },
  {
    id: "type",
    header: () => <div className="text-emerald-800 font-semibold">Type</div>,
    accessorKey: "type",
    cell: ({ row }) => (
      <span className={`capitalize font-medium px-2 py-1 rounded-full ${
        row.getValue("type") === "paid" 
          ? "bg-emerald-100 text-emerald-700" 
          : "bg-amber-100 text-amber-700"
      }`}>
        {row.getValue("type")}
      </span>
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-emerald-800 font-semibold">Action</div>,
    cell: ({ row }) => <PerformanceReviewTemplateColumns performanceReviewTemplate={row.original} />,
  },
];
