"use client";
import { DataTable } from "@/components/table/data-table";
import { columns } from "./_component/columns";

import { trpc } from "../../../_providers/trpc-provider";
import CreatePerformanceReviewTemplateForm from "./_component/create-performance-review-template-form";
// import { getActiveOrganizationSlugFromLocalStorage } from "@/lib/helper-function";

function PerformanceReviewTemplatePage() {
  // const organizationSlug = getActiveOrganizationSlugFromLocalStorage();
  const organizationSlug = "4a349807-1fb1-4f5f-9cf7-a81cd34bf7ca";
  
  const { data: performanceReviewTemplates, isLoading, isError } = trpc.getAllPerformanceReviewTemplateByOrganizationSlug.useQuery({organization_slug: organizationSlug});


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
        Error loading performance review templates. Please try again later.
      </div>
    );  
  }

  return (
    <div className="container mx-auto px-4 py-8 dark:bg-gray-900">
 
      <div className="mb-8 flex justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <div>
        <h1 className="text-2xl font-semibold text-emerald-800 dark:text-emerald-400">
          Performance Review Templates
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Manage performance review templates for your organization.
        </p>
          </div>
      
        <CreatePerformanceReviewTemplateForm />
      </div>

      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <DataTable
          columns={columns}
          data={performanceReviewTemplates || []}
          action={<></>}
        />
      </div>
    </div>
  );
}

export default PerformanceReviewTemplatePage;
