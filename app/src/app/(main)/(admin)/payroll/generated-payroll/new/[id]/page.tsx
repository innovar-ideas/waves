"use client";

import { trpc } from "@/app/_providers/trpc-provider";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import useActiveOrganizationStore from "@/app/server/store/active-organization.store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ViewApprovedPayrolls from "./_components/ApprovedPayroll";

export default function ViewPayrolls({ params: { id } }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const month = searchParams.get("month") as string;
  const { organizationSlug } = useActiveOrganizationStore();
 

  const { data: approvedPayrolls, refetch } = trpc.getApprovedPayrollsByTemplateAndMonth.useQuery({
    templateId: id,
    month,
    organization_id: organizationSlug,
  });

  const { data: unapprovedPayrolls, refetch: refetchUnapproved } = trpc.getUnapprovedPayrollsByTemplateAndMonth.useQuery({
    templateId: id,
    month,
    organization_id: organizationSlug,
  });

  console.log(approvedPayrolls, "see all payrolls for month");

  return (
    <>
      <div className="flex justify-end">
        <Link href="/payroll">
          <Button className="w-fit bg-blue-500 text-center hover:bg-blue-600">
            View Generated Payroll
          </Button>
        </Link>
      </div>
      <Tabs defaultValue="approved">
          <TabsList className="w-full flex justify-start items-start mb-6">
            <TabsTrigger value="approved"> <div> Approved Payrolls</div></TabsTrigger>
            <TabsTrigger value="unapproved"><div>Unapproved Payrolls</div> </TabsTrigger>

          </TabsList>

          <TabsContent value="approved">
      <ViewApprovedPayrolls payrolls={approvedPayrolls!} refetch={refetch} />
        </TabsContent>
        <TabsContent value="unapproved">
        <ViewApprovedPayrolls payrolls={unapprovedPayrolls!} refetch={refetchUnapproved} />
          </TabsContent> 
          </Tabs>
      
    </>
  );
}
