"use client";

import { ColumnDef } from "@tanstack/react-table";
import { LeaveApplicationWithLeaveSetting } from "@/app/server/module/leave";
import Link from "next/link";

export const columns: ColumnDef<LeaveApplicationWithLeaveSetting>[] = [
   {
    id: "name",
    header: () => <div className="text-emerald-800 font-semibold">Name</div>,
    accessorKey: "leave_setting.name",
    cell: ({ row }) => {
        return <span className="text-gray-700 font-medium">{row.getValue("name")}</span>;
    },
   },
    {
        id: "type",
        header: () => <div className="text-emerald-800 font-semibold">Type</div>,
        accessorKey: "leave_setting.type",
        cell: ({ row }) => {
            return <span className="text-gray-700 font-medium">{row.getValue("type")}</span>;
        },
    },
  {
    id: "start_date",
    header: () => <div className="text-emerald-800 font-semibold">Start Date</div>,
    accessorKey: "leave_application.start_date",
    cell: ({ row }) => {
      const date = row.original.leave_application.start_date;
      return (
        <span className="text-gray-700 font-medium">
          {new Date(date).toLocaleDateString()}
        </span>
      );
    },
  },
  {
    id: "end_date", 
    header: () => <div className="text-emerald-800 font-semibold">End Date</div>,
    accessorKey: "leave_application.end_date",
    cell: ({ row }) => {
      const date = row.original.leave_application.end_date;
      return (
        <span className="text-gray-700 font-medium">
          {new Date(date).toLocaleDateString()}
        </span>
      );
    },
  },
  {
    id: "status",
    header: () => <div className="text-emerald-800 font-semibold">Status</div>,
    accessorKey: "leave_application.status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const statusStyles = {
        rejected: "text-red-600 bg-red-50",
        pending: "text-yellow-600 bg-yellow-50", 
        approved: "text-green-600 bg-green-50"
      }[status] || "text-gray-600 bg-gray-50";

      return (
        <span className={`${statusStyles} font-medium px-3 py-1 rounded-full`}>
          {status}
        </span>
      );
    },
  },
  {
    id: "reason",
    header: () => <div className="text-emerald-800 font-semibold">Reason</div>,
    accessorKey: "leave_application.reason",
    cell: ({ row }) => {
      const reason = row.getValue("reason") as string;
      const truncatedReason = reason?.length > 50 ? `${reason.slice(0, 50)}...` : reason;
      
      return (
        <div className="relative group">
          <span className="text-gray-700 font-medium cursor-help">
            {truncatedReason}
          </span>
          {reason?.length > 50 && (
            <div className="absolute z-50 invisible group-hover:visible bg-gray-900 text-white p-2 rounded shadow-lg max-w-sm whitespace-normal break-words top-full left-0">
              {reason}
            </div>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <Link href={`/manage-leave-application/${row.original.leave_application.id}`}>
          <div
            className="cursor-pointer hover:bg-emerald-50 p-2 rounded transition-colors"
          >
            View Details
          </div>
        </Link>
      );
    },
  }
];
