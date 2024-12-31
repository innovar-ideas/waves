"use client";
import { columns } from "./_components/columns";
import { columns as roleRangeColumns } from "./_components/role-range-columns";
import { columns as roleLevelColumns } from "./_components/role-level-columns";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { trpc } from "../../../_providers/trpc-provider";
import { getActiveOrganizationSlugFromLocalStorage } from "@/lib/helper-function";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/ui/data-table";

function PerformanceReviewPage() {
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [roleLevel, setRoleLevel] = useState<number | null>(null);
  const [roleLevelMax, setRoleLevelMax] = useState<number | null>(null);
  const [roleLevelMin, setRoleLevelMin] = useState<number | null>(null);
  const [roleLevelType, setRoleLevelType] = useState<"none" | "single" | "range">("none");
  const organizationSlug = getActiveOrganizationSlugFromLocalStorage();
  
  const {data: performanceReviewTemplates} = trpc.getAllPerformanceReviewTemplateByOrganizationSlug.useQuery({
    organization_slug: organizationSlug
  });
  const {data: performanceReviewTemplatesRoleLevel} =  trpc.getAllUnassignedPerformanceReviewByOrganizationSlugAndRoleLevelOnly.useQuery({
    organization_slug: organizationSlug
  });
  const { data: performanceReviewTemplatesAssigned, isLoading: assignedLoading, isError: assignedError } = 
    trpc.getAllTeamPerformanceReviewsByOrg.useQuery({
      id: organizationSlug
    });

  const { data: performanceReviewTemplatesAssignedByRoleLevelRange, isLoading: rangeLoading, isError: rangeError } = 
    trpc.getAllUnassignedPerformanceReviewByOrganizationSlugAndRoleLevel.useQuery({
      organization_slug: organizationSlug
    });

  const {data: teams, isLoading: teamsLoading, isError: teamsError} = trpc.getTeamsByOrganizationId.useQuery({
    id: organizationSlug
  });
  const utils = trpc.useUtils();

  const assignPerformanceReviewTemplateToTeam = trpc.assignPerformanceReviewTemplateToTeam.useMutation({
    onSuccess: () => {
      setIsOpen(false);
      setSelectedTeam("");
      setSelectedTemplate("");
      setRoleLevel(null);
      setRoleLevelMax(null);
      setRoleLevelMin(null);
      setRoleLevelType("none");
       utils.getAllTeamPerformanceReviewsByOrg.invalidate().then(() => {
       setIsOpen(false);
      });
      utils.getAllUnassignedPerformanceReviewByOrganizationSlugAndRoleLevel.invalidate().then(() => {
       setIsOpen(false);
      });
      utils.getAllUnassignedPerformanceReviewByOrganizationSlugAndRoleLevelOnly.invalidate().then(() => {
       setIsOpen(false);
      });
      toast.success("Performance Review Template Assigned Successfully");
    },
   
  });

  const handleAssign = async () => {
    try {
      await assignPerformanceReviewTemplateToTeam.mutateAsync({
        team_id: selectedTeam,
        template_id: selectedTemplate,
        role_level: roleLevel || 0,
        role_level_max: roleLevelMax || 0,
        role_level_min: roleLevelMin || 0,
        organization_id: organizationSlug || ""
      });
    } catch (error) {
      console.error("Error assigning template:", error);
      toast.error("Failed to assign template");
    }
  };

  const isLoading = assignedLoading || rangeLoading || teamsLoading;
  const isError = assignedError || rangeError || teamsError;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-red-600 bg-red-50 px-4 py-3 rounded-lg border border-red-200">
          Error loading performance review data. Please try again later.
        </div>
      </div>
    );  
  }

  return (
    <div className="container mx-auto px-6 py-8 bg-gray-50 min-h-screen">
      <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Performance Review Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage and track performance reviews across your organization
            </p>
          </div>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all duration-200">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Assign Review
                </span>
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white sm:max-w-md rounded-xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-gray-900">
                  Assign Performance Review
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                <Tabs defaultValue="none" onValueChange={(value) => setRoleLevelType(value as "none" | "single" | "range")}>
                  <TabsList className="w-full grid grid-cols-3 bg-emerald-50/50 p-1 rounded-lg">
                    <TabsTrigger 
                      value="none"
                      className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white rounded-md transition-all"
                    >
                      Team Based
                    </TabsTrigger>
                    <TabsTrigger 
                      value="single"
                      className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white rounded-md transition-all"
                    >
                      Single Level
                    </TabsTrigger>
                    <TabsTrigger 
                      value="range"
                      className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white rounded-md transition-all"
                    >
                      Level Range
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                {roleLevelType === "none" && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Select Team
                    </label>
                    <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                      <SelectTrigger className="w-full border-gray-200 bg-white focus:ring-emerald-500 focus:border-emerald-500">
                        <SelectValue placeholder="Choose a team" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200">
                        {teams?.map((team) => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {roleLevelType === "single" && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Role Level
                    </label>
                    <Input
                      type="number"
                      value={roleLevel || ""}
                      onChange={(e) => setRoleLevel(Number(e.target.value))}
                      className="w-full border-gray-200 focus:ring-emerald-500 focus:border-emerald-500"
                      min={1}
                      placeholder="Enter role level"
                    />
                  </div>
                )}

                {roleLevelType === "range" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Minimum Role Level
                      </label>
                      <Input
                        type="number"
                        value={roleLevelMin || ""}
                        onChange={(e) => setRoleLevelMin(Number(e.target.value))}
                        className="w-full border-gray-200 focus:ring-emerald-500 focus:border-emerald-500"
                        min={1}
                        placeholder="Enter minimum level"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Maximum Role Level
                      </label>
                      <Input
                        type="number"
                        value={roleLevelMax || ""}
                        onChange={(e) => setRoleLevelMax(Number(e.target.value))}
                        className="w-full border-gray-200 focus:ring-emerald-500 focus:border-emerald-500"
                        min={roleLevelMin || 1}
                        placeholder="Enter maximum level"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Select Template
                  </label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger className="w-full border-gray-200 bg-white focus:ring-emerald-500 focus:border-emerald-500">
                      <SelectValue placeholder="Choose a template" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200">
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
                  disabled={!selectedTemplate || assignPerformanceReviewTemplateToTeam.isPending}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all duration-200"
                >
                  {assignPerformanceReviewTemplateToTeam.isPending ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Assigning...
                    </span>
                  ) : (
                    "Assign Template"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <Tabs defaultValue="team" className="w-full">
          <TabsList className="w-full border-b border-gray-200 px-4">
            <TabsTrigger value="team" className="px-6 py-3 text-sm font-medium data-[state=active]:text-emerald-600 data-[state=active]:border-b-2 data-[state=active]:border-emerald-600">
              Team Reviews
            </TabsTrigger>
            <TabsTrigger value="role-range" className="px-6 py-3 text-sm font-medium data-[state=active]:text-emerald-600 data-[state=active]:border-b-2 data-[state=active]:border-emerald-600">
              Role Range Reviews
            </TabsTrigger>
            <TabsTrigger value="role-level" className="px-6 py-3 text-sm font-medium data-[state=active]:text-emerald-600 data-[state=active]:border-b-2 data-[state=active]:border-emerald-600">
              Role Level Reviews
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="team" className="p-4">
            <DataTable
              data={performanceReviewTemplatesAssigned?.map(item => ({
                ...item,
                performance_review_assigned_id: item.id,
                template_name: item.template?.name || "",
                team_name: item.team?.name || "",
                created_by_name: item.template?.created_by?.first_name || "",
                number_of_designations: item.team?.designations?.length ?? 0,
                number_of_staffs: item.team?.designations.flatMap(designation => designation.designation.teamDesignations.flatMap(td => td.staffs)).length || 0,})) ?? []}
              columns={columns}
            />
          </TabsContent>

          <TabsContent value="role-range" className="p-4">
            <DataTable
              data={performanceReviewTemplatesAssignedByRoleLevelRange?.map(item => ({
                ...item,
                performance_review_assigned_id: item.id,
                template_name: item.template?.name || "",
                max_role_level: item.role_level_max || 0,
                min_role_level: item.role_level_min || 0,
                created_by_name: item.template?.created_by?.first_name || "",
                number_of_designations: item.team?.designations?.length ?? 0,
              number_of_staffs: item.team?.designations.flatMap(designation => designation.designation.teamDesignations.flatMap(td => td.staffs)).length || 0,})) ?? []}
              columns={roleRangeColumns}
            />
          </TabsContent>

          <TabsContent value="role-level" className="p-4">
            <DataTable
              data={performanceReviewTemplatesRoleLevel?.map(item => ({
                ...item,
                performance_review_assigned_id: item.id,
                template_name: item.template?.name || "",
                role_level: item.role_level || 0,
                created_by_name: item.template?.created_by?.first_name || "",
                number_of_designations: item.team?.designations?.length ?? 0,
                number_of_staffs: item.team?.designations.flatMap(designation => designation.designation.teamDesignations.flatMap(td => td.staffs)).length || 0,})) ?? []}
              columns={roleLevelColumns}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default PerformanceReviewPage;
