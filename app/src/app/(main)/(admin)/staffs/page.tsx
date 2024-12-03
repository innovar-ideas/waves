"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { columns } from "./_components/columns";
import DataTable from "./_components/data-table";
import { trpc } from "@/app/_providers/trpc-provider";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import StaffForm from "./_components/staffForm";
import { ListCheckIcon } from "lucide-react";
import EmployeeCard from "./_components/employee-card";
import { CardStackIcon } from "@radix-ui/react-icons";

export default function StaffsPage() {

  const [openStaffForm, setOpenStaffForm] = useState(false);
  const { data, isPending } = trpc.getAllStaffs.useQuery();
  const [view, setView] = useState("list-view");

  return (
    <>
      <div className="flex items-center justify-between mb-6 px-4">
        {/* <h1 className="text-2xl font-semibold text-gray-900">Employees</h1> */}
        <h1 className='text-lg font-semibold md:text-2xl'>Staffs</h1>
        <div className="flex items-center space-x-4">
          {view === "list-view" ?
            <div onClick={() => setView("card-view")} className="flex items-center gap-2 cursor-pointer">
              <CardStackIcon />
              <p>Card View</p>
            </div>
            : <div onClick={() => setView("list-view")} className="flex items-center gap-2 cursor-pointer">
              <ListCheckIcon />
              <p>List View</p>
            </div>}

          {/* <Button variant="outline" className="flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Import
          </Button> */}
          <Button onClick={() => setOpenStaffForm(true)} className="bg-blue-600 text-white hover:bg-blue-700">+ Add Employee</Button>
        </div>
      </div>
      {(isPending && !openStaffForm) ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Skeleton className='my-1.5 h-3 w-14' />
              </TableHead>
              <TableHead>
                <Skeleton className='my-1.5 h-3 w-36' />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {new Array(5).fill(0).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className='my-1.5 h-3 w-32' />
                </TableCell>
                <TableCell>
                  <Skeleton className='my-1.5 h-3 w-28' />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (!data?.length && !openStaffForm) ? (
        <div className='flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm'>
          <div className='flex flex-col items-center gap-1 text-center'>
            <h3 className='text-2xl font-bold tracking-tight'>No staff found</h3>
            {/* <StaffForm /> */}

            <p className='text-sm text-muted-foreground'>Staffs will show up when they are available.</p>
          </div>
        </div>
      ) : openStaffForm ? (
        <StaffForm setOpenStaffForm={setOpenStaffForm} />
      ) : (
        <>
          {view === "list-view" ?
            <div className='mb-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
              <div className="col-span-4">
                <DataTable data={data ?? []} columns={columns} />

              </div>
            </div> :
            <div className='mb-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
              {
                data?.map((data) => (
                  <EmployeeCard staffProfile={data} key={data.id} />
                ))
              }
            </div>}
        </>
      )}
    </>
  );
}
