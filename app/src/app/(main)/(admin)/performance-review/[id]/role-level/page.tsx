"use client";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { trpc } from "@/app/_providers/trpc-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./role-level-performance-review-column";
import { StaffPerformanceColumnType } from "./role-level-performance-review-column";



export default function PerformanceReviewRoleLevelPage() {
  const params = useParams();
  const id = params.id as string;
  
    
  const { data: performanceReview, isLoading, isError } = trpc.getPerformanceReviewRoleLevelAndId.useQuery({
    id: id
  });


  // Validate id exists and is string
  if (!id || typeof id !== "string") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-red-600">Invalid Review ID</h3>
            <Button 
              variant="outline" 
              onClick={() => window.history.back()}
              className="mt-4 bg-emerald-600 text-white hover:bg-emerald-700"
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-800 border-t-transparent dark:border-emerald-400" />
          <p className="text-emerald-800 dark:text-emerald-400 font-medium">Loading review details...</p>
        </div>
      </div>
    );
  }

  if (isError || !performanceReview || !performanceReview.organization) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="text-center space-y-6">
            <svg className="mx-auto h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-red-600 dark:text-red-400">No Performance Review Found</h3>
              <p className="text-gray-600 dark:text-gray-400">The performance review you are looking for does not exist or has been deleted.</p>
            </div>
            <div className="flex justify-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => window.history.back()}
                className="bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
              >
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

const newTransformedDate: StaffPerformanceColumnType[] = [];

performanceReview.organization.teamDesignations.forEach((teamDesignation) => {
 
  teamDesignation.staffs.forEach((staff) => {
  
    const staffReview: StaffPerformanceColumnType = {
      staff_name: `${staff.user.first_name} ${staff.user.last_name}`, // Full name
      designation_name: teamDesignation.designation.name,
      team_name: teamDesignation.team?.name ?? "", // Team name
      staff: staff,
      template: performanceReview.template
    };
    newTransformedDate.push(staffReview);
  });
});

 







  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Organization-wide Performance Review</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Review for role levels for {performanceReview.role_level} 
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Organization Details */}
          <Card className="bg-white dark:bg-gray-800 shadow-lg border-0">
            <CardHeader className="border-b border-gray-100 dark:border-gray-700">
              <CardTitle className="flex items-center gap-2 text-xl font-semibold text-emerald-800 dark:text-emerald-400">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Organization Details
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {performanceReview.organization.name || "Organization"}
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Designations</p>
                    <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {performanceReview.organization.teamDesignations.length}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Staff</p>
                    <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {performanceReview.organization.teamDesignations.reduce((acc, td) => 
                        acc + td.staffs.length, 0
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role Level Details */}
          <Card className="bg-white dark:bg-gray-800 shadow-lg border-0">
            <CardHeader className="border-b border-gray-100 dark:border-gray-700">
              <CardTitle className="flex items-center gap-2 text-xl font-semibold text-emerald-800 dark:text-emerald-400">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Role Level 
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400"> Level:</span>
                  <Badge variant="outline" className="text-emerald-600 border-emerald-200 dark:text-emerald-400 dark:border-emerald-800">
                    Level {performanceReview.role_level} 
                  </Badge>
                </div>
  
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Staff Performance Review List</h2>
          <DataTable columns={columns} data={newTransformedDate as unknown as StaffPerformanceColumnType[]} />
        </div>
      </div>
    </div>
  );
}
