"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/app/_providers/trpc-provider";
import { getActiveOrganizationSlugFromLocalStorage } from "@/lib/helper-function";
import { toast } from "sonner";


export default function BillManagement(): JSX.Element {
  const [date, setDate] = useState<Date>();
  const [selectedVendor, setSelectedVendor] = useState<string>("");
  const [selectedBill, setSelectedBill] = useState<string>("");
  const [referenceNumber, setReferenceNumber] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [currency, setCurrency] = useState<string>("USD");
  const utils = trpc.useUtils();
  const router = useRouter();
  const orgId = getActiveOrganizationSlugFromLocalStorage() || "";
  const [paymentMethod, setPaymentMethod] = useState<string>("BANK_TRANSFER");

  const {data: vendors = [], isPending: isVendorsLoading, error: vendorsError} = trpc.getAllVendorsWithBillsNotPaid.useQuery(
    {id: orgId},
    {
      enabled: !!orgId,
      retry: 2
    }
  );

  const {data: accounts = [], isPending: isAccountsLoading, error: accountsError} = trpc.getAllAccountOfTypeBank.useQuery(
    {organizationSlug: orgId},
    {
      enabled: !!orgId,
      retry: 2
    }
  );

  const {data: bills , isPending: isBillsLoading, error: billsError} = trpc.getAllNotPaidBillsByVendorId.useQuery(
    { id: selectedVendor },
    { 
      enabled: !!selectedVendor,
      retry: 2
    }
  );

  const selectedBillData = bills?.find(bill => bill.id === selectedBill);
  const createPayment = trpc.createPayment.useMutation({
    onSuccess: () => {
      toast.success("Payment created successfully");
      utils.getAllPaymentsByOrganization.invalidate();
      router.push("/payment");
    },
    onError: () => {
      toast.error("Failed to create payment");
    }
  });

  const handleSubmit = () => {
    const affordableItems = getAffordableItems();
    
    const paymentData = {
      amount: parseFloat(amount),
      organization_slug: orgId,
      payment_method: paymentMethod as "BANK_TRANSFER" | "CASH" | "CARD" | "CHEQUE",
      payment_date: date || new Date(),
      transaction_type: "OUTFLOW" as const,
      description: notes,
      reference: referenceNumber,
      currency: currency,
      vendor_id: selectedVendor,
      bill_id: selectedBill,
      line_items: affordableItems.map(item => ({ id: item.id })),
      bank_account_id: paymentMethod === "BANK_TRANSFER" ? selectedAccount : undefined
    };

    if(paymentData.amount <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }

    if(!paymentData.vendor_id) {
      toast.error("Vendor is required");
      return;
    }
    if(!paymentData.bill_id) {
      toast.error("Bill is required");
      return;
    }
    if(!paymentData.line_items.length) {
      toast.error("At least one item is required");
      return;
    }
    if (!paymentData.payment_method) {
      toast.error("Payment method is required");
      return;
    }

    if(paymentData.payment_method === "BANK_TRANSFER" && !paymentData.bank_account_id) {
      toast.error("Bank account is required for bank transfer");
      return;
    }

    if (!paymentData.payment_date) {
      toast.error("Payment date is required");
      return;
    }

    createPayment.mutate(paymentData);
  };

  const formatDate = (dateString: Date | string) => {
    try {
      const date = typeof dateString === "string" ? new Date(dateString) : dateString;
      return format(date, "MM/dd/yyyy");
    } catch {
      return "Invalid date";
    }
  };

  const getCurrencySymbol = (currencyCode: string) => {
    switch(currencyCode) {
      case "USD": return "$";
      case "EUR": return "€";
      case "GBP": return "£";
      case "NGN": return "₦";
      default: return "$";
    }
  };

  const formatCurrency = (amount: number | undefined | null) => {
    if (amount == null) return `${getCurrencySymbol(currency)}0.00`;
    return `${getCurrencySymbol(currency)}${amount.toFixed(2)}`;
  };

  // Filter items based on entered amount
  const getAffordableItems = () => {
    if (!selectedBillData?.account_items || !amount) return [];
    
    let remainingAmount = parseFloat(amount);
    const affordableItems = [];
    
    for (const item of selectedBillData.account_items) {
      if (remainingAmount >= item.amount) {
        affordableItems.push(item);
        remainingAmount -= item.amount;
      }
    }
    
    return affordableItems;
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-5xl mx-auto">
        <Button
          onClick={() => router.push("/payment")}
          variant="ghost" 
          className="mb-6 text-green-600 hover:text-green-700 hover:bg-green-50"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Payments
        </Button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Bill Payment</h1>
            <p className="text-sm text-gray-500 mt-1">Create and manage bill payments</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-5">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Select Vendor</Label>
                  <select 
                    disabled={isVendorsLoading || !!vendorsError}
                    className={cn(
                      "mt-1.5 w-full rounded-lg bg-white border border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500 py-2.5 px-3",
                      (isVendorsLoading || !!vendorsError) ? "text-gray-400" : "text-gray-900"
                    )}
                    onChange={(e) => setSelectedVendor(e.target.value)}
                    value={selectedVendor}
                  >
                    <option value="">
                      {isVendorsLoading ? "Loading vendors..." : 
                       vendorsError ? "Error loading vendors" :
                       "Select a vendor"}
                    </option>
                    {!isVendorsLoading && !vendorsError && vendors?.map((vendor) => (
                      <option key={vendor.id} value={vendor.id}>
                        {vendor.name || "Unnamed Vendor"}
                      </option>
                    ))}
                  </select>
                  {vendorsError && <p className="text-sm text-red-500 mt-1">Failed to load vendors</p>}
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Due Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn(
                        "mt-1.5 w-full justify-start text-left font-normal border-gray-300 hover:bg-gray-50",
                        !date && "text-gray-500"
                      )}>
                        <CalendarIcon className="mr-2 h-4 w-4 text-gray-400" />
                        {date ? format(date, "MMMM d, yyyy") : <span>Select date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Reference Number</Label>
                  <Input 
                    className="mt-1.5 border-gray-300" 
                    placeholder="e.g. INV-2024-001"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Select Bill</Label>
                  <select
                    disabled={isBillsLoading || !selectedVendor || !!billsError}
                    className={cn(
                      "mt-1.5 w-full rounded-lg bg-white border border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500 py-2.5 px-3",
                      (isBillsLoading || !selectedVendor || !!billsError) ? "text-gray-400" : "text-gray-900"
                    )}
                    onChange={(e) => setSelectedBill(e.target.value)}
                    value={selectedBill}
                  >
                    <option value="">
                      {isBillsLoading ? "Loading bills..." : 
                       billsError ? "Error loading bills" :
                       !selectedVendor ? "Select a vendor first" :
                       "Select a bill"}
                    </option>
                    {!isBillsLoading && !billsError && bills?.map((bill) => (
                      <option key={bill.id} value={bill.id}>
                        {(bill.status || "No Status")} - {formatCurrency(bill.amount)}
                      </option>
                    ))}
                  </select>
                  {billsError && <p className="text-sm text-red-500 mt-1">Failed to load bills</p>}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Currency</Label>
                    <select 
                      className="mt-1.5 w-full rounded-lg bg-white border border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500 py-2.5 px-3 text-gray-900"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="NGN">NGN (₦)</option>
                    </select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">Amount</Label>
                    <div className="relative mt-1.5">
                      <span className="absolute left-3 top-2.5 text-gray-500">{getCurrencySymbol(currency)}</span>
                      <Input 
                        type="number" 
                        step="0.01" 
                        min="0" 
                        placeholder="0.00" 
                        className="pl-7 border-gray-300"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Payment Method</Label>
                  <select 
                    className="mt-1.5 w-full rounded-lg bg-white border border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500 py-2.5 px-3 text-gray-900"
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    value={paymentMethod}
                  >
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="CARD">Credit Card</option>
                    <option value="CASH">Cash</option>
                  </select>
                </div>

                {paymentMethod === "BANK_TRANSFER" && (
                  <div className="mt-4">
                    <Label className="text-sm font-medium text-gray-700">Select Account</Label>
                    <select 
                      className="mt-1.5 w-full rounded-lg bg-white border border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500 py-2.5 px-3 text-gray-900"
                      disabled={isAccountsLoading || !!accountsError}
                      value={selectedAccount}
                      onChange={(e) => setSelectedAccount(e.target.value)}
                    >
                      <option value="">
                        {isAccountsLoading ? "Loading accounts..." : 
                         accountsError ? "Error loading accounts" :
                         "Select an account"}
                      </option>
                      {!isAccountsLoading && !accountsError && accounts?.map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.account_name || "Unnamed Account"} - {account.bank_name || "Unknown Bank"}
                        </option>
                      ))}
                    </select>
                    {accountsError && <p className="text-sm text-red-500 mt-1">Failed to load accounts</p>}
                  </div>
                )}

                <div>
                  <Label className="text-sm font-medium text-gray-700">Notes</Label>
                  <Input 
                    placeholder="Add payment notes" 
                    className="mt-1.5 border-gray-300"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
            <Button 
              variant="outline" 
              className="text-gray-700 border-gray-300 hover:bg-gray-50"
              onClick={() => router.push("/payment")}
            >
              Cancel
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white font-medium px-6"
              onClick={handleSubmit}
            >
              Process Payment
            </Button>
          </div>
        </div>
      </div>

      {/* Table Section */}
      {selectedBillData && (
        <div className="space-y-8">
          {/* Show all items when no amount entered, otherwise show affordable items */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {amount ? "Affordable Bill Items" : "All Bill Items"}
            </h2>
            <div className={cn(
              "rounded-lg border overflow-hidden",
              amount ? "border-green-200" : "border-gray-200"
            )}>
              <Table>
                <TableHeader>
                  <TableRow className={amount ? "bg-green-50" : "bg-gray-50"}>
                    <TableHead className={amount ? "text-green-700" : "text-gray-700"}>Status</TableHead>
                    <TableHead className={amount ? "text-green-700" : "text-gray-700"}>Description</TableHead>
                    <TableHead className={amount ? "text-green-700" : "text-gray-700"}>Quantity</TableHead>
                    <TableHead className={amount ? "text-green-700" : "text-gray-700"}>Price</TableHead>
                    <TableHead className={amount ? "text-green-700" : "text-gray-700"}>Amount</TableHead>
                    <TableHead className={amount ? "text-green-700" : "text-gray-700"}>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(amount ? getAffordableItems() : selectedBillData.account_items).map((item) => (
                    <TableRow key={item.id} className={amount ? "hover:bg-green-50" : "hover:bg-gray-50"}>
                      <TableCell className={amount ? "text-green-800" : "text-gray-800"}>
                        {item.status}
                      </TableCell>
                      <TableCell className={amount ? "text-green-800" : "text-gray-800"}>
                        {item.description 
                          ? item.description.length > 50 
                            ? `${item.description.substring(0, 50)}...`
                            : item.description
                          : "No description"}
                      </TableCell>
                      <TableCell className={amount ? "text-green-800" : "text-gray-800"}>{item.quantity || 0}</TableCell>
                      <TableCell className={amount ? "text-green-800" : "text-gray-800"}>{formatCurrency(item.price)}</TableCell>
                      <TableCell className={amount ? "text-green-800" : "text-gray-800"}>{formatCurrency(item.amount)}</TableCell>
                      <TableCell className={amount ? "text-green-800" : "text-gray-800"}>
                        {formatDate(item.date)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {amount ? (
                    getAffordableItems().length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-gray-500 py-4">
                          No affordable items available
                        </TableCell>
                      </TableRow>
                    )
                  ) : (
                    selectedBillData.account_items.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-gray-500 py-4">
                          No items available
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
