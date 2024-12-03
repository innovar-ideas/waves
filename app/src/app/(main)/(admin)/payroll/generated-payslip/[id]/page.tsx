"use client";

import { trpc } from "@/app/_providers/trpc-provider";
import { useSearchParams } from "next/navigation";
import useActiveOrganizationStore from "@/app/server/store/active-organization.store";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import ViewStaffPayslip from "../_components/view-user-payslip";

export default function ViewUserPayslip({ params: { id } }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const month = searchParams.get("month") as string;
  const { organizationSlug } = useActiveOrganizationStore();
  const session = useSession();


  const { data: approvedPayrolls, isLoading } = trpc.getUserPayrollByTemplateAndMonth.useQuery({
    templateId: id,
    month,
    organization_id: organizationSlug,
    user_id: session.data?.user.id as string
  });

  useEffect(() => {
    console.log(approvedPayrolls, "see all payrolls for month");

  }, [approvedPayrolls, isLoading]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  console.log("see request body", month, organizationSlug, id);

  return (
    <>
      <ViewStaffPayslip payroll={approvedPayrolls!} />
    </>
  );
}
