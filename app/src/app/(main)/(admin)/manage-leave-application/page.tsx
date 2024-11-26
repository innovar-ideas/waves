"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/app/_providers/trpc-provider";
import { columns } from "./columns";
import { LeaveApplication } from "@prisma/client";
import { DataTable } from "@/components/ui/data-table";

export default function ManageLeaveApplicationPage() {
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  
  // Query for all applications
  const { data: allApplications, isLoading: isLoadingAll } = trpc.getAllLeaveApplicationByOrganization.useQuery({
    organization_id: "4c9dd47e-dc50-4c5e-98ad-6625c492751f"
  });

  // Query for pending applications
  const { data: pendingApplications, isLoading: isLoadingPending } = trpc.getAllPendingLeaveApplicationByOrganization.useQuery({
    organization_id: "4c9dd47e-dc50-4c5e-98ad-6625c492751f"
  });

  // Query for approved applications
  const { data: approvedApplications, isLoading: isLoadingApproved } = trpc.getAllApprovedLeaveApplicationByOrganization.useQuery({
    organization_id: "4c9dd47e-dc50-4c5e-98ad-6625c492751f",
    status: "approved"
  });

  // Query for rejected applications
  const { data: rejectedApplications, isLoading: isLoadingRejected } = trpc.getAllRejectedLeaveApplicationByOrganization.useQuery({
    organization_id: "4c9dd47e-dc50-4c5e-98ad-6625c492751f"
  });

  const isLoading = isLoadingAll || isLoadingPending || isLoadingApproved || isLoadingRejected;

  const getFilteredApplications = () => {
    switch (filter) {
      case 'ALL':
        return allApplications || [];
      case 'PENDING':
        return pendingApplications || [];
      case 'APPROVED':
        return approvedApplications || [];
      case 'REJECTED':
        return rejectedApplications || [];
      default:
        return [];
    }
  };

  const filteredApplications = getFilteredApplications();
 
  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-emerald-800 mb-4">Manage Leave Applications</h1>
        
        <div className="flex gap-4 mb-6">
          <Button
            onClick={() => setFilter('ALL')}
            className={`${
              filter === 'ALL'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-100 text-emerald-800'
            } hover:bg-emerald-500 hover:text-white transition-colors duration-200`}
          >
            All Applications
          </Button>

          <Button
            onClick={() => setFilter('PENDING')}
            className={`${
              filter === 'PENDING'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-100 text-emerald-800'
            } hover:bg-emerald-500 hover:text-white transition-colors duration-200`}
          >
            Pending Applications
          </Button>
          
          <Button
            onClick={() => setFilter('APPROVED')}
            className={`${
              filter === 'APPROVED'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-100 text-emerald-800'
            } hover:bg-emerald-500 hover:text-white transition-colors duration-200`}
          >
            Approved Applications
          </Button>
          
          <Button
            onClick={() => setFilter('REJECTED')}
            className={`${
              filter === 'REJECTED'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-100 text-emerald-800'
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
            data={filteredApplications}
            searchKey="reason"
          />
        </div>
      )}
    </div>
  );
}
