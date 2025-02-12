"use client";

import { useEffect, useState } from "react";
import DepositForm from "./_components/deposit-form";
import { trpc } from "@/app/_providers/trpc-provider";
import { getActiveOrganizationSlugFromLocalStorage } from "@/lib/helper-function";
import { Accounts, Client, Invoice, Payment } from "@prisma/client";
import { Skeleton } from "@/components/ui/skeleton";
import { CashToBankFormSchema } from "@/app/server/dtos";
import { useToast } from "@/components/ui/use-toast";

export default function Page() {
  const [entries, setEntries] = useState<(Payment & {client: Client | null, account: Accounts | null, invoice: Invoice | null})[]>([]);
    const orgId = getActiveOrganizationSlugFromLocalStorage() || "";
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const {data, isLoading} = trpc.getAllPaymentsInvoice.useQuery(
      {id: orgId},
    );

    const createPayment = trpc.createPaymentForCashAndCheque.useMutation({
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Payment updated successfully",
        });
        setLoading(false);
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        setLoading(false);
      },
    });

    useEffect(() => {
      if (data) {
        setEntries(data);
      }
    }, [data]);

  const handleEntriesChange = (newEntries: (Payment & {client: Client | null, account: Accounts | null, invoice: Invoice | null})[]) => {
    setEntries(newEntries);
  };

  const handleSubmit = (formData: CashToBankFormSchema) => {
    console.log("Form submitted:", formData);
    // Handle form submission here
    createPayment.mutate({
      ...formData,
    });
  };

if(isLoading){
  <Skeleton className='my-1.5 h-3 w-36' />;
}

  return (
    <div className="bg-gray-50 p-4 h-full">
      <h2 className="text-2xl font-semibold">Deposit To Bank</h2>
      <div className="mx-auto bg-white rounded-lg shadow-sm">
        {entries.length > 0 ? <DepositForm initialEntries={entries} onEntriesChange={handleEntriesChange} onSubmit={handleSubmit} loading={loading} setLoading={setLoading} /> : 
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-600">No payments found for this organization.</h3>
        </div>
        
        }
      </div>
    </div>
  );
}

