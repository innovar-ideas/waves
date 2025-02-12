"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getActiveOrganizationSlugFromLocalStorage } from "@/lib/helper-function";
import { trpc } from "@/app/_providers/trpc-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { PaymentTableType } from "@/app/server/types";

interface PaymentTableProps {
  payments: PaymentTableType[];
  isLoading: boolean;
}

type BillTableType = {
  id: string;
  bill_number: string;
  vendor_name: string;
  due_date: Date;
  amount: number;
  balance_due: number;
  status: string;
  organization: {
    name: string;
  };
  supplier: {
    name: string;
  };
};

interface BillTableProps {
  bills: BillTableType[];
  isLoading: boolean;
}


export default function PaymentPage() {
  const orgId = getActiveOrganizationSlugFromLocalStorage();
  const { data: payments = [], isLoading } = trpc.getAllPaymentsByOrganization.useQuery({ id: orgId });
  const billPayments: PaymentTableType[] = payments.filter(payment => payment.payments.bill !== null && payment.payments.invoice === null);
  const invoicePayments: PaymentTableType[] = payments.filter(payment => payment.payments.bill === null);
  const { data: allBillByOrg = [], isLoading: billsLoading } = trpc.getAllBillByOrganization.useQuery({ id: orgId });

  const formattedBills: BillTableType[] = allBillByOrg.map(bill => ({
    id: bill.id,
    bill_number: bill.bill_number || "",
    vendor_name: bill.supplier?.name || "",
    due_date: bill.due_date,
    amount: bill.amount || 0,
    balance_due: bill.balance_due || 0,
    status: bill.status,
    organization: {
      name: bill.organization.name
    },
    supplier: {
      name: bill.supplier?.name || "",
    },
  }));

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 bg-green-50">
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-green-800">Payments</h1>
      </div>

      <Tabs defaultValue="invoice">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-4 sm:mb-6">
          <TabsList className="grid w-full sm:w-[500px] grid-cols-3 bg-white rounded-lg shadow-sm border border-green-100 p-1.5 gap-3">
            <TabsTrigger 
              value="invoice" 
              className="text-sm sm:text-base font-medium transition-colors
                data-[state=active]:bg-green-600 
                data-[state=active]:text-white
                data-[state=active]:shadow-sm
                hover:bg-green-50
                px-4 py-2.5 rounded-md"
            >
              Invoice Payments
            </TabsTrigger>
            <TabsTrigger 
              value="bill"
              className="text-sm sm:text-base font-medium transition-colors
                data-[state=active]:bg-green-600
                data-[state=active]:text-white
                data-[state=active]:shadow-sm
                hover:bg-green-50
                px-4 py-2.5 rounded-md"
            >
              Bill Payments
            </TabsTrigger>
            <TabsTrigger 
              value="purchaseOrder"
              className="text-sm sm:text-base font-medium transition-colors
                data-[state=active]:bg-green-600
                data-[state=active]:text-white
                data-[state=active]:shadow-sm
                hover:bg-green-50
                px-4 py-2.5 rounded-md"
            >
              Purchase Orders
            </TabsTrigger>
            <TabsTrigger 
              value="deposit"
              className="text-sm sm:text-base font-medium transition-colors
                data-[state=active]:bg-green-600
                data-[state=active]:text-white
                data-[state=active]:shadow-sm
                hover:bg-green-50
                px-4 py-2.5 rounded-md"
            >
              Bank Deposit
            </TabsTrigger>
          </TabsList>
          
          <div className="w-full sm:w-auto">
            <TabsContent value="invoice" className="m-0">
              <Link href="/payment/invoice-payment" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Make Invoice Payment
                </Button>
              </Link>
            </TabsContent>

            <TabsContent value="bill" className="m-0">
              <Link href="/payment/bill-payment" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Make Bill Payment
                </Button>
              </Link>
            </TabsContent>

            <TabsContent value="purchaseOrder" className="m-0">
              <Link href="/payment/purchase-order-bill" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Bill for Purchase Order
                </Button>
              </Link>
            </TabsContent>

            <TabsContent value="deposit" className="m-0">
              <Link href="/payment/deposit" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Bank Deposit
                </Button>
              </Link>
            </TabsContent>
          </div>
        </div>

        <TabsContent value="invoice" className="mt-4 sm:mt-6">
          <PaymentTable payments={invoicePayments} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="bill" className="mt-4 sm:mt-6">
          <PaymentTable payments={billPayments} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="purchaseOrder" className="mt-4 sm:mt-6">
          <BillTable bills={formattedBills} isLoading={billsLoading} />
        </TabsContent>
        
      </Tabs>
    </div>
  );
}

