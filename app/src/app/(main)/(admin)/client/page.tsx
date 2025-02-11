"use client";
import { trpc } from "@/app/_providers/trpc-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { getActiveOrganizationSlugFromLocalStorage } from "@/lib/helper-function";
import { ClientDataTable } from "./_components/client-data-table";
import { clientColumns } from "./_components/client-columns";
import { CreateClientForm } from "./_components/create-client-form";

export default function ClientPage() {
   const organization_slug = getActiveOrganizationSlugFromLocalStorage();
  
  const {data, isPending} = trpc.getAllClientsByOrganizations.useQuery({id: organization_slug});
  const {data: organization} = trpc.getOrganizationById.useQuery({id: organization_slug});

  if(isPending){
    <Skeleton className='my-1.5 h-3 w-36' />;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold text-green-700">Clients</h1>
            {organization?.sync_from_external_app ? null : <CreateClientForm />}
      </div>
      <ClientDataTable columns={clientColumns} data={data ?? []} />
    </div>
  );
}
