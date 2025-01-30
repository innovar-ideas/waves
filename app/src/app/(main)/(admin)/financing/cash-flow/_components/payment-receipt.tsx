import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { useRef } from "react";
import html2canvas from "html2canvas";
import Image from "next/image";
import { PaymentReceiptProps } from "@/lib/models";



export function PaymentReceipt({ payment }: PaymentReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  

  // Update the value access with type assertion
  const logo = payment.organization.preferences.find(
    p => p.name === "largeLogo"
  )?.value as string | undefined;
  

  const handlePrint = async () => {
    if (receiptRef.current) {
      const canvas = await html2canvas(receiptRef.current);
      const imgData = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = imgData;
      link.download = `Payment_Receipt_${payment.id}.png`;
      link.click();
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Printer className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <div ref={receiptRef} className="p-6 bg-white">
          {/* Header Section */}
          <div className="text-center border-b pb-4 mb-6">
            {logo && (
              <Image 
                src={logo} 
                alt="School Logo" 
                className="mx-auto h-16 w-auto mb-2"
                width={100}
                height={100}
              />
            )}
            <h1 className="text-xl font-bold text-primaryTheme-500">
              {payment.organization.name}
            </h1>
            <div className="text-sm text-gray-500 mt-1">
              {payment.organization.contact_email && (
                <p>Email: {payment.organization.contact_email}</p>
              )}
              {payment.organization.contact_phone_number && (
                <p>Tel: {payment.organization.contact_phone_number}</p>
              )}
            </div>
          </div>

          {/* Receipt Title */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-primaryTheme-500">
              Payment Receipt
            </h2>
            <p className="text-sm text-gray-500">#{payment.id}</p>
          </div>

          {/* Payment Details */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <p className="text-gray-500">Date:</p>
              <p>{new Date(payment.payment_date).toLocaleDateString()}</p>

              <p className="text-gray-500">Amount:</p>
              <p className="font-semibold">₦{payment.amount.toLocaleString()}</p>

              <p className="text-gray-500">Payment Method:</p>
              <p>{payment.payment_method}</p>

              <p className="text-gray-500">Reference:</p>
              <p>{payment.reference || "-"}</p>

              {payment.invoice && (
                <>
                  <p className="text-gray-500">Invoice:</p>
                  <p>{payment.invoice.invoice_number}</p>
                  <p className="text-gray-500">Customer:</p>
                  <p>{payment.invoice.customer_name}</p>
                </>
              )}

              {payment.bill && (
                <>
                  <p className="text-gray-500">Bill:</p>
                  <p>{payment.bill.bill_number}</p>
                  <p className="text-gray-500">Vendor:</p>
                  <p>{payment.bill.vendor_name}</p>
                </>
              )}

              {payment.account && (
                <>
                  <p className="text-gray-500">Account:</p>
                  <p>{payment.account.account_name}</p>
                </>
              )}
            </div>

            <div className="mt-6 pt-4 border-t">
              <p className="text-gray-500 text-sm">Description:</p>
              <p className="text-sm">{payment.description || "-"}</p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t text-center text-sm text-gray-500">
            <p>Thank you for your payment</p>
            <p className="mt-1">This is a computer generated receipt</p>
          </div>
        </div>
        <Button onClick={handlePrint} className="mt-4 bg-emerald-500 hover:bg-emerald-600">Download Receipt</Button>
      </DialogContent>
    </Dialog>
  );
} 