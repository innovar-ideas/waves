"use client";

import { useParams } from "next/navigation";
import { trpc } from "@/app/_providers/trpc-provider";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

export default function LeaveApplicationDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: application, isLoading } = trpc.getLeaveApplicationById.useQuery({
    id: id
  });

  const admin_id = useSession().data?.user?.id;

  const { mutate: updateStatus } = trpc.updateLeaveApplication.useMutation({
    onSuccess: (data) => {
      if (data.status === "approved") {
        toast.success("Leave Application Approved", {
          description: "The leave application has been successfully approved."
        });
      } else if (data.status === "rejected") {
        toast.error("Leave Application Rejected", {
          description: "The leave application has been rejected."
        });
      }
      window.location.reload();
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
    updateStatus({
      id: id,
      status: newStatus,
      sender_id: admin_id as unknown as string
    });
  };

  return (
    <div className="container mx-auto py-10">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-emerald-800 mb-6">Leave Application Details</h1>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold text-emerald-700 mb-2">Employee Information</h2>
            <p><span className="font-medium">Name:</span> {application.user?.first_name} {application.user?.last_name}</p>
            <p><span className="font-medium">Email:</span> {application.user?.email}</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-emerald-700 mb-2">Leave Details</h2>
            <p><span className="font-medium">Leave Type:</span> {application.leave_setting?.name}</p>
            <p><span className="font-medium">Duration:</span> {application.leave_setting?.duration} days</p>
          </div>

          <div className="col-span-2">
            <h2 className="text-lg font-semibold text-emerald-700 mb-2">Application Details</h2>
            <p><span className="font-medium">Start Date:</span> {format(new Date(application.leave_application.start_date), "PPP")}</p>
            <p><span className="font-medium">End Date:</span> {format(new Date(application.leave_application.end_date), "PPP")}</p>
            <p><span className="font-medium">Status:</span> 
              <span className={`ml-2 px-3 py-1 rounded-full ${
                application.leave_application.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                application.leave_application.status === "approved" ? "bg-green-100 text-green-800" :
                "bg-red-100 text-red-800"
              }`}>
                {application.leave_application.status.charAt(0).toUpperCase() + application.leave_application.status.slice(1)}
              </span>
            </p>
            <p><span className="font-medium">Reason:</span> {application.leave_application.reason}</p>
          </div>
        </div>

        {application.leave_application.status === "pending" && (
          <div className="mt-8 flex gap-4">
            <Button
              onClick={() => handleStatusChange("approved")}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              Approve
            </Button>
            <Button
              onClick={() => handleStatusChange("rejected")}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Reject
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
