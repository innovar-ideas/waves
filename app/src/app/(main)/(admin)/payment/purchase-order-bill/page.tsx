"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon,  DollarSign, ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue,  } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { trpc } from "@/app/_providers/trpc-provider";
import { getActiveOrganizationSlugFromLocalStorage } from "@/lib/helper-function";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const CustomerPaymentPage = () => {
  const router = useRouter();
  const [date, setDate] = useState<Date>();
  const [loading, setLoading] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState<string>();
  const [error, setError] = useState<string | null>(null);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  
  const [currency, setCurrency] = useState<string>("USD");
  const organization = getActiveOrganizationSlugFromLocalStorage();
  const { data: vendors, isLoading: isLoadingVendors } = trpc.getAllVendorsByOrganizations.useQuery({
    id: organization
  });

  const { data: purchaseOrders, isLoading: isLoadingPurchaseOrders } = trpc.getAllPurchaseOrdersByVendorWithNoBill.useQuery({
    id: selectedVendorId as string
  }, {
    enabled: !!selectedVendorId
  });

  const totalPurchaseOrderAmount = purchaseOrders?.reduce((sum, po) => sum + (Number(po.purchase_orders.price) || 0), 0) || 0;

  const getPayablePurchaseOrders = () => {
    if (!purchaseOrders || totalAmount !== totalPurchaseOrderAmount) return [];
    return purchaseOrders;
  };

  const payablePurchaseOrders = getPayablePurchaseOrders();

  const createPurchaseOrder = trpc.createPurchaseOrderBill.useMutation({
    onSuccess: () => {
      toast.success("Purchase order payment made successfully");
      router.push("/payment");
    },
    onError: (error) => {
      toast.error(error.message);
      console.error("❌ API Error:", error.message);
    }
  });

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!date) {
        throw new Error("Please select a due date");
      }

      if (!selectedVendorId) {
        throw new Error("Please select a vendor");
      }

      const purchaseOrderDetails = payablePurchaseOrders.map(po => ({
        id: po.purchase_orders.id,
        amount: po.purchase_orders.price,
        purchase_order_number: po.purchase_orders.purchase_order_number
      }));

      if (totalAmount !== totalPurchaseOrderAmount) {
        throw new Error("Amount must equal total bill amount");
      }

      createPurchaseOrder.mutate({
        organization_id: organization,
        amount: totalAmount,
        due_date: date,
        list_of_purchase_orders: purchaseOrderDetails.map(po => po.id),
        vendor_id: selectedVendorId,
        purchase_order_number: `PO-BILL-${Date.now()}`,
        type: "PURCHASE_ORDER"
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      console.error("❌ Form Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | Date | null | undefined) => {
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
        <div className="flex justify-between items-center mb-4">
          <Button
            onClick={() => router.push("/payment")}
            variant="ghost"
            className="text-green-600 hover:text-green-700 hover:bg-green-50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Payments
          </Button>

          <Button
            onClick={() => router.push("/payment/purchase-order-bill/create-purchase-order")}
            className="bg-green-600 text-white hover:bg-green-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Purchase Order
          </Button>
        </div>
        
        <Card className="border-none shadow-lg bg-white">
          <CardHeader className="border-b border-green-200 pb-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-600 rounded-full">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-green-800">Purchase Order Payment</CardTitle>
                <CardDescription>Process a new purchase order bill payment</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={(e) => { 
              e.preventDefault(); 
              handleSubmit(); 
            }} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
                <div className="space-y-2">
                  <Label htmlFor="vendor" className="text-sm font-medium">
                  Select Vendor
                  </Label>
                  <Select 
                    name="vendor" 
                    required
                    onValueChange={(value) => {
                      setSelectedVendorId(value);
                      setTotalAmount(0); // Reset amount when vendor changes
                    }}
                    disabled={isLoadingVendors}
                  >
                    <SelectTrigger className="bg-white border-green-300">
                      <SelectValue placeholder={isLoadingVendors ? "Loading..." : "Select Vendor"} />
                    </SelectTrigger>
                    <SelectContent>
                      {vendors?.map((vendor) => (
                        <SelectItem key={vendor?.id} value={vendor?.id || ""}>
                          {vendor?.name || "Unnamed Vendor"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Due Date</Label>
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
                  <Label htmlFor="paymentAmount" className="text-sm font-medium">
                    Payment Amount ({currency})
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-green-400" />
                    <Input
                      type="number"
                      readOnly={!selectedVendorId}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        setTotalAmount(value);
                      }}
                      name="paymentAmount"
                      step="0.01"
                      min="0"
                      placeholder={totalPurchaseOrderAmount ? totalPurchaseOrderAmount.toFixed(2) : "0.00"}
                      className="pl-10 bg-white border-green-300"
                      required
                    />
                  </div>
                  {totalAmount !== totalPurchaseOrderAmount && totalAmount > 0 && (
                    <p className="text-red-500 text-sm mt-1">Amount must equal total bill amount: {currency} {totalPurchaseOrderAmount.toFixed(2)}</p>
                  )}
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

              {/* Purchase Orders table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-green-800">
                    {!selectedVendorId ? (
                      "Payment Details"
                    ) : (
                      `${vendors?.find(v => v.id === selectedVendorId)?.name}'s Purchase Orders`
                    )}
                  </CardTitle>
                  <CardDescription>
                    {!selectedVendorId ? (
                      "Please select a vendor to view their purchase orders"
                    ) : (
                      "Total amount must be paid in full"
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!selectedVendorId ? (
                    <div className="text-center py-8 text-green-500">
                      Please select a vendor to begin
                    </div>
                  ) : isLoadingPurchaseOrders ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                      <span className="ml-2 text-green-600">Loading purchase orders...</span>
                    </div>
                  ) : (
                    <div className="rounded-md border border-green-200 overflow-hidden">
                      <Table>
                        <TableHeader className="bg-green-50">
                          <TableRow>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Purchase Order Number</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Vendor</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {purchaseOrders?.map((po) => (
                            <TableRow key={po.purchase_orders.id} className="hover:bg-green-50">
                              <TableCell>{formatDate(po.purchase_orders.created_at)}</TableCell>
                              <TableCell>{po.purchase_orders.purchase_order_number}</TableCell>
                              <TableCell>{currency} {po.purchase_orders.price?.toFixed(2) || "0.00"}</TableCell>
                              <TableCell>{totalAmount === totalPurchaseOrderAmount ? "To be paid" : "Unpaid"}</TableCell>
                              <TableCell>{po.vendor?.name || "Unnamed Vendor"}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-wrap gap-2">
                  <Button 
                    type="submit" 
                    disabled={loading || totalAmount !== totalPurchaseOrderAmount} 
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
                      setTotalAmount(0);
                    }}
                  >
                    Clear
                  </Button>
                </div>
                <div className="flex flex-col gap-4 w-full sm:w-auto">
                  <Card className="p-4 bg-green-50 border-green-200">
                    <div className="text-right space-y-1">
                      <div className="text-sm text-green-600">Total Amount Due</div>
                      <div className="text-2xl font-bold text-green-700">{currency} {totalPurchaseOrderAmount.toFixed(2)}</div>
                    </div>
                  </Card>
                  {totalAmount > 0 && (
                    <Card className="p-4 bg-green-50 border-green-200">
                      <div className="text-right space-y-1">
                        <div className="text-sm text-green-600">
                          Amount Being Paid
                        </div>
                        <div className="text-xl font-bold text-green-600">
                          {currency} {totalAmount.toFixed(2)}
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