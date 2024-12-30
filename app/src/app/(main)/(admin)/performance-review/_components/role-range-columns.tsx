"use client";

import { ColumnDef } from "@tanstack/react-table";
import {  performanceReviewTemplateAssignmentRoleRangeColumnType } from "@/app/server/module/performance-review";
import Link from "next/link";

export const columns: ColumnDef<performanceReviewTemplateAssignmentRoleRangeColumnType>[] = [
  {
    id: "template_name",
    header: () => <div className="text-emerald-800 font-semibold">Template Name</div>,
    accessorKey: "template_name",
    cell: ({ row }) => (
      <Link 
      href={`/performance-review/${row.original.performance_review_assigned_id}/role-level-range`}
        className="text-gray-700 font-medium hover:text-emerald-600 cursor-pointer"
      >
        {row.getValue("template_name")}
      </Link>
    ),
  },
  {
    id: "max_role_level", 
    header: () => <div className="text-emerald-800 font-semibold">Max Role Level</div>,
    accessorKey: "max_role_level",
    cell: ({ row }) => (
      <Link 
        href={`/performance-review/${row.original.performance_review_assigned_id}/role-level-range`}
        className="text-gray-700 font-medium hover:text-emerald-600 cursor-pointer"
      >
        {row.getValue("max_role_level")}
      </Link>
    ),
  },
  {
    id: "min_role_level", 
    header: () => <div className="text-emerald-800 font-semibold">Min Role Level</div>,
    accessorKey: "min_role_level",
    cell: ({ row }) => (
      <Link 
        href={`/performance-review/${row.original.performance_review_assigned_id}/role-level-range`}
        className="text-gray-700 font-medium hover:text-emerald-600 cursor-pointer"
      >
        {row.getValue("min_role_level")}
      </Link>
    ),
  },
  {
    id: "created_by_name",
    header: () => <div className="text-emerald-800 font-semibold">Created By</div>,
    accessorKey: "created_by_name", 
    cell: ({ row }) => (
      <Link 
      href={`/performance-review/${row.original.performance_review_assigned_id}/role-level-range`}
        className="text-gray-700 font-medium hover:text-emerald-600 cursor-pointer"
      >
        {row.getValue("created_by_name")}
      </Link>
    ),
  },
];