"use client";

import { DataTable } from "@/components/ui/data-table";
import { columns } from "./_components/column";
import { trpc } from "@/app/_providers/trpc-provider";
import { getActiveOrganizationSlugFromLocalStorage } from "@/lib/helper-function";
import { Loader2 } from "lucide-react";
import { CreateTask } from "./_components/create-task";
import { useEffect, useState } from "react";

export default function TaskPage() {
  const [slug, setSlug] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    try {
      const organizationSlug = getActiveOrganizationSlugFromLocalStorage();
      setSlug(organizationSlug || "");
    } catch (err) {
      setError("Unable to get organization information");
      console.error(err);
    }
  }, []);

  const { data: tasks, isLoading, error: queryError } = trpc.getAllTasksByOrganization.useQuery({
    id: slug
  }, {
    enabled: !!slug,
    retry: 3,
  });

  if (error || queryError) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <CreateTask />
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-red-500 text-center">{error || "Something went wrong. Please try again later."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
        <CreateTask />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6">
          <DataTable 
            columns={columns} 
            data={tasks?.filter(task => task !== null && task !== undefined) || []} 
          />
        </div>
      )}
    </div>
  );
}
