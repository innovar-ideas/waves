"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { ReactElement } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const fundWalletSchema = z.object({
  amount: z.number({ coerce: true }).min(2000),
});
export default function FundWalletModal({ trigger }: { trigger: ReactElement }) {
  async function handleSubmit(input: z.infer<typeof fundWalletSchema>) {
    console.log({ input });
  }

  const form = useForm({
    defaultValues: { amount: 0 },
    resolver: zodResolver(fundWalletSchema),
  });
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className='max-w-xs rounded-lg lg:max-w-md'>
        <DialogHeader>
          <DialogTitle className='text-left'>Add Funds</DialogTitle>
          <DialogClose />
        </DialogHeader>
        <DialogDescription>
          <div className='text-balance md:w-4/5'>
            <div>Add funds to your wallet.</div>
          </div>
        </DialogDescription>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit, (error) => console.error(error))}>
            <fieldset disabled={form.formState.isSubmitting}>
              <FormField
                name='amount'
                control={form.control}
                render={({ field }) => (
                  <div className='mt-2'>
                    <FormItem className='flex items-start gap-3 space-y-0'>
                      <div className='grid gap-1'>
                        <Input {...field} type='number' step={500} />
                        <FormMessage />
                      </div>
                      <Button className='mt-0' type='submit'>
                        Top Up
                      </Button>
                    </FormItem>
                  </div>
                )}
              />
            </fieldset>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
