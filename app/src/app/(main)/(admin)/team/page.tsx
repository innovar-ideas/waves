"use client";
import { teamColumns } from "./_components/team-columns";
import { TeamDataTable } from "./_components/team-data-table";
import { CreateTeamForm } from "./_components/create-team-form";
import { trpc } from "@/app/_providers/trpc-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { getActiveOrganizationSlugFromLocalStorage } from "@/lib/helper-function";

export default function TeamsPage() {
   const organization_slug = getActiveOrganizationSlugFromLocalStorage();
  
  const {data, isPending} = trpc.getAllParentTeamByOrganizations.useQuery({id: organization_slug});

  if(isPending){
    <Skeleton className='my-1.5 h-3 w-36' />;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold text-green-700">Teams</h1>
            <CreateTeamForm  />
      </div>
      <TeamDataTable columns={teamColumns} data={data ?? []} />
    </div>
  );
}
