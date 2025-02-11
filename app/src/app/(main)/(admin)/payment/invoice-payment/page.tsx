"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, CreditCard, Banknote, CheckSquare, Globe, DollarSign, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue,  } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { trpc } from "@/app/_providers/trpc-provider";
import { getActiveOrganizationSlugFromLocalStorage } from "@/lib/helper-function";
import { Invoice, PaymentMethod } from "@prisma/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";



const CustomerPaymentPage = () => {
  const router = useRouter();
  const [date, setDate] = useState<Date>();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [loading, setLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string>();
  const [error, setError] = useState<string | null>(null);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const utils = trpc.useUtils();
  const [paymentInvoices, setPaymentInvoices] = useState<Invoice[]>([]);
  const [remainingAmountAfterPayment, setRemainingAmountAfterPayment] = useState<number>(0);
  const [selectedBankAccount, setSelectedBankAccount] = useState<string | null>(null);
  const [currency, setCurrency] = useState<string>("USD");
  const organization = getActiveOrganizationSlugFromLocalStorage();
  const { data: clients, isLoading: isLoadingClients } = trpc.getAllClientsWithUnpaidInvoices.useQuery({
    organization_slug: organization
  });

  const { data: invoices, isLoading: isLoadingInvoices } = trpc.getAllNotPaidInvoicesByClientId.useQuery({
    client_id: selectedClient as string
  }, {
    enabled: !!selectedClient
  });

  const { data: bankAccounts } = trpc.getAllAccountOfTypeBank.useQuery({
    organizationSlug: organization
  });

  const totalInvoiceAmount = invoices?.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0) || 0;

  const handlePaymentAmount = (paymentAmount: number) => {
    const invoicesToBePaid: Invoice[] = [];

    if(paymentAmount > 0 && invoices) {
   
      const smallestInvoice = invoices.reduce((min, inv) => 
        inv.amount < min.amount ? inv : min
      , invoices[0]);

      if(paymentAmount < smallestInvoice.amount) {
        setPaymentInvoices([]);
        return;
      }

      for(const invoice of invoices) {
        if(paymentAmount >= invoice.amount) {
          paymentAmount -= invoice.amount;
          invoicesToBePaid.push(invoice);
        }
      }

    }
    setPaymentInvoices(invoicesToBePaid);
    setRemainingAmountAfterPayment(paymentAmount);
  };
  const makeInvoicePayment = trpc.makeInvoicePayment.useMutation({
    onSuccess: () => {
      toast.success("Invoice payment made successfully");
      utils.getAllPaymentsByOrganization.invalidate();
      router.push("/payment");
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });



  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError(null);

    try {
      const data = {
        receivedFrom: formData.get("receivedFrom") as string,
        paymentAmount: Number(formData.get("paymentAmount")) || 0,
        date: date?.toISOString() || new Date().toISOString(),
        reference: formData.get("reference") as string || "",
        depositTo: formData.get("depositTo") as string,
        paymentMethod,
        exchangeRate: Number(formData.get("exchangeRate")) || 1,
        invoices: paymentInvoices.map(invoice => invoice.id),
        remainingAmount: remainingAmountAfterPayment,
        account_id: selectedBankAccount || null,
        organization_id: organization,
        currency
      };

      // if (!data.receivedFrom || !data.paymentAmount || !data.depositTo) {
      //   throw new Error("Please fill in all required fields");
      // }

      if (!data.paymentMethod) {
        throw new Error("Please select a payment method");
      }

      if (data.paymentMethod === PaymentMethod.BANK_TRANSFER && !data.account_id) {
        throw new Error("Please select a bank account for bank transfer");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      console.error("Error submitting payment:", err);
    } finally {
      setLoading(false);
    }
    makeInvoicePayment.mutate({
      list_of_invoices: paymentInvoices.map(invoice => invoice.id),
      organization_id: organization,
      pay_method: paymentMethod,
      pay_amount: totalAmount,
      payment_date: date || new Date(),
      account_id: selectedBankAccount || undefined,
      remaining_amount: remainingAmountAfterPayment,
      currency,
      client_id: selectedClient || undefined
    });
  };

  const formatDate = (dateString: string | Date | undefined) => {
    try {
      if (!dateString) return "";
      return format(new Date(dateString), "MM/dd/yyyy");
    } catch {
      return "";
    }
  };



  if (error) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center text-red-600">{error}</div>
            <Button 
              onClick={() => setError(null)} 
              className="mt-4 w-full bg-green-600 hover:bg-green-700"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto py-8 px-4">
        <Button
          onClick={() => router.push("/payment")}
          variant="ghost"
          className="mb-4 text-green-600 hover:text-green-700 hover:bg-green-50"

        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Payments
        </Button>
        
        <Card className="border-none shadow-lg bg-white">
          <CardHeader className="border-b border-green-200 pb-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-600 rounded-full">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-green-800">Customer Payment</CardTitle>
                <CardDescription>Process a new customer payment</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(new FormData(e.currentTarget)); }} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="receivedFrom" className="text-sm font-medium">
                    Received From
                  </Label>
                  <Select 
                    name="receivedFrom" 
                    required
                    onValueChange={(value) => {
                      setSelectedClient(value);
                    }}
                    disabled={isLoadingClients}
                  >
                    <SelectTrigger className="bg-white border-green-300">
                      <SelectValue placeholder={isLoadingClients ? "Loading..." : "Select Client"} />
                    </SelectTrigger>
                    <SelectContent>
                      {clients?.map((client) => (
                        <SelectItem key={client?.id} value={client?.id || ""}>
                          {client?.first_name + " " + client?.last_name || "Unnamed Client"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentAmount" className="text-sm font-medium">
                    Payment Amount ({currency})
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-green-400" />
                    <Input
                      type="number"
                      readOnly={!selectedClient}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        setTotalAmount(value);
                        handlePaymentAmount(value);
                      }}
                      name="paymentAmount"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className="pl-10 bg-white border-green-300"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-white border-green-300",
                          !date && "text-gray-500",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? formatDate(date) : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency" className="text-sm font-medium">
                    Payment Currency
                  </Label>
                  <Select 
                    name="currency" 
                    required
                    onValueChange={(value) => {
                      setCurrency(value);
                    }}
                  >
                    <SelectTrigger className="bg-white border-green-300">
                      <SelectValue placeholder="Select Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="NGN">NGN</SelectItem>
                    </SelectContent>
                  </Select>

                </div>

              </div>

          
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { method: PaymentMethod.CASH, icon: Banknote, label: "Cash" },
                    { method: PaymentMethod.CHEQUE, icon: CheckSquare, label: "Cheque" }, 
                    { method: PaymentMethod.BANK_TRANSFER, icon: CreditCard, label: "Bank Transfer" },
                    { method: PaymentMethod.CARD, icon: Globe, label: "Card" },



                  ].map(({ method, icon: Icon, label }) => (
                    <Button
                      key={method}
                      type="button"
                      variant={paymentMethod === method ? "default" : "outline"}
                      onClick={() => setPaymentMethod(method as PaymentMethod)}
                      className={cn(
                        "h-20 flex flex-col items-center justify-center space-y-2",
                        paymentMethod === method ? "bg-green-600 text-white" : "bg-white text-green-600 border-green-300",
                      )}
                    >
                      <Icon className="h-6 w-6" />
                      <span>{label}</span>
                    </Button>
                  ))}
                </div>

                {paymentMethod === PaymentMethod.BANK_TRANSFER && (
                  <div className="space-y-2">
                    <Label htmlFor="bankAccount">Select Bank Account</Label>
                    <Select 

                      name="depositTo" 
                      required
                      onValueChange={(value) => setSelectedBankAccount(value)}
                    >
                      <SelectTrigger className="w-full bg-white border-green-300">
                        <SelectValue placeholder="Select a bank account" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Bank Accounts</SelectLabel>
                          {bankAccounts?.map((account) => (
                            <SelectItem key={account.id} value={account.id}>{account.bank_name + " - " + account.account_name }</SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Invoice table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-green-800">
                    {!selectedClient ? (
                      "Payment Details"
                    ) : !totalAmount ? (
                      `${clients?.find(c => c.id === selectedClient)?.first_name + " " + clients?.find(c => c.id === selectedClient)?.last_name}'s Invoices`
                    ) : (
                      `Payment Distribution for ${currency} ${totalAmount?.toFixed(2)}`
                    )}

                  </CardTitle>
                  <CardDescription>
                    {!selectedClient ? (
                      "Please select a client to view their invoices"
                    ) : !totalAmount ? (
                      "Select invoices to apply payment"
                    ) : remainingAmountAfterPayment > 0 ? (
                      `Selected invoices will be paid with remaining balance of ${currency} ${remainingAmountAfterPayment.toFixed(2)}`
                    ) : (
                      "Selected invoices will be paid in full"
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!selectedClient ? (
                    <div className="text-center py-8 text-green-500">
                      Please select a client to begin
                    </div>
                  ) : isLoadingInvoices  ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                      <span className="ml-2 text-green-600">Loading invoices...</span>

                    </div>
                  ) : invoices?.length === 0 ? (
                    <div className="text-center py-8 text-green-500">
                      No invoices found for this client
                    </div>
                  ) : !totalAmount ? (
                    // Regular invoice table when no payment amount is entered
                    <div className="rounded-md border border-green-200 overflow-hidden">
                      <Table>
                        <TableHeader className="bg-green-50">
                          <TableRow>
                            <TableHead className="w-[50px]">
                              <input type="checkbox" className="rounded border-green-300" />
                            </TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Number</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Due Date</TableHead>

                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {invoices?.map((invoice) => (
                            <TableRow key={invoice.id} className="hover:bg-green-50">
                              <TableCell>
                                <input type="checkbox" className="rounded border-green-300" />

                              </TableCell>
                              <TableCell>{formatDate(invoice.created_at)}</TableCell>
                              <TableCell>{invoice.invoice_number}</TableCell>
                              <TableCell>{currency} {invoice.amount?.toFixed(2) || "0.00"}</TableCell>
                             
                              <TableCell>

                                {invoice.status === "DRAFT" ? "Draft" :
                                  invoice.status === "SENT" ? "Sent" :
                                    invoice.status === "PAID" ? "Paid" :
                                      invoice.status === "OVERDUE" ? "Overdue" :
                                        invoice.status || "Unknown"}
                              </TableCell>

                              <TableCell>{formatDate(invoice.due_date)}</TableCell>
                    
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {paymentInvoices?.length > 0 ? (
                        <div>
                          <h3 className="text-md font-medium mb-2">Invoices To Be Paid</h3>
                          <div className="rounded-md border border-green-200 overflow-hidden bg-green-50">
                            <Table>
                              <TableHeader className="bg-green-100">
                                <TableRow>
                                  <TableHead>Date</TableHead>
                                  <TableHead>Number</TableHead>
                                  <TableHead>Amount</TableHead>
                                  <TableHead>Due Date</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {paymentInvoices?.map((invoice) => (
                                  <TableRow key={invoice.id} className="hover:bg-green-100">
                                    <TableCell>{formatDate(invoice.created_at)}</TableCell>
                                    <TableCell>{invoice.invoice_number}</TableCell>
                                    <TableCell>{currency} {invoice.amount?.toFixed(2) || "0.00"}</TableCell>
                                    <TableCell>{formatDate(invoice.due_date)}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <h3 className="text-md font-medium mb-2">Invoices To Be Paid</h3>
                          <div className="rounded-md border border-green-200 overflow-hidden bg-green-50">
                            <Table>
                              <TableHeader className="bg-green-100">
                                <TableRow>
                                  <TableHead>Date</TableHead>
                                  <TableHead>Number</TableHead>
                                  <TableHead>Amount</TableHead>
                                  <TableHead>Due Date</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                <TableRow>
                                  <TableCell colSpan={4} className="text-center py-8 text-green-600">
                                    The inputted amount cannot cover any invoice. Please enter a higher amount.
                                  </TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      )}

                   
                      {(() => {
                        // Calculate unpaid invoices once to avoid duplicate filtering
                        const unpaidInvoices = invoices?.filter(inv => 
                          !paymentInvoices?.find(p => p.id === inv.id)
                        ) || [];

                        return unpaidInvoices.length > 0 && (
                          <div>
                            <h3 className="text-md font-medium mb-2">Remaining Unpaid Invoices</h3>
                            <div className="rounded-md border border-green-200 overflow-hidden">
                              <Table>
                                <TableHeader className="bg-green-50">
                                  <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Number</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Due Date</TableHead>
                                  </TableRow>
                                </TableHeader>

                                <TableBody>
                                  {unpaidInvoices.map((invoice) => (
                                    <TableRow key={invoice.id} className="hover:bg-green-50">
                                      <TableCell>{formatDate(invoice.created_at)}</TableCell>
                                      <TableCell>{invoice.invoice_number}</TableCell>
                                      <TableCell>{currency} {invoice.amount?.toFixed(2) || "0.00"}</TableCell>
                                      <TableCell>{formatDate(invoice.due_date)}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-wrap gap-2">
                  <Button 
                    type="submit" 
                    disabled={loading} 
                    className="bg-green-600 text-white hover:bg-green-700"
                  >
                    {loading ? "Saving..." : "Save & Close"}
                  </Button>
               
                  <Button
                    type="reset"
                    variant="ghost"
                    onClick={() => {
                      setDate(undefined);
                      setError(null);
                    }}
                  >
                    Clear
                  </Button>
                </div>
                <div className="flex flex-col gap-4 w-full sm:w-auto">
                  <Card className="p-4 bg-green-50 border-green-200">
                    <div className="text-right space-y-1">
                      <div className="text-sm text-green-600">Total Amount Due</div>
                      <div className="text-2xl font-bold text-green-700">{currency} {totalInvoiceAmount.toFixed(2)}</div>
                    </div>
                  </Card>
                  {totalAmount > 0 && (
                    <Card className={cn(
                      "p-4 border",
                      totalAmount >= totalInvoiceAmount 
                        ? "bg-green-50 border-green-200" 
                        : "bg-green-50 border-green-200"
                    )}>
                      <div className="text-right space-y-1">
                        <div className="text-sm text-green-600">
                          {totalAmount >= totalInvoiceAmount 
                            ? "Remaining After Payment" 
                            : "Additional Amount Needed"}
                        </div>
                        <div className={cn(
                          "text-xl font-bold",
                          totalAmount >= totalInvoiceAmount 
                            ? "text-green-600" 
                            : "text-green-600"
                        )}>
                          {currency} {Math.abs(totalAmount - totalInvoiceAmount).toFixed(2)}
                        </div>
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(CustomerPaymentPage), { ssr: false });
