"use client";

import useActiveOrganizationStore from "@/app/server/store/active-organization.store";
import { trpc } from "@/app/_providers/trpc-provider";
import { DataTable } from "@/components/table/data-table";
import { GroupedPayrollResponse } from "@/app/server/types";
// import { viewStaffPayrollColumns } from "./_component/viewUserPayrollColumn";
import { useSession } from "next-auth/react";
import { viewStaffPayrollColumns } from "./[id]/_component/viewUserPayrollColumn";

export default function PayslipPage() {
  const { organizationSlug } = useActiveOrganizationStore();
  const session = useSession();

  if (!session) {
    console.log("No active user sessions");
    return;
  };

  const { data: payrollGrouped, isLoading: isPayrollGroupedLoading } = trpc.getPayrollsGroupedByMonthForStaff.useQuery({
    organization_slug: organizationSlug,
    staffProfile_id: session.data?.user.id as string,

  });

  if (!payrollGrouped) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4 md:p-8 print:p-0">
      <div>
        <DataTable
          data={(payrollGrouped as unknown as GroupedPayrollResponse[]) ?? []}
          columns={viewStaffPayrollColumns}
          isLoading={isPayrollGroupedLoading}
        />
      </div>
    </div>
  );
}

