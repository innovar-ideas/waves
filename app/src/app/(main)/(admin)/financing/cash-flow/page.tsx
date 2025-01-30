"use client";

import { trpc } from "@/app/_providers/trpc-provider";
import { useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PaymentMethod, TransactionType } from "@prisma/client";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import useActiveOrganizationStore from "@/app/server/store/active-organization.store";
import { PaymentReceipt } from "./_components/payment-receipt";

export default function CashFlowPage() {
  const { organizationSlug } = useActiveOrganizationStore();
  const [selectedTransactionType, setSelectedTransactionType] = useState<"ALL" | TransactionType>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"ALL" | PaymentMethod>("ALL");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const debouncedSearch = useDebounce(searchTerm, 500);

  const { data: paymentsData, isLoading } = trpc.getPayments.useQuery({
    organizationSlug,
    page: currentPage,
    pageSize,
    searchTerm: debouncedSearch,
    transactionType: selectedTransactionType,
    paymentMethod: selectedPaymentMethod,
  }, {
    // enabled: !!selectedSession || !!session?.activeSessionId,
  });

  const { data: cashFlowData } = trpc.getCashFlow.useQuery({
    organizationSlug,
  }, {
    // enabled: !!selectedSession || !!session?.activeSessionId,
  });

  // Reset page when filters change
  const resetPage = () => setCurrentPage(1);

  return (
    <div className="p-6 mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex gap-3">

          <Select value={selectedTransactionType} onValueChange={(value: "ALL" | TransactionType) => { setSelectedTransactionType(value); resetPage(); }}>
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="Transaction Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Transactions</SelectItem>
              <SelectItem value="INFLOW">Inflow</SelectItem>
              <SelectItem value="OUTFLOW">Outflow</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-3 items-center">
        <Input
          placeholder="Search payments..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); resetPage(); }}
          className="max-w-xs"
        />
        
        <Select value={selectedPaymentMethod} onValueChange={(value: "ALL" | PaymentMethod) => { setSelectedPaymentMethod(value); resetPage(); }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Payment Method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Methods</SelectItem>
            <SelectItem value="CASH">Cash</SelectItem>
            <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
            <SelectItem value="CARD">Card</SelectItem>
            <SelectItem value="CHEQUE">Cheque</SelectItem>
          </SelectContent>
        </Select>

        <Select value={pageSize.toString()} onValueChange={(value) => { setPageSize(Number(value)); resetPage(); }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Page Size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10 per page</SelectItem>
            <SelectItem value="25">25 per page</SelectItem>
            <SelectItem value="50">50 per page</SelectItem>
            <SelectItem value="100">100 per page</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Inflow</h3>
          <p className="text-2xl font-bold text-green-600">
            ₦{paymentsData?.summary.totalInflow.toLocaleString()}
          </p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Outflow</h3>
          <p className="text-2xl font-bold text-red-600">
            ₦{paymentsData?.summary.totalOutflow.toLocaleString()}
          </p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Net Cash Flow</h3>
          <p className="text-2xl font-bold">
            ₦{paymentsData?.summary.netCashFlow.toLocaleString()}
          </p>
        </Card>
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Cash Flow Trend</h2>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={cashFlowData?.chartData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E7EFFF" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#E7EFFF" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                dy={10}
              />
              <YAxis 
                tickFormatter={(value) => `₦${(value / 1000000).toFixed(1)}M`}
                axisLine={false}
                tickLine={false}
                dx={-10}
              />
              <Tooltip 
                formatter={(value: number) => `₦${value.toLocaleString()}`}
                labelStyle={{ color: "#111827" }}
                contentStyle={{ 
                  backgroundColor: "white",
                  border: "none",
                  borderRadius: "8px",
                  boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)"
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#2E90FA"
                strokeWidth={2}
                fill="url(#colorValue)"
                dot={{ stroke: "#2E90FA", strokeWidth: 2, r: 4, fill: "white" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Updated Payments Table */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Payment Transactions</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  Loading...
                </TableCell>
              </TableRow>
            ) : paymentsData?.payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  No payments found
                </TableCell>
              </TableRow>
            ) : (
              paymentsData?.payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
                  <TableCell>{payment.description || "-"}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      payment.transaction_type === "INFLOW" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    }`}>
                      {payment.transaction_type}
                    </span>
                  </TableCell>
                  <TableCell>{payment.payment_method}</TableCell>
                  <TableCell>{payment.reference || "-"}</TableCell>
                  <TableCell className="text-right">₦{payment.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      payment.reconciled 
                        ? "bg-green-100 text-green-800" 
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {payment.reconciled ? "Reconciled" : "Pending"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <PaymentReceipt payment={payment} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {paymentsData && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, paymentsData.pagination.total)} of {paymentsData.pagination.total} entries
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                </PaginationItem>
                <PaginationItem>
                  <span className="px-4">
                    Page {currentPage} of {paymentsData.pagination.pageCount}
                  </span>
                </PaginationItem>
                <PaginationItem>
                  <Button 
                    variant="outline"
                    onClick={() => setCurrentPage(p => Math.min(paymentsData.pagination.pageCount, p + 1))}
                    disabled={currentPage === paymentsData.pagination.pageCount}
                  >
                    Next
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
}
