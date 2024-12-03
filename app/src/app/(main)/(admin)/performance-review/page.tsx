"use client";
import { DataTable } from "@/components/table/data-table";
import { columns } from "./_components/columns";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { trpc } from "../../../_providers/trpc-provider";
import { getActiveOrganizationSlugFromLocalStorage } from "@/lib/helper-function";
import { toast } from "sonner";
import { performanceReviewTemplateAssignmentColumnType } from "@/app/server/module/performance-review";

function PerformanceReviewPage() {
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const organizationSlug = getActiveOrganizationSlugFromLocalStorage();
  const {data: performanceReviewTemplates} = trpc.getAllPerformanceReviewTemplateByOrganizationSlug.useQuery({organization_slug: organizationSlug});
  const { data: performanceReviewTemplatesAssigned, isLoading, isError } = trpc.getAllAssignedPerformanceReviewTemplateToTeam.useQuery({organization_slug: organizationSlug});
  const {data: teams, isLoading: teamsLoading, isError: teamsError} = trpc.getTeamsByOrganizationId.useQuery({id: organizationSlug});
  const assignPerformanceReviewTemplateToTeam = trpc.assignPerformanceReviewTemplateToTeam.useMutation({
    onSuccess: () => {
      setIsOpen(false);
      setSelectedTeam("");
      setSelectedTemplate("");
      toast.success("Performance Review Template Assigned to Team Successfully");
    }
  });

  const handleAssign = async () => {
    try {
      await assignPerformanceReviewTemplateToTeam.mutateAsync({
        team_id: selectedTeam,
        template_id: selectedTemplate
      });
    } catch (error) {
      console.error("Error assigning template:", error);
      toast.error("Failed to assign template");
    }
  };

  if (isLoading || teamsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-800 dark:border-emerald-400" />
      </div>
    );
  }
  
  if (isError || teamsError) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-600 dark:text-red-400 dark:bg-gray-900">
        Error loading performance review. Please try again later.
      </div>
    );  
  }

  return (
    <div className="container mx-auto px-4 py-8 dark:bg-gray-900">
      <div className="mb-8 flex justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <div>
          <h1 className="text-2xl font-semibold text-emerald-800 dark:text-emerald-400">
            Performance Review 
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage performance review for your organization.
          </p>
        </div>
        
        <div className="flex gap-4">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 text-white hover:bg-emerald-700">
                Assign Review to Team
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white p-6 rounded-lg max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-emerald-800 mb-4">
                  Assign Performance Review
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Team
                  </label>
                  <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                    <SelectTrigger className="w-full border-emerald-200 focus:ring-emerald-500">
                      <SelectValue placeholder="Select a team" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {teams?.map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Template
                  </label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger className="w-full border-emerald-200 focus:ring-emerald-500">
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {performanceReviewTemplates?.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template?.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleAssign}
                  disabled={!selectedTeam || !selectedTemplate || assignPerformanceReviewTemplateToTeam.isPending}
                  className="w-full bg-emerald-600 text-white hover:bg-emerald-700 mt-4"
                >
                  {assignPerformanceReviewTemplateToTeam.isPending ? "Assigning..." : "Assign Template"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <DataTable
          columns={columns}
          data={performanceReviewTemplatesAssigned?.map(item => ({
            ...item,
            template_name: item.template_name || "",
            team_name: item.team_name || "",
            staff: item.staff || []

          })) as unknown as performanceReviewTemplateAssignmentColumnType[] || []}
          action={<></>}
        />
      </div>
    </div>
  );
}

export default PerformanceReviewPage;
