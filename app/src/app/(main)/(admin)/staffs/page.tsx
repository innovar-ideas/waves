"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { columns } from "./_components/columns";
import DataTable from "./_components/data-table";
import { trpc } from "@/app/_providers/trpc-provider";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import StaffForm from "./_components/staffForm";
import { ListCheckIcon, Upload } from "lucide-react";
import EmployeeCard from "./_components/employee-card";
import { CardStackIcon } from "@radix-ui/react-icons";
import StaffBulkUpload from "./_components/staff-bulk-upload";

export default function StaffsPage() {

  const [openStaffForm, setOpenStaffForm] = useState(false);
  const [openStaffBulkUpload, setOpenStaffBulkUpload] = useState(false);
  const { data, isPending } = trpc.getAllStaffs.useQuery();
  const [view, setView] = useState("list-view");

  return (
    <>
      <div className="flex items-center justify-between mb-6 px-4">
        <h1 className='text-lg font-semibold text-emerald-800 md:text-2xl'></h1>
        <div className="flex items-center space-x-4">
          {view === "list-view" ?
            <div onClick={() => setView("card-view")} className="flex items-center gap-2 cursor-pointer text-emerald-700 hover:text-emerald-800">
              <CardStackIcon />
              <p>Card View</p>
            </div>
            : <div onClick={() => setView("list-view")} className="flex items-center gap-2 cursor-pointer text-emerald-700 hover:text-emerald-800">
              <ListCheckIcon />
              <p>List View</p>
            </div>}

          <Button
            onClick={() => setOpenStaffBulkUpload(true)}
            className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
          >
            <Upload className="w-4 h-4 mr-2" />
            Bulk Upload
          </Button>

          <Button 
            onClick={() => setOpenStaffForm(true)} 
            className="bg-emerald-600 text-white hover:bg-emerald-700"
          >
            + Add Employee
          </Button>
        </div>
      </div>

      <StaffBulkUpload open={openStaffBulkUpload} setOpen={setOpenStaffBulkUpload} />

      {(isPending && !openStaffForm) ? (
        <Table className="bg-white">
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
        <div className='flex flex-1 items-center justify-center rounded-lg border border-dashed border-emerald-200 bg-white shadow-sm'>
          <div className='flex flex-col items-center gap-1 text-center'>
            <h3 className='text-2xl font-bold tracking-tight text-emerald-800'>No staff found</h3>
            <p className='text-sm text-emerald-600'>Staffs will show up when they are available.</p>
          </div>
        </div>
      ) : openStaffForm ? (
        <StaffForm setOpenStaffForm={setOpenStaffForm} />
      ) : (
        <>
          {view === "list-view" ?
            <div className='mb-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
              <div className="col-span-4 bg-white rounded-lg">
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
