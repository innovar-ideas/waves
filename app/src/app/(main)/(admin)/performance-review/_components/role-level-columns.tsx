"use client";

import { ColumnDef } from "@tanstack/react-table";
import {  performanceReviewTemplateAssignmentRoleLevelColumnType} from "@/app/server/module/performance-review";
import Link from "next/link";

export const columns: ColumnDef<performanceReviewTemplateAssignmentRoleLevelColumnType>[] = [
  {
    id: "template_name",
    header: () => <div className="text-emerald-800 font-semibold">Template Name</div>,
    accessorKey: "template_name",
    cell: ({ row }) => (
      <Link 
   href={`/performance-review/${row.original.performance_review_assigned_id}/role-level`}
   className="text-gray-700 font-medium hover:text-emerald-600 cursor-pointer"
      >
        {row.getValue("template_name")}
      </Link>
    ),
  },

  {
    id: "created_by_name",
    header: () => <div className="text-emerald-800 font-semibold">Created By</div>,
    accessorKey: "created_by_name", 
    cell: ({ row }) => (
      <Link 
       href={`/performance-review/${row.original.performance_review_assigned_id}/role-level`}
        className="text-gray-700 font-medium hover:text-emerald-600 cursor-pointer"
      >
        {row.getValue("created_by_name")}
      </Link>
    ),
  },
  {
    id: "number_of_designations",
    header: () => <div className="text-emerald-800 font-semibold">Number of Designations</div>,
    accessorKey: "number_of_designations",
    cell: ({ row }) => (
      <Link 
    href={`/performance-review/${row.original.performance_review_assigned_id}/role-level`}
   className="block"
      >
        <span className={`capitalize font-medium px-2 py-1 rounded-full ${
          row.getValue("number_of_designations") === 0 
            ? "bg-emerald-100 text-emerald-700" 
            : "bg-amber-100 text-amber-700"
        }`}>
          {row.getValue("number_of_designations")}
        </span>
      </Link>
    ),
  },
  {
    id: "role_level",
    header: () => <div className="text-emerald-800 font-semibold">Role Level</div>,
    accessorKey: "role_level",
    cell: ({ row }) => (
      <Link 
      href={`/performance-review/${row.original.performance_review_assigned_id}/role-level`}
      className="block"
      >
        <span className={`capitalize font-medium px-2 py-1 rounded-full ${
          row.getValue("role_level") === 0 
            ? "bg-emerald-100 text-emerald-700" 
            : "bg-amber-100 text-amber-700"
        }`}>
          {row.getValue("role_level")}
        </span>
      </Link>
    ),
  },
  {
    id: "number_of_staffs",
    header: () => <div className="text-emerald-800 font-semibold">Number of Staffs</div>,
    accessorKey: "number_of_staffs",
    cell: ({ row }) => (
      <Link 
        href={`/performance-review/${row.original.performance_review_assigned_id}/role-level`} className="block"
      >
        <span className={`capitalize font-medium px-2 py-1 rounded-full ${
          row.getValue("number_of_staffs") === 0 
            ? "bg-emerald-100 text-emerald-700" 
            : "bg-amber-100 text-amber-700"
        }`}>
          {row.getValue("number_of_staffs")}
        </span>
      </Link>
    ),
  },
];