"use client";

import { getUserTransactions } from "@/actions/transactions";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "./_components/data-table";
import { columns } from "./_components/columns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export default function TransactionsPage() {
  const { data, isPending } = useQuery({
    queryKey: ["user-transactions"],
    queryFn: () => getUserTransactions(),
  });

  if (!isPending && !data?.length)
    return (
      <div className='flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm'>
        <div className='flex flex-col items-center gap-1 text-center'>
          <h3 className='text-2xl font-bold tracking-tight'>No transaction found</h3>
          <p className='text-sm text-muted-foreground'>Transactions will show up here.</p>
        </div>
      </div>
    );

  return (
    <>
      <div className='flex items-center'>
        <h1 className='text-lg font-semibold md:text-2xl'>Transactions</h1>
      </div>
      <div className='mb-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card className='col-span-2'>
          <CardContent title='Transaction History' className='pt-6'>
            {isPending ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Skeleton className='my-2.5 h-4 w-10' />
                    </TableHead>
                    <TableHead>
                      <Skeleton className='my-2.5 h-4 w-20 md:w-36' />
                    </TableHead>
                    <TableHead>
                      <Skeleton className='my-2.5 ml-auto h-4 w-16' />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {new Array(5).fill(0).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton className='my-2.5 h-4 w-14 md:w-24' />
                      </TableCell>
                      <TableCell>
                        <Skeleton className='my-3 h-4 w-32 md:w-56' />
                      </TableCell>
                      <TableCell>
                        <Skeleton className='my-2.5 ml-auto h-4 w-12' />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : data.length ? (
              <DataTable columns={columns} data={data} />
            ) : (
              ""
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
