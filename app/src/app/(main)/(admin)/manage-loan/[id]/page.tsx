"use client";

import { useParams, useRouter } from "next/navigation";
import { trpc } from "@/app/_providers/trpc-provider";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { AttendToLoanManagementSchema } from "@/app/server/dtos";


export default function LoanApplicationDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: application, isLoading } = trpc.getLoanApplicationById.useQuery({
    id: id
  });
  const admin = useSession().data?.user;
  const isAdmin = useSession().data?.user?.roles?.some((role: { role_name: string }) => 
    role.role_name.toLowerCase().includes("admin")) ?? false;
  const isFinance = useSession().data?.user?.roles?.some((role: { role_name: string }) => 
    role.role_name.toLowerCase().includes("finance")) ?? false;
  const approvalLevel = application?.load?.approvalLevel as AttendToLoanManagementSchema[] | null;
  const haveNotBeReviewedByFinance: boolean = approvalLevel === null || approvalLevel === undefined;
  const loanHasBeenAttendedToByFinance: boolean = 
  approvalLevel !== null &&
  approvalLevel !== undefined &&
  approvalLevel.some(level => level.department_name === "finance") &&
  isFinance;
  const loanHasBeenAttendedToByAdmin: boolean = 
  approvalLevel !== null &&
  approvalLevel !== undefined &&
  approvalLevel.some(level => level.department_name === "admin") &&
  isAdmin;


  let financeReview: boolean | null = false;
  financeReview = approvalLevel && approvalLevel?.some(level => level.department_name === "finance" && level.loan_approval_status === "rejected");

  

  const { mutate: attendToLoanManagement } = trpc.attendToLoanManagement.useMutation({
    onSuccess: (data) => {
      if (data.status === "approved") {
        toast.success("Loan Application Approved", {
          description: "The loan application has been successfully approved."
        });
        
      } else if (data.status === "rejected") {
        toast.error("Loan Application Rejected", {
          description: "The loan application has been rejected."
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

  if (!application || !application.user) {
    return (
      <div className="container mx-auto py-10">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-2xl mx-auto">
          <div className="flex flex-col items-center text-center gap-4">
            <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="text-red-600 text-xl font-semibold">
              {!application ? "Loan Application Not Found" : "User Details Not Found"}
            </div>
            <div className="text-gray-600">
              {!application 
                ? "The loan application you're looking for doesn't exist or may have been deleted."
                : "The user associated with this loan application could not be found."
              }
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleStatusChange = (newStatus: "approved" | "rejected") => {


if(isFinance){

    attendToLoanManagement({
      loan_id: id ?? "",
      department_name: "finance",
      loan_approval_status: newStatus,
      approved_by: admin?.first_name + " " + admin?.last_name,
      approved_at: new Date(),
    });
  }

  if(isAdmin){
    attendToLoanManagement({
      loan_id: id ?? "",
      department_name: "admin",
      loan_approval_status: newStatus,
      approved_by: admin?.first_name + " " + admin?.last_name,
      approved_at: new Date(),
    });
  }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-6">
        <Button
          onClick={() => router.push("/manage-loan")}
          className="flex items-center bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Loan Applications
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto border border-emerald-100">
        <h1 className="text-3xl font-bold text-emerald-800 mb-8 border-b pb-4">Loan Application Details</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-emerald-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-emerald-800 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Employee Information
            </h2>
            <div className="space-y-3">
              <p className="text-gray-700"><span className="font-medium">Name:</span> {application.user?.first_name} {application.user?.last_name}</p>
              <p className="text-gray-700"><span className="font-medium">Email:</span> {application.user?.email}</p>
            </div>
          </div>

          <div className="bg-emerald-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-emerald-800 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Loan Details
            </h2>
            <div className="space-y-3">
              <p className="text-gray-700"><span className="font-medium">Amount:</span> ${application.load.amount?.toLocaleString()}</p>
              <p className="text-gray-700"><span className="font-medium">Repayment Period:</span> {application.load.repayment_period} months</p>
            </div>
          </div>

          <div className="md:col-span-2 bg-emerald-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-emerald-800 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Application Details
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700"><span className="font-medium">Reason:</span> {application.load.reason}</p>
              <div className="flex items-center">
                <span className="font-medium text-gray-700">Status:</span>
                <span className={`ml-2 px-4 py-1.5 rounded-full text-sm font-medium ${
                  !approvalLevel ? "bg-yellow-100 text-yellow-800" :
                  approvalLevel.some(level => level.loan_approval_status === "approved") ? "bg-emerald-100 text-emerald-800" :
                  approvalLevel.some(level => level.loan_approval_status === "rejected") ? "bg-red-100 text-red-800" :
                  "bg-yellow-100 text-yellow-800"
                }`}>
                  {!approvalLevel ? "Pending" : approvalLevel[0].loan_approval_status.charAt(0).toUpperCase() + approvalLevel[0].loan_approval_status.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>
        
{isAdmin && financeReview && !haveNotBeReviewedByFinance && (
  <div className="md:col-span-2 bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
    <div className="flex items-center gap-3">
      <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      { !haveNotBeReviewedByFinance && financeReview ? (
        <p className="text-yellow-800 font-medium">
          This loan application has been rejected by the finance department
        </p>
      ) : (
        <p className="text-yellow-800 font-medium">
          This loan application requires admin department review before proceeding
        </p>
      )}
      
    </div>
  </div>
)}

{(isAdmin || isFinance) && application.load.status === "pending" && !financeReview && (
  <div className="mt-8 flex gap-4 justify-center">
    {!isFinance && haveNotBeReviewedByFinance && (
      <div className="flex items-center gap-2 bg-amber-50 p-4 rounded-lg border border-amber-200">
        <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-amber-800 font-medium">
          This loan application requires finance department review before admin approval can be processed
        </p>
      </div>
    )}

  
    {!loanHasBeenAttendedToByFinance && !loanHasBeenAttendedToByAdmin ? (
      <>
        <Button
          onClick={() => handleStatusChange("approved")}
          disabled={!isFinance && haveNotBeReviewedByFinance}
          className={`${
            !isFinance && haveNotBeReviewedByFinance 
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
          disabled={!isFinance && haveNotBeReviewedByFinance}
          className={`${
            !isFinance && haveNotBeReviewedByFinance
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