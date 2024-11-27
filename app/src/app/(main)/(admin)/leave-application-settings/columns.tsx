"use client";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { LeaveSetting } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { BaseSyntheticEvent, useState } from "react";
import DeleteLeaveSettingModal from "./delete-leave-settings";
import UpdateLeaveSettingModal from "./update-leave-settings";

interface LeaveApplicationSettingColumnsProps{
    leaveSettings: LeaveSetting
}

export function LeaveApplicationSettingColumns({leaveSettings}: LeaveApplicationSettingColumnsProps){

    const [openUpdateLeaveSettingModal, setOpenUpdateLeaveSettingModal] = useState(false);
    const [openDeleteLeaveSettingModal, setOpenDeleteLeaveSettingModal] = useState(false);   

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
              onClick={() => setOpenUpdateLeaveSettingModal(true)}
            >
              Update Leave Setting
            </Button>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Button
              data-cy='expense-action-delete-expense'
              className='w-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-all duration-200'
              variant='outline'
              onClick={() => setOpenDeleteLeaveSettingModal(true)}
            >
              Delete
            </Button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {openUpdateLeaveSettingModal && (
        <UpdateLeaveSettingModal
            key={leaveSettings.id}
          leaveSettings={leaveSettings}
        />
      )}
      {openDeleteLeaveSettingModal && (
        <DeleteLeaveSettingModal key={leaveSettings.id} leaveSettings={leaveSettings} onClose={() => setOpenDeleteLeaveSettingModal(false)} />
      )}
    </div>
  );

}


export const columns: ColumnDef<LeaveSetting>[] = [
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
    id: "duration",
    header: () => <div className="text-emerald-800 font-semibold">Duration</div>,
    accessorKey: "duration",
    cell: ({ row }) => (
      <span className="text-emerald-600 font-medium bg-emerald-50 px-3 py-1 rounded-full">
        {row.getValue("duration")} days
      </span>
    ),
  },
  {
    id: "applicable_to",
    header: () => <div className="text-emerald-800 font-semibold">Applicable To</div>,
    accessorKey: "applicable_to",
    cell: ({ row }) => (
      <span className="capitalize text-gray-700 font-medium bg-gray-50 px-3 py-1 rounded-full">
        {row.getValue("applicable_to")}
      </span>
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-emerald-800 font-semibold">Action</div>,
    cell: ({ row }) => <LeaveApplicationSettingColumns leaveSettings={row.original} />,
  },
];
