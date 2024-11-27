"use client";
import { DataTable } from "@/components/table/data-table";
import CreateLeaveApplication from "./create-leave-application";
import { columns } from "./columns";

import { trpc } from "../../../_providers/trpc-provider";
import { useSession } from "next-auth/react";

function LeaveApplicationPage() {
  const session = useSession().data?.user.id;
  const { data: leaveApplications, isLoading, isError } = trpc.getAllLeaveApplication.useQuery({
    user_id: session || ""
  });


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-800 dark:border-emerald-400" />
      </div>
    );
  }

  
  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-600 dark:text-red-400 dark:bg-gray-900">
        Error loading leave applications. Please try again later.
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 dark:bg-gray-900">
 
      <div className="mb-8 flex justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <div>
        <h1 className="text-2xl font-semibold text-emerald-800 dark:text-emerald-400">
          Leave Application
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
        View and manage your leave applications.
        </p>
          </div>
      
        <CreateLeaveApplication />
      </div>

      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <DataTable
          columns={columns}
          data={leaveApplications || []}
          action={<></>}
        />
      </div>
    </div>
  );
}

export default LeaveApplicationPage;