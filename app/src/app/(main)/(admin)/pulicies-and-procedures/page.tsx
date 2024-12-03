"use client";
import { DataTable } from "@/components/table/data-table";
import { columns } from "./_componenets/column";
import CreatePolicyAndProcedure from "./_componenets/create-procedures";
import { trpc } from "../../../_providers/trpc-provider";
import { getActiveOrganizationSlugFromLocalStorage } from "@/lib/helper-function";
import { useState } from "react";
import { Button } from "@/components/ui/button";

function PuliciesAndProcedusPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const organization = getActiveOrganizationSlugFromLocalStorage();
  
  const { data: policyAndProcedures, isLoading, isError } = trpc.getAllPolicyAndProcedureByOrganization.useQuery({ organization_id: organization});

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
  };

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
        Error loading policy and procedures. Please try again later.
      </div>
    );
  }

  if (showCreateForm) {
    return (
      <CreatePolicyAndProcedure onSuccess={handleCreateSuccess} />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 dark:bg-gray-900">
      <div className="mb-8 flex justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <div>
          <h1 className="text-2xl font-semibold text-emerald-800 dark:text-emerald-400">
            Policy and Procedures
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage policy and procedures for your organization.
          </p>
        </div>
        
        <Button
          onClick={() => setShowCreateForm(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          Add Policy and Procedure
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <DataTable
          columns={columns}
          data={policyAndProcedures || []}
          action={<></>}
        />
      </div>
    </div>
  );
}

export default PuliciesAndProcedusPage;