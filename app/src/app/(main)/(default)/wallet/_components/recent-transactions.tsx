"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { LuArrowRight } from "react-icons/lu";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { getUserTransactions } from "@/actions/transactions";
import clsx from "clsx";
import { Skeleton } from "@/components/ui/skeleton";

export function RecentTransactions({ className }: { className?: string }) {
  const { data: transactions, isPending } = useQuery({
    queryKey: ["user-transactions"],
    queryFn: () => getUserTransactions(),
  });
  return (
    <Card className={clsx("mx-auto w-full max-w-4xl", className)}>
      <CardContent className='grid gap-6 pt-6'>
        <div>
          <h3 className='mb-4 text-lg font-semibold'>Recent Transactions</h3>
          <div className='space-y-4'>
            {isPending ? (
              new Array(3).fill(0).map((_, index) => (
                <div key={index} className='flex w-full justify-between'>
                  <div className='w-1/2'>
                    <Skeleton className='h-4 w-full' />
                    <Skeleton className='mt-2 h-4 w-1/2' />
                  </div>
                  <Skeleton className='h-6 w-1/5' />
                </div>
              ))
            ) : transactions?.length ? (
              transactions?.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className='flex justify-between'>
                  <div className='flex items-center space-x-4'>
                    <div>
                      <p className='mb-1 text-sm font-medium leading-none'>{transaction.description}</p>
                      <p className='text-xs text-muted-foreground'>{formatDate(transaction.created_at)}</p>
                    </div>
                  </div>
                  <div
                    className={`text-sm font-medium ${transaction.type === "credit" ? "text-green-600" : "text-red-600"}`}
                  >
                    {transaction.type === "credit" ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </div>
                </div>
              ))
            ) : (
              <div className='flex flex-1 items-center justify-center rounded-lg border border-dashed'>
                <div className='flex h-32 flex-col items-center justify-center gap-1 text-center'>
                  <p className='text-sm text-muted-foreground'>No transactions found.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter
        className={clsx((isPending || !transactions?.length || (transactions && transactions.length < 5)) && "hidden")}
      >
        <Button className='gap-2 px-0' variant={"link"}>
          All Transactions &nbsp; <LuArrowRight />
        </Button>
      </CardFooter>
    </Card>
  );
}
