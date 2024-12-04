"use client";
import { useParams, useRouter } from "next/navigation";
import { trpc } from "@/app/_providers/trpc-provider";
import "react-quill/dist/quill.snow.css";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";
import { ArrowLeft } from "lucide-react";

export default function PolicyAndProcedureDetails() {
  const { id } = useParams();
  const router = useRouter();
  const user_id = useSession().data?.user?.id;
  const { toast } = useToast();
  const utils = trpc.useUtils();
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);

  const { data: policyAndProcedure, isLoading } = trpc.getPolicyAndProcedureById.useQuery({
    id: id as string
  });

  const approvePolicyAndProcedure = trpc.approvePolicyAndProcedure.useMutation({
    onSuccess: async () => {
      toast({
        title: "Success",
        description: "Policy and Procedure approved successfully",
        variant: "default",
      });
      await utils.getPolicyAndProcedureById.invalidate();
      setIsApproveModalOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to approve policy and procedure",
        variant: "destructive",
      });
    }
  });

  const handleApprove = () => {
    approvePolicyAndProcedure.mutate({
      id: id as string,
      approved_by: user_id || "",
      title: policyAndProcedure?.title || "",
      content: policyAndProcedure?.content || "",
      team_id: policyAndProcedure?.team_id || "",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-emerald-50 to-white">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!policyAndProcedure) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-emerald-50 to-white">
        <div className="text-lg text-emerald-800 font-medium">Policy and Procedure not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <Button
          onClick={() => router.push("/pulicies-and-procedures")}
          variant="ghost"
          className="mb-6 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Policies and Procedures
        </Button>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-emerald-100">
          <div className="p-8">
            <div className="flex justify-between items-start mb-8">
              <div className="space-y-3">
                <h1 className="text-4xl font-bold text-emerald-900 tracking-tight">
                  {policyAndProcedure.title}
                </h1>
                <div className="flex items-center gap-3">
                  <Badge variant={policyAndProcedure.status === "DRAFT" ? "secondary" : "default"}
                    className="px-4 py-1 text-sm font-medium">
                    {policyAndProcedure.status}
                  </Badge>
                  <Badge
                    className={`px-4 py-1 text-sm font-medium ${policyAndProcedure.is_approved
                      ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                  >
                    {policyAndProcedure.is_approved ? "Approved" : "Pending Approval"}
                  </Badge>
                </div>
              </div>
              {!policyAndProcedure.is_approved && (
                <Button
                  onClick={() => setIsApproveModalOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Approve Policy
                </Button>
              )}
            </div>

            <div className="bg-emerald-50 rounded-xl p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-emerald-700 font-semibold">Created by:</span>
                    <span className="text-emerald-900">
                      {policyAndProcedure.createdBy?.first_name || "Unknown"} {policyAndProcedure.createdBy?.last_name || "Unknown"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-emerald-700 font-semibold">Created at:</span>
                    <span className="text-emerald-900">
                      {format(new Date(policyAndProcedure.created_at), "PPP")}
                    </span>
                  </div>
                  {policyAndProcedure.team?.name && (
                    <div className="flex items-center space-x-2">
                      <span className="text-emerald-700 font-semibold">Team:</span>
                      <span className="text-emerald-900">{policyAndProcedure.team.name}</span>
                    </div>
                  )}
                </div>
                {policyAndProcedure.is_approved && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-emerald-700 font-semibold">Approved by:</span>
                      <span className="text-emerald-900">
                        {policyAndProcedure.approvedBy?.first_name || "Unknown"} {policyAndProcedure.approvedBy?.last_name || "Unknown"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="prose max-w-none bg-white rounded-xl border border-emerald-200 p-8 shadow-sm">
              <div
                dangerouslySetInnerHTML={{ __html: policyAndProcedure.content }}
                className="ql-editor !p-0"
              />
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isApproveModalOpen} onOpenChange={setIsApproveModalOpen}>
        <DialogContent className="bg-white rounded-xl border border-emerald-100">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-emerald-900">Approve Policy and Procedure</DialogTitle>
            <DialogDescription className="text-emerald-700">
              Are you sure you want to approve this policy and procedure? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="space-x-3">
            <Button
              variant="outline"
              onClick={() => setIsApproveModalOpen(false)}
              className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleApprove}
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
              disabled={approvePolicyAndProcedure.isPending}
            >
              {approvePolicyAndProcedure.isPending ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Approving...
                </span>
              ) : (
                "Confirm Approval"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
