"use client";

import { Button } from "@/components/ui/button";
import { LuPlusCircle } from "react-icons/lu";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import clsx from "clsx";
import FundWalletModal from "./add-funds-modal";
import { useQuery } from "@tanstack/react-query";
import { getPrimaryWallet } from "@/actions/users";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function WalletCard({ className }: { className?: string }) {
  const { data: wallet, isPending } = useQuery({
    queryKey: ["user-wallet"],
    queryFn: () => getPrimaryWallet(),
  });

  return (
    <Card className={clsx("mx-auto w-full max-w-4xl", className)}>
      <CardContent className='grid gap-6 pt-6'>
        {isPending ? (
          <div className='w-full'>
            <div className='w-full'>
              <Skeleton className='h-4 w-full rounded' />
              <Skeleton className='mt-2 h-8 w-1/2 rounded' />
            </div>
          </div>
        ) : (
          <div className='flex items-center justify-between space-x-4'>
            <div>
              <p className='mb-2 text-sm font-medium leading-none'>Current Balance</p>
              <p className='text-3xl font-bold'>{formatCurrency(wallet?.balance)}</p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className='flex justify-between gap-3'>
        <FundWalletModal
          trigger={
            <Button disabled={isPending}>
              <LuPlusCircle className='mr-2 h-4 w-4' /> Add funds
            </Button>
          }
        />
      </CardFooter>
    </Card>
  );
}
