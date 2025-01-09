"use client";

import { trpc } from "@/app/_providers/trpc-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams } from "next/navigation";
import { TeamDataTable } from "../../_components/team-data-table";
import { teamMemberColumns } from "./columns";


const ViewTeamMembers = () => {
    const params = useParams();
    const id = params?.id as string;
  const { data: members, isLoading } = trpc.getAllTeamMember.useQuery({ id });
  console.log(members,"🙄🙄🙄🙄🙄");
  if(isLoading){
    <Skeleton className='my-1.5 h-3 w-36' />;
  }

    return (
        <div>
          <h1 className="text-2xl font-bold mb-5">Team Members</h1>
          <TeamDataTable columns={teamMemberColumns} data={members ?? []} />
        </div>
    );
};

export default ViewTeamMembers;