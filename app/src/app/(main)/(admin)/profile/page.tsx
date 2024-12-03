"use client";

import { trpc } from "@/app/_providers/trpc-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";
import EditStaffForm from "../staffs/_components/editStaffForm";
import EmployeeDetails from "../staffs/_components/employee-details";
import { useState } from "react";

export default function UsersPage() {

  const session = useSession();
  const [openEdit, setOpenEdit] = useState(false);
  const { data: staffs, isLoading } = trpc.getStaffById.useQuery({ id: session.data?.user.id as string });

  if (isLoading) {
    return <Skeleton className='h-32' />;
  }


  return (
    <>
      {!openEdit ? <button onClick={() => setOpenEdit(true)} className="p-3 border rounded-2xl">Edit</button>
        :
        <button onClick={() => setOpenEdit(false)} className="p-3 border rounded-2xl">Close</button>}
      {!openEdit ? <EmployeeDetails staffProfile={staffs!} key={staffs?.id} />
        :
        <EditStaffForm staffProfile={staffs!} />}
    </>
  );
}
