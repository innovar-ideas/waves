"use client";

import { trpc } from "@/app/_providers/trpc-provider";
import StaffPayrollList from "./_components/staff-payroll-list";
import { getActiveOrganizationSlugFromLocalStorage } from "@/lib/helper-function";
import { ArrowBigLeft } from "lucide-react";
import Link from "next/link";

export default function PayrollPage() {
    const slug = getActiveOrganizationSlugFromLocalStorage();
  
  const { data: staffList, isLoading, refetch } = trpc.getStaffWithPayrollTemplate.useQuery({
    slug: slug
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <Link href={"/payroll"} className="flex items-center my-4">
        <ArrowBigLeft />
        <p>Back</p>
      </Link>
      <h1 className="text-2xl font-bold mb-6">Staff Payroll</h1>
      <StaffPayrollList staffList={staffList || []} refetch={refetch} />
    </div>
  );
}

