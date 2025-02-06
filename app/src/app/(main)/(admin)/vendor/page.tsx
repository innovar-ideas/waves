"use client";
import { trpc } from "@/app/_providers/trpc-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { getActiveOrganizationSlugFromLocalStorage } from "@/lib/helper-function";
import { VendorDataTable } from "./_components/vendor-data-table";
import { CreateVendorForm } from "./_components/create-vendor-form";
import { vendorColumns } from "./_components/vendor-columns";

export default function TeamsPage() {
   const organization_slug = getActiveOrganizationSlugFromLocalStorage();
  
  const {data, isPending} = trpc.getAllVendorsByOrganizations.useQuery({id: organization_slug});

  if(isPending){
    <Skeleton className='my-1.5 h-3 w-36' />;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold text-green-700">Vendor</h1>
            <CreateVendorForm />
      </div>
      <VendorDataTable columns={vendorColumns} data={data ?? []} />
    </div>
  );
}