function PaymentTable({ payments, isLoading }: PaymentTableProps) {
  return (
    <div className="rounded-xl border border-green-200 overflow-x-auto shadow-md bg-white">
      <Table>
        <TableHeader className="bg-green-100">
          <TableRow>
            <TableHead className="text-green-800 font-semibold py-4 whitespace-nowrap">Date</TableHead>
            <TableHead className="text-green-800 font-semibold whitespace-nowrap">
              {payments?.[0]?.payments?.invoice ? "Client" : "Vendor"}
            </TableHead>
            <TableHead className="text-green-800 font-semibold whitespace-nowrap">Payment Method</TableHead>
            <TableHead className="text-green-800 font-semibold text-right whitespace-nowrap">Amount</TableHead>
            <TableHead className="text-green-800 font-semibold whitespace-nowrap">Currency</TableHead>
            <TableHead className="text-green-800 font-semibold whitespace-nowrap">Account</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                <TableCell><Skeleton className="h-6 w-28" /></TableCell>
                <TableCell><Skeleton className="h-6 w-20 ml-auto" /></TableCell>
                <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                <TableCell><Skeleton className="h-6 w-40" /></TableCell>
              </TableRow>
            ))
          ) : !payments?.length ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-green-700 py-8 sm:py-12">
                <p className="font-medium">No payments found</p>
                <p className="text-sm text-green-600 mt-1">Create a new payment to get started</p>
              </TableCell>
            </TableRow>
          ) : (
            payments.map((payment) => (
              <TableRow key={payment.payments.id} className="hover:bg-green-50 transition-colors duration-150">
                <TableCell className="text-green-700 font-medium whitespace-nowrap">
                  {format(new Date(payment.payments.payment_date), "dd/MM/yyyy")}
                </TableCell>
                <TableCell className="text-green-700 whitespace-nowrap">
                  {payment.payments.invoice && payment.payments.client
                    ? `${payment.payments.client.first_name} ${payment.payments.client.last_name}`
                    : payment.payments.bill && payment.payments.vendor
                      ? payment.payments.vendor.name
                      : "-"
                  }
                </TableCell>
                <TableCell className="text-green-700 whitespace-nowrap">
                  {payment.payments.payment_method || "-"}
                </TableCell>
                <TableCell className="text-green-700 text-right font-medium whitespace-nowrap">
                  {payment.payments.amount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </TableCell>
                <TableCell className="text-green-700 whitespace-nowrap">
                  {payment.payments.currency || "-"}
                </TableCell>
                <TableCell className="text-green-700 whitespace-nowrap">
                  {payment.payments.account 
                    ? `${payment.payments.account.bank_name} - ${payment.payments.account.account_number}`
                    : "-"
                  }
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function BillTable({ bills, isLoading }: BillTableProps) {
  
  return (
    <div className="rounded-xl border border-green-200 overflow-x-auto shadow-md bg-white">
      <Table>
        <TableHeader className="bg-green-100">
          <TableRow>
            <TableHead className="text-green-800 font-semibold py-4 whitespace-nowrap">Bill Number</TableHead>
            <TableHead className="text-green-800 font-semibold whitespace-nowrap">Vendor</TableHead>
            <TableHead className="text-green-800 font-semibold whitespace-nowrap">Due Date</TableHead>
            <TableHead className="text-green-800 font-semibold text-right whitespace-nowrap">Amount</TableHead>
            <TableHead className="text-green-800 font-semibold text-right whitespace-nowrap">Balance Due</TableHead>
            <TableHead className="text-green-800 font-semibold whitespace-nowrap">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                <TableCell><Skeleton className="h-6 w-28" /></TableCell>
                <TableCell><Skeleton className="h-6 w-20 ml-auto" /></TableCell>
                <TableCell><Skeleton className="h-6 w-20 ml-auto" /></TableCell>
                <TableCell><Skeleton className="h-6 w-24" /></TableCell>
              </TableRow>
            ))
          ) : !bills?.length ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-green-700 py-8 sm:py-12">
                <p className="font-medium">No bills found</p>
                <p className="text-sm text-green-600 mt-1">Create a new bill to get started</p>
              </TableCell>
            </TableRow>
          ) : (
            bills.map((bill) => (
              <TableRow key={bill.id} className="hover:bg-green-50 transition-colors duration-150">
                <TableCell className="text-green-700 font-medium whitespace-nowrap">
                  {bill.bill_number}
                </TableCell>
                <TableCell className="text-green-700 whitespace-nowrap">
                  { bill.vendor_name || "-"}
                </TableCell>
                <TableCell className="text-green-700 whitespace-nowrap">
                  {format(new Date(bill.due_date), "dd/MM/yyyy")}
                </TableCell>
                <TableCell className="text-green-700 text-right font-medium whitespace-nowrap">
                  {bill.amount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </TableCell>
                <TableCell className="text-green-700 text-right font-medium whitespace-nowrap">
                  {bill.balance_due.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </TableCell>
                <TableCell className="text-green-700 whitespace-nowrap">
                  {bill.status}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}