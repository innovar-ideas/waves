  "use client";
  import { useParams, useRouter } from "next/navigation";
  import { Button } from "@/components/ui/button";
  import { trpc } from "@/app/_providers/trpc-provider";
  import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
  import { Badge } from "@/components/ui/badge";
  import { DataTable } from "@/components/ui/data-table";
  import { columns, StaffPerformanceColumnType } from "./staff-performance-column";
  import { performanceReviewTemplateMetricsType } from "@/app/server/module/performance-review";

  export default function PerformanceReviewDetailsPage() {
    const router = useRouter();
    const { id } = useParams();

    // Validate id exists and is string
    if (!id || typeof id !== "string") {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
          <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-red-600">Invalid Review ID</h3>
              <Button 
                variant="outline" 
                onClick={() => router.back()}
                className="mt-4 bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Go Back
              </Button>
            </div>
          </div>
        </div>
      );
    }

    const { data: reviewAssignment, isLoading, isError } = trpc.getPerformanceReviewAssignedById.useQuery({
      id: id
    });

    const templateMetrics = reviewAssignment?.template?.metrics as unknown as performanceReviewTemplateMetricsType[] | undefined;

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

    if (isError || !reviewAssignment || !reviewAssignment.team || !reviewAssignment.template) {
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
                  onClick={() => router.back()}
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

    const transformedData = reviewAssignment.team.designations?.flatMap(designation => 
      designation.designation?.teamDesignations?.flatMap(teamDesignation => 
        teamDesignation.staffs?.map(staff => ({
          staff_name: staff.user ? `${staff.user.first_name || ""} ${staff.user.last_name || ""}`.trim() : "Unknown",
          designation_name: designation.designation?.name || "Unknown Designation",
          team_name: reviewAssignment.team?.name || "Unknown Team",
          staff: staff,
          team: reviewAssignment.team,
          template: reviewAssignment.template,
          performance_review: null
        })) || []
      ) || []
    ) || [];

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Performance Review Details</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Review template and team information for {reviewAssignment.team.name || "Unknown Team"}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Template Details */}
            <Card className="bg-white dark:bg-gray-800 shadow-lg border-0">
              <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                <CardTitle className="flex items-center gap-2 text-xl font-semibold text-emerald-800 dark:text-emerald-400">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Template Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {reviewAssignment.template.name || "Unnamed Template"}
                    </h3>
                    {reviewAssignment.template.created_by && (
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Created by {reviewAssignment.template.created_by.first_name || ""} {reviewAssignment.template.created_by.last_name || ""}
                      </p>
                    )}
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Metrics
                    </h4>

                    <div className="grid grid-cols-2 gap-3">
                      {templateMetrics?.map((metric: performanceReviewTemplateMetricsType, index: number) => (
                        <Badge key={index} variant="outline" className="py-2 px-3 text-emerald-600 border-emerald-200 dark:text-emerald-400 dark:border-emerald-800">
                          {metric.column_name || "Unnamed Metric"}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Team Details */}
            <Card className="bg-white dark:bg-gray-800 shadow-lg border-0">
              <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                <CardTitle className="flex items-center gap-2 text-xl font-semibold text-emerald-800 dark:text-emerald-400">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Team Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {reviewAssignment.team.name || "Unknown Team"}
                    </h3>
                    {reviewAssignment.team.parentTeam && (
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        Parent Team: {reviewAssignment.team.parentTeam.name || "Unknown Parent Team"}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Designations</p>
                      <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        {reviewAssignment.team.designations?.length || 0}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Staff</p>
                      <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        {reviewAssignment.team.designations?.reduce((acc, designation) => 
                          acc + (designation.designation?.teamDesignations?.reduce((total, td) => 
                            total + (td.staffs?.length || 0), 0) || 0
                          ), 0) || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Staff Performance Review List</h2>
            <DataTable columns={columns} data={transformedData as unknown as StaffPerformanceColumnType[]} />
          </div>
        </div>
      </div>
    );
  }
