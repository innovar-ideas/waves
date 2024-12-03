"use client";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {  MoreHorizontal } from "lucide-react";
import { PolicyAndProcedure } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { BaseSyntheticEvent, useState } from "react";
import DeleteProceduresModal from "./delete-procedures";
import ApproveProceduresModal from "./approve-produre";
import AddContent from "./add-content";


interface PolicyAndProcedureColumnsProps{
    policyAndProcedure: PolicyAndProcedure
}

export function PolicyAndProcedureColumns({policyAndProcedure}: PolicyAndProcedureColumnsProps){
    const [openDeletePolicyAndProcedureModal, setOpenDeletePolicyAndProcedureModal] = useState(false);   
    const [openApprovePolicyAndProcedureModal, setOpenApprovePolicyAndProcedureModal] = useState(false);
    const [openAddContentModal, setOpenAddContentModal] = useState(false);

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
              onClick={() => window.location.href = `/pulicies-and-procedures/update/${policyAndProcedure.id}`}
            >
              Update Policy and Procedure
            </Button>
          </DropdownMenuItem>
          {!policyAndProcedure.is_approved && (
            <DropdownMenuItem>
              <Button
                data-cy='expense-action-delete-expense'
              className='w-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-all duration-200'
              variant='outline'
              onClick={() => setOpenApprovePolicyAndProcedureModal(true)}
            >
              Approve
              </Button>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem>
            <Button
              data-cy='expense-action-delete-expense'
              className='w-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-all duration-200'
              variant='outline'
              onClick={() => setOpenDeletePolicyAndProcedureModal(true)}
            >
              Delete
            </Button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {openDeletePolicyAndProcedureModal && (
        <DeleteProceduresModal 
          key={policyAndProcedure.id} 
          policyAndProcedure={policyAndProcedure} 
          open={openDeletePolicyAndProcedureModal} 
          setOpen={setOpenDeletePolicyAndProcedureModal}
        />
      )}
      {openApprovePolicyAndProcedureModal && (
        <ApproveProceduresModal 
          key={policyAndProcedure.id} 
          policyAndProcedure={policyAndProcedure} 
          open={openApprovePolicyAndProcedureModal} 
          setOpen={setOpenApprovePolicyAndProcedureModal}
        />
      )}
      {openAddContentModal && (
        <AddContent
          policyAndProcedure={policyAndProcedure}
          open={openAddContentModal}
          setOpen={setOpenAddContentModal}
        />
      )}  
    </div>
  );
}
export const columns: ColumnDef<PolicyAndProcedure>[] = [
  {
    id: "title",
    header: () => <div className="text-emerald-800 font-semibold">Title</div>,
    accessorKey: "title", 
    cell: ({ row }) => {
      return (
        <div 
          onClick={() => window.location.href = `/pulicies-and-procedures/${row.original.id}`}
          className="text-gray-700 font-medium hover:text-emerald-600 cursor-pointer"
        >
          {row.getValue("title")}
        </div>
      );
    },
  },
  {
    id: "status",
    header: () => <div className="text-emerald-800 font-semibold">Status</div>,
    accessorKey: "status",
    cell: ({ row }) => {
      return (
        <div 
          onClick={() => window.location.href = `/pulicies-and-procedures/${row.original.id}`}
          className={`capitalize font-medium px-2 py-1 rounded-full cursor-pointer ${
            row.getValue("status") === "DRAFT" 
              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" 
              : "bg-amber-100 text-amber-700 hover:bg-amber-200"
          }`}
        >
          {row.getValue("status")}
        </div>
      );
    },
  },
  {
    id: "is_approved",
    header: () => <div className="text-emerald-800 font-semibold">Approval</div>,
    accessorKey: "is_approved",
    cell: ({ row }) => {
      return (
        <div
          onClick={() => window.location.href = `/pulicies-and-procedures/${row.original.id}`}
          className="text-emerald-600 font-medium bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-full cursor-pointer"
        >
          {row.getValue("is_approved") ? "Approved" : "Pending"}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-emerald-800 font-semibold">Action</div>,
    cell: ({ row }) => <PolicyAndProcedureColumns policyAndProcedure={row.original} />,
  },
];
