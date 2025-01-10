"use client";

import { useParams } from "next/navigation";
import { trpc } from "@/app/_providers/trpc-provider";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { AttendToLeaveManagementSchema } from "@/app/server/dtos";

export default function LeaveApplicationDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const session = useSession();
  const { data: application, isLoading } = trpc.getLeaveApplicationById.useQuery({
    id: id
  });
  const adminUser = session.data?.user ?? null;
  const isAdmin = session.data?.user?.roles?.some((role: { role_name: string }) => 
    role.role_name.toLowerCase().includes("admin")) ?? false;
  const staffProfile = trpc.getStaffProfileByUserId.useQuery({
    id: session?.data?.user?.id ?? ""
  });
  const isHeadOfDepartment = staffProfile.data?.is_head_of_dept ?? false;
  const approvalLevel = application?.leave_application?.approval_level as unknown as AttendToLeaveManagementSchema[] ?? [];

  const haveNotBeReviewedByHeadOfDepartment = !approvalLevel || approvalLevel.length === 0;
  const leaveHasBeenAttendedToByHeadOfDepartment = approvalLevel?.some(
    (level: AttendToLeaveManagementSchema) => level?.department_name === "head_of_department"
  ) && !!isHeadOfDepartment;
  const leaveHasBeenAttendedToByAdmin = approvalLevel?.some(
    (level: AttendToLeaveManagementSchema) => level?.department_name === "admin"
  ) && !!isAdmin;

  const financeReview: boolean = approvalLevel?.some(
    (level: AttendToLeaveManagementSchema) => level?.department_name === "head_of_department" && 
    level?.leave_approval_status === "rejected"
  ) ?? false;

  const { mutate: updateStatus } = trpc.attendToLeaveApplication.useMutation({
    onSuccess: () => {
      try {
        toast.success("Leave Application Status Updated", {
          description: "The leave application has been successfully updated."
        });
        window.location.reload();
      } catch (error) {
        console.error("Error handling success:", error);
        toast.error("An error occurred while updating the status");
      }
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      toast.error("Failed to update leave application", {
        description: error?.message || "Please try again later"
      });
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center text-red-500">
          Leave application not found
        </div>
      </div>
    );
  }

  const handleStatusChange = (newStatus: "approved" | "rejected") => {
    try {
      if(isHeadOfDepartment){
        updateStatus({
          leave_id: id,
          department_name: "head_of_department",
          approved_by: `${staffProfile.data?.user?.first_name ?? "N/A"} ${staffProfile.data?.user?.last_name ?? "N/A"}`.trim(),
          approved_at: new Date(),
          leave_approval_status: newStatus
        });
      }
      if(isAdmin){
        updateStatus({
          leave_id: id,
          department_name: "admin",
          approved_by: `${adminUser?.first_name ?? "N/A"} ${adminUser?.last_name ?? "N/A"}`.trim(),
          approved_at: new Date(),
          leave_approval_status: newStatus
        });
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-emerald-800 mb-6">Leave Application Details</h1>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold text-emerald-700 mb-2">Employee Information</h2>
            <p><span className="font-medium">Name:</span> {application.user?.first_name ?? "N/A"} {application.user?.last_name ?? "N/A"}</p>
            <p><span className="font-medium">Email:</span> {application.user?.email ?? "N/A"}</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-emerald-700 mb-2">Leave Details</h2>
            <p><span className="font-medium">Leave Type:</span> {application.leave_setting?.name ?? "N/A"}</p>
            <p><span className="font-medium">Duration:</span> {application.leave_setting?.duration ?? "N/A"} days</p>
          </div>

          <div className="col-span-2">
            <h2 className="text-lg font-semibold text-emerald-700 mb-2">Application Details</h2>
            <p><span className="font-medium">Start Date:</span> {application.leave_application?.start_date ? format(new Date(application.leave_application.start_date), "PPP") : "N/A"}</p>
            <p><span className="font-medium">End Date:</span> {application.leave_application?.end_date ? format(new Date(application.leave_application.end_date), "PPP") : "N/A"}</p>
            <p><span className="font-medium">Status:</span> 
              <span className={`ml-2 px-3 py-1 rounded-full ${
                application.leave_application?.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                application.leave_application?.status === "approved" ? "bg-green-100 text-green-800" :
                "bg-red-100 text-red-800"
              }`}>
                {(application.leave_application?.status?.charAt(0)?.toUpperCase() + application.leave_application?.status?.slice(1)) ?? "N/A"}
              </span>
            </p>
            <p><span className="font-medium">Reason:</span> {application.leave_application?.reason ?? "N/A"}</p>
          </div>
        </div>

        {isAdmin && financeReview && !haveNotBeReviewedByHeadOfDepartment && (
          <div className="md:col-span-2 bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              { !haveNotBeReviewedByHeadOfDepartment && financeReview ? (
                <p className="text-yellow-800 font-medium">
                  This leave application has been rejected by the head of department
                </p>
              ) : (
                <p className="text-yellow-800 font-medium">
                  This leave application requires head of department review before proceeding
                </p>
              )}
            </div>
          </div>
        )}

        {(isAdmin || isHeadOfDepartment) && application.leave_application?.status === "pending" && !financeReview && (
          <div className="mt-8 flex gap-4 justify-center">
            {!isHeadOfDepartment && haveNotBeReviewedByHeadOfDepartment && (
              <div className="flex items-center gap-2 bg-amber-50 p-4 rounded-lg border border-amber-200">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-amber-800 font-medium">
                  This leave application requires head of department review before admin approval can be processed
                </p>
              </div>
            )}

            {!leaveHasBeenAttendedToByHeadOfDepartment && !leaveHasBeenAttendedToByAdmin ? (
              <>
                <Button
                  onClick={() => handleStatusChange("approved")}
                  disabled={!isHeadOfDepartment && haveNotBeReviewedByHeadOfDepartment}
                  className={`${
                    !isHeadOfDepartment && haveNotBeReviewedByHeadOfDepartment 
                      ? "bg-emerald-300 cursor-not-allowed"
                      : "bg-emerald-600 hover:bg-emerald-700"
                  } text-white px-6 py-2 rounded-lg transition-colors duration-200 flex items-center`}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Approve
                </Button>
                <Button
                  onClick={() => handleStatusChange("rejected")}
                  disabled={!isHeadOfDepartment && haveNotBeReviewedByHeadOfDepartment}
                  className={`${
                    !isHeadOfDepartment && haveNotBeReviewedByHeadOfDepartment
                      ? "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed"
                      : "bg-white text-red-600 border-red-600 hover:bg-red-50"
                  } border px-6 py-2 rounded-lg transition-colors duration-200 flex items-center`}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Reject
                </Button>
              </>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
