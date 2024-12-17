"use client";

import { trpc } from "@/app/_providers/trpc-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";
import { UserContractTable } from "./_components/data-table";
import { userContractColumns } from "./_components/columns";

export default function ContractTemplatesPage() {
  const session = useSession();

  if(!session){
    throw new Error("Staff profile not found");
  }
  const { data: contracts, isLoading } = trpc.getSingleUserById.useQuery({
    id: session.data?.user.id as string
  });

  if (isLoading) {
    <Skeleton className='my-1.5 h-3 w-36' />;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto py-8 px-4">
      <div>
                  <h2 className="text-2xl font-semibold mb-4 text-gray-800">Contracts</h2>
                  <div className="bg-white rounded-lg">
                    <UserContractTable 
                      data={contracts ?? []} 
                      columns={userContractColumns} 
                    />
                  </div>
                </div>
      </div>
    </div>
  );
}
