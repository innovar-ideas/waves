"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataTable } from "./_components/data-table";
import { columns } from "./_components/columns";
import { trpc } from "@/app/_providers/trpc-provider";
import { getActiveOrganizationSlugFromLocalStorage } from "@/lib/helper-function";

export default function UsersPage() {

  const organization_slug = getActiveOrganizationSlugFromLocalStorage();
  const { data, isPending } = trpc.getUsersByOrganizationId.useQuery({ id: organization_slug });
    
  return (
    <>
      <div className='flex items-center'>
        <h1 className='text-lg font-semibold md:text-2xl'>Users</h1>
      </div>
      {isPending ? (
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
      ) : !data?.length ? (
        <div className='flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm'>
          <div className='flex flex-col items-center gap-1 text-center'>
            <h3 className='text-2xl font-bold tracking-tight'>No user found</h3>
            <p className='text-sm text-muted-foreground'>Users will show up when they are available.</p>
          </div>
        </div>
      ) : (
        <>
          <div className='mb-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
            <div className='col-span-4'>
              <DataTable data={data} columns={columns} />
            </div>
          </div>
        </>
      )}
    </>
  );
}
