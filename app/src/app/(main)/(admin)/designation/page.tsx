"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { trpc } from "@/app/_providers/trpc-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { DesignationDataTable } from "./_components/designation-data-table";
import { designationColumns } from "./_components/designation-columns";
import { CreateDesignationForm } from "./_components/create-designation-form";
import { TeamDesignationType } from "@/app/server/module/designation";
import useActiveOrganizationStore from "@/app/server/store/active-organization.store";


export default function DesignationPage() {
  const [open, setOpen] = useState(false);
  const { organizationSlug } = useActiveOrganizationStore();
  const { data: designations, isPending } = trpc.getAllTeamDesignationsByOrganizationId.useQuery({
    id: organizationSlug
  });
 
  if (isPending) {
    return <Skeleton className="my-1.5 h-3 w-36" />;
  }

 
  const transformedDesignations: TeamDesignationType[] = designations?.map((item) => ({
    id: item.id ?? "",
    name: item.designation.name ?? "",
    team_id: item.team.id ?? "",
    designation_id: item.designation.id ?? "",
    quantity: item.quantity ?? 0,
    role_level: item.designation.role_level ?? 0,
    vacancies: item.vacancies ?? 0,
    description: item.team.description ?? "",
    job_description: item.designation.job_description ?? "",
    organization_id: item.organization_id ?? "",
    team_name: item.team.name ?? "",
    designation_name: item.designation.name ?? "",
    number_of_staffs: item.staffs.length
   })) ?? [];

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold text-green-700">Designations</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              Create New Designation
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] border-green-100">
            <DialogHeader className="bg-green-50">
              <DialogTitle className="text-green-700">Create New Designation</DialogTitle>
              <DialogDescription className="text-green-600">
                Create a new designation for your team. Click save when you&apos;re done.
              </DialogDescription>
            </DialogHeader>
            <CreateDesignationForm onCancel={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <DesignationDataTable 
        columns={designationColumns} 
        data={transformedDesignations as unknown as TeamDesignationType[]} 
      />
    </div>
  );
}
