"use client";

import { trpc } from "@/app/_providers/trpc-provider";
import { useSession } from "next-auth/react";
import { DataTable } from "@/components/table/data-table";
import { payrollColumn } from "./_components/columns";
import OwnerPage from "./_components/owner-page";

function PayrollPage() {
  const activeUser = useSession();
  const userId = activeUser?.data?.user?.id as string;

  const { data: staffData } = trpc.getStaffByUserId.useQuery({ id: userId });

  const staffId = staffData?.id as string;

  const { data: staffPayrollData, isLoading: isStaffPayrollLoading } = trpc.getEmployeePayrollByStaffId.useQuery(
    { staff_id: staffId! },
    { enabled: !!staffId }
  );


  return (
    <>
       <OwnerPage />

        {!userId && <div className=''>
          <h3 className='mb-2 text-lg font-bold'>View Payslips</h3>

          <DataTable
            action={<div className={"flex space-x-3"}></div>}
            columns={payrollColumn ?? []}
            data={staffPayrollData ?? []}
            filterInputPlaceholder='Filter Payroll'
            filterColumnId='Name'
            isLoading={isStaffPayrollLoading}
            withToolbar={false}
          />
        </div>}
    </>
  );
}

export default PayrollPage;
