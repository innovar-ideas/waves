"use client";

import { useState } from "react";
import { format } from "date-fns";
import { DollarSign, ArrowLeft, CreditCard, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import dynamic from "next/dynamic";
import { trpc } from "@/app/_providers/trpc-provider";
import { getActiveOrganizationSlugFromLocalStorage } from "@/lib/helper-function";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";


const BillPaymentPage = () => {
  const router = useRouter();
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [selectedDueDate, setSelectedDueDate] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [amountError, setAmountError] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");

  const currencies = [
    { code: "USD", symbol: "$" },
    { code: "EUR", symbol: "€" },
    { code: "NGN", symbol: "₦" },
  ];

  const paymentMethods = [
    { value: "BANK_TRANSFER", label: "Bank Transfer" },
    { value: "CASH", label: "Cash" },
    { value: "CHECK", label: "Check" },
  ];

  const organization = getActiveOrganizationSlugFromLocalStorage();
  const { data: allBillByOrg, isLoading: billsLoading } = trpc.getAllBillOrgTable.useQuery({ id: organization });
  const { data: vendors, isLoading: isLoadingVendors } = trpc.getAllVendorsByOrganizations.useQuery({
    id: organization
  });
  const { data: accounts } = trpc.getAllAccountOfTypeBank.useQuery({
    organizationSlug: organization
  });

  const uniqueDueDates = Array.from(new Set(
    allBillByOrg?.map(bill => 
      bill.bill?.due_date ? format(new Date(bill.bill.due_date), "yyyy-MM-dd") : null
    ).filter(Boolean) as string[]
  )).sort();
  const { mutate: createBillPayment } = trpc.createBillPayment.useMutation({
    onSuccess: () => {
      toast.success("Bill payment created successfully");
      router.push("/payment");
    },
    onError: (error) => {
      toast.error(typeof error.message === "string" ? error.message : "An error occurred");
    }
  });
  const filteredBills = allBillByOrg?.filter(bill => {
    if (selectedVendorId && selectedDueDate) {
      return bill?.vendor?.id === selectedVendorId && 
             bill.bill?.due_date && 
             format(new Date(bill.bill.due_date), "yyyy-MM-dd") === selectedDueDate &&
             bill.bill?.status !== "PAID";
    } else if (selectedVendorId) {
      return bill?.vendor?.id === selectedVendorId;
    } else if (selectedDueDate) {
      return bill.bill?.due_date && 
             format(new Date(bill.bill.due_date), "yyyy-MM-dd") === selectedDueDate;
    }
    return true;
  });

  const totalAmount = filteredBills?.reduce((sum, bill) => sum + (bill.bill?.amount || 0), 0) || 0;

  const handlePaymentAmountChange = (value: string) => {
    setPaymentAmount(value);
    const numValue = parseFloat(value);
    if (numValue < totalAmount) {
      setAmountError(`Payment amount must be at least ${selectedCurrency} ${totalAmount.toLocaleString()}`);
    } else {
      setAmountError("");
    }
  };

  const handleSubmit = () => {
    if (!selectedVendorId) {
      alert("Please select a vendor first");
      return;
    }

    if (parseFloat(paymentAmount) < totalAmount) {
      alert("Payment amount must be equal to or greater than the total bill amount");
      return;
    }

    if (!paymentMethod) {
      alert("Please select a payment method");
      return;
    }

    if (paymentMethod === "BANK_TRANSFER" && !selectedAccountId) {
      alert("Please select a bank account for transfer");
      return;
    }

    const paymentData = {
      amount: parseFloat(paymentAmount),
      currency: selectedCurrency,
      bills: filteredBills?.map(bill => bill.bill?.id).filter((id): id is string => !!id) || [],
      payment_method: paymentMethod,
      account_id: paymentMethod === "BANK_TRANSFER" ? selectedAccountId : undefined,
      organization_slug: organization,
      vendor_id: selectedVendorId,
      reference: "Bill Payment"
    };

    createBillPayment(paymentData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto py-8 px-4">
        <Button
          onClick={() => router.push("/payment")}
          variant="ghost"
          className="mb-6 text-green-600 hover:text-green-700 hover:bg-green-50"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Payments
        </Button>
        
        <div className="grid gap-6 md:grid-cols-3">
          {/* Left Column - Payment Details */}
          <div className="md:col-span-1">
            <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="border-b border-green-100">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-green-600 rounded-full">
                    <CreditCard className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-green-800">Payment Details</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-green-700">Total Amount Due</Label>
                  <div className="text-2xl font-bold text-green-800">
                    {selectedCurrency} {totalAmount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>

                <Separator className="bg-green-100" />

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select 
                      value={selectedCurrency}
                      onValueChange={setSelectedCurrency}
                    >
                      <SelectTrigger className="bg-white border-green-200">
                        <SelectValue placeholder="Select Currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            {currency.symbol} {currency.code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <Select
                      value={paymentMethod}
                      onValueChange={setPaymentMethod}
                    >
                      <SelectTrigger className="bg-white border-green-200">
                        <SelectValue placeholder="Select Payment Method" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethods.map((method) => (
                          <SelectItem key={method.value} value={method.value}>
                            {method.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {paymentMethod === "BANK_TRANSFER" && (
                    <div className="space-y-2">
                      <Label htmlFor="account">Bank Account</Label>
                      <Select
                        value={selectedAccountId}
                        onValueChange={setSelectedAccountId}
                      >
                        <SelectTrigger className="bg-white border-green-200">
                          <SelectValue placeholder="Select Bank Account" />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts?.map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              {account?.account_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="paymentAmount">Payment Amount</Label>
                    <Input
                      id="paymentAmount"
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => handlePaymentAmountChange(e.target.value)}
                      placeholder={totalAmount.toString()}
                      className={`border-green-200 ${amountError ? "border-red-500" : ""}`}
                    />
                    {amountError && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          {amountError}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <Button 
                    onClick={handleSubmit}
                    disabled={
                      !selectedVendorId || 
                      !paymentAmount || 
                      parseFloat(paymentAmount) < totalAmount ||
                      !paymentMethod ||
                      (paymentMethod === "BANK_TRANSFER" && !selectedAccountId)
                    }
                    className="w-full bg-green-600 hover:bg-green-700 text-white shadow-lg"
                  >
                    Process Payment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Bills Table */}
          <div className="md:col-span-2">
            <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="border-b border-green-100">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-green-600 rounded-full">
                    <DollarSign className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-green-800">Bills Overview</CardTitle>
                    <CardDescription>Manage and filter bills</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="space-y-2">
                    <Label htmlFor="dueDate" className="text-sm font-medium text-green-700">
                      Filter by Due Date
                    </Label>
                    <Select 
                      value={selectedDueDate || "all"}
                      onValueChange={(value) => setSelectedDueDate(value === "all" ? null : value)}
                    >
                      <SelectTrigger className="bg-white border-green-200">
                        <SelectValue placeholder="Select Due Date" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Due Dates</SelectItem>
                        {uniqueDueDates.map((date) => (
                          <SelectItem key={date} value={date}>
                            {format(new Date(date), "dd/MM/yyyy")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vendor" className="text-sm font-medium text-green-700">
                      Filter by Vendor
                    </Label>
                    <Select 
                      value={selectedVendorId || "all"}
                      onValueChange={(value) => setSelectedVendorId(value === "all" ? null : value)}
                      disabled={isLoadingVendors}
                    >
                      <SelectTrigger className="bg-white border-green-200">
                        <SelectValue placeholder={isLoadingVendors ? "Loading..." : "Select Vendor"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Vendors</SelectItem>
                        {vendors?.map((vendor) => (
                          <SelectItem key={vendor.id} value={vendor.id}>
                            {vendor.name || "Unnamed Vendor"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="rounded-xl border border-green-100 overflow-hidden shadow-md bg-white">
                  <Table>
                    <TableHeader className="bg-green-50">
                      <TableRow>
                        <TableHead className="text-green-800 font-semibold">Bill Number</TableHead>
                        <TableHead className="text-green-800 font-semibold">Vendor</TableHead>
                        <TableHead className="text-green-800 font-semibold">Due Date</TableHead>
                        <TableHead className="text-green-800 font-semibold text-right">Amount</TableHead>
                        <TableHead className="text-green-800 font-semibold text-right">Balance Due</TableHead>
                        <TableHead className="text-green-800 font-semibold">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {billsLoading ? (
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
                      ) : !filteredBills?.length ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            <p className="font-medium text-green-700">No bills found</p>
                            <p className="text-sm text-green-600 mt-1">
                              {selectedVendorId && selectedDueDate 
                                ? "No bills found for selected vendor and due date"
                                : selectedVendorId 
                                  ? "No bills found for selected vendor"
                                  : selectedDueDate
                                    ? "No bills found for selected due date"
                                    : "No bills found in organization"}
                            </p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredBills.map((bill) => (
                          <TableRow key={bill.bill?.id} className="hover:bg-green-50/50 transition-colors duration-150">
                            <TableCell className="font-medium text-green-700">
                              {bill.bill?.bill_number}
                            </TableCell>
                            <TableCell className="text-green-700">
                              {bill.vendor?.name || "-"}
                            </TableCell>
                            <TableCell className="text-green-700">
                              {bill.bill?.due_date ? format(new Date(bill.bill.due_date), "dd/MM/yyyy") : "-"}
                            </TableCell>
                            <TableCell className="text-right font-medium text-green-700">
                              {selectedCurrency} {bill.bill?.amount.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </TableCell>
                            <TableCell className="text-right font-medium text-green-700">
                              {selectedCurrency} {bill.bill?.balance_due.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                bill.bill?.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                                bill.bill?.status === "PAID" ? "bg-green-100 text-green-800" :
                                "bg-gray-100 text-gray-800"
                              }`}>
                                {bill.bill?.status}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(BillPaymentPage), { ssr: false });