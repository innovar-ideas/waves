"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { trpc } from "@/app/_providers/trpc-provider";
import { getActiveOrganizationSlugFromLocalStorage } from "@/lib/helper-function";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { Textarea } from "@/components/ui/textarea";

const CreatePurchaseOrderPage = () => {
  const router = useRouter();
  const [date, setDate] = useState<Date>();
  const [loading, setLoading] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState<string>();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [currency, setCurrency] = useState<string>("USD");

  const organization = getActiveOrganizationSlugFromLocalStorage();
  const user_id = useSession().data?.user.id || "";
  
  const { data: vendors, isLoading: isLoadingVendors } = trpc.getAllVendorsByOrganizations.useQuery({
    id: organization
  });

  const createPurchaseOrder = trpc.createPurchaseOrder.useMutation({
    onSuccess: () => {
      toast.success("Purchase order created successfully");
      router.push("/payment/purchase-order-bill");
    },
    onError: (error) => {
      toast.error(error.message);
      setError(error.message);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(undefined);

    if (!date || !selectedVendorId || !amount || !description) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    try {
      createPurchaseOrder.mutate({
        vendor_id: selectedVendorId,
        created_by_id: user_id,
        organization_id: organization,
        purchase_order_number: `PO-${Date.now()}`,
        price: parseFloat(amount),
        type: "PURCHASE_ORDER",
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto py-6 px-4 max-w-2xl">
        <Button
          variant="ghost"
          className="mb-4 hover:bg-green-100 text-green-700"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card className="shadow-md border-green-100">
          <CardHeader className="bg-green-50 border-b border-green-100 py-4">
            <CardTitle className="text-xl font-bold text-green-800">Create Purchase Order</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-green-700">Vendor</Label>
                  <Select value={selectedVendorId} onValueChange={setSelectedVendorId} disabled={isLoadingVendors}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder={isLoadingVendors ? "Loading vendors..." : "Select vendor"} />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingVendors ? (
                        <SelectItem value="loading" disabled>Loading vendors...</SelectItem>
                      ) : vendors?.map((vendor) => (
                        <SelectItem key={vendor.id} value={vendor.id}>{vendor.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-green-700">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("mt-1 w-full justify-start", !date && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PP") : "Pick date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={date} onSelect={setDate} />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div>
                <Label className="text-green-700">Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter description"
                  className="mt-1 h-20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-green-700">Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["USD", "EUR", "GBP", "NGN"].map((curr) => (
                        <SelectItem key={curr} value={curr}>{curr}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-green-700">Amount</Label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t">
                <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
                  {loading ? "Creating..." : "Create"}
                </Button>
                <Button
                  type="reset"
                  variant="outline"
                  onClick={() => {
                    setDate(undefined);
                    setSelectedVendorId(undefined);
                    setDescription("");
                    setAmount("");
                    setError(undefined);
                  }}
                  className="border-green-200"
                >
                  Clear
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(CreatePurchaseOrderPage), { ssr: false });
