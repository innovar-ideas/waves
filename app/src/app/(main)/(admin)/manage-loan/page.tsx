"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/app/_providers/trpc-provider";
import { DataTable } from "@/components/table/data-table";
import { columns } from "./columns";
import { LoanApplicationWithLoanSetting } from "@/app/server/module/loan";
import { getActiveOrganizationSlugFromLocalStorage } from "@/lib/helper-function";


export default function ManageLoanApplicationPage() {
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");
  const slug = getActiveOrganizationSlugFromLocalStorage();

  const { data: allApplications, isLoading: isLoadingAll } = trpc.getAllLoanApplicationByOrganizationSlug.useQuery({
    id: slug
  });

  const { data: pendingApplications, isLoading: isLoadingPending } = trpc.getAllPendingLoanApplicationByOrganizationSlug.useQuery({
    id: slug
  });

 
  const { data: approvedApplications, isLoading: isLoadingApproved } = trpc.getAllApprovedLoanApplicationByOrganizationSlug.useQuery({
    id: slug
  });


  const { data: rejectedApplications, isLoading: isLoadingRejected } = trpc.getAllRejectedLoanApplicationByOrganizationSlug.useQuery({
    id: slug
  });

  const isLoading = isLoadingAll || isLoadingPending || isLoadingApproved || isLoadingRejected;

  const getFilteredApplications = () => {
    switch (filter) {
      case "ALL":
        return allApplications || [];
      case "PENDING":
        return pendingApplications || [];
      case "APPROVED":
        return approvedApplications || [];
      case "REJECTED":
        return rejectedApplications || [];
      default:
        return [];
    }
  };

  const filteredApplications = getFilteredApplications();
  console.error("Filtered applications: ", filteredApplications);
 
  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-emerald-800 mb-4">Manage Leave Applications</h1>
        
        <div className="flex gap-4 mb-6">
          <Button
            onClick={() => setFilter("ALL")}
            className={`${
              filter === "ALL"
                ? "bg-emerald-600 text-white"
                : "bg-emerald-100 text-emerald-800"
            } hover:bg-emerald-500 hover:text-white transition-colors duration-200`}
          >
            All Applications
          </Button>

          <Button
            onClick={() => setFilter("PENDING")}
            className={`${
              filter === "PENDING"
                ? "bg-emerald-600 text-white"
                : "bg-emerald-100 text-emerald-800"
            } hover:bg-emerald-500 hover:text-white transition-colors duration-200`}
          >
            Pending Applications
          </Button>
          
          <Button
            onClick={() => setFilter("APPROVED")}
            className={`${
              filter === "APPROVED"
                ? "bg-emerald-600 text-white"
                : "bg-emerald-100 text-emerald-800"
            } hover:bg-emerald-500 hover:text-white transition-colors duration-200`}
          >
            Approved Applications
          </Button>
          
          <Button
            onClick={() => setFilter("REJECTED")}
            className={`${
              filter === "REJECTED"
                ? "bg-emerald-600 text-white"
                : "bg-emerald-100 text-emerald-800"
            } hover:bg-emerald-500 hover:text-white transition-colors duration-200`}
          >
            Rejected Applications
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md">
          <DataTable
            columns={columns}
            data={filteredApplications as unknown as LoanApplicationWithLoanSetting[]}
          />
        </div>
      )}
    </div>
  );
}