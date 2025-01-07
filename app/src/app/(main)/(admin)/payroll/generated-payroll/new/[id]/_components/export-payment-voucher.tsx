
import * as XLSX from "xlsx";
import Link from "next/link";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Bank, Payroll, StaffProfile, User } from "@prisma/client";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface PaymentVoucherProps {
  data: (Payroll & { staff: StaffProfile & { user: User; bank: Bank | null }; approved_by: User | null })[] | null;
}

const ExportPaymentVoucher = ({ data }: PaymentVoucherProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const newData = data?.map((item) => ({
    staffName: `${item.staff.user.first_name} ${item.staff.user.last_name}`,
    amount: item.staff.amount_per_month,
    accountNumber: item.staff.bank_account_no,
    accountName: item.staff.bank_account_name,
    sort_code: item.staff.bank?.sort_code ?? "",
    date: new Date()
  }));

  const onSubmit = async () => {
    setIsLoading(true);

    if (newData) {

      setIsLoading(false);
      const workbook = XLSX.utils.book_new();
      const sheet = XLSX.utils.json_to_sheet(newData);

      XLSX.utils.book_append_sheet(workbook, sheet, "");

      const writingOptions: XLSX.WritingOptions = {
        type: "array",
        bookType: "xlsx"
      };
      const excelBuffer = XLSX.write(workbook, writingOptions)  as unknown as BlobPart;
      const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "payment_voucher.xlsx";
      link.click();

      toast({
        variant: "default",
        title: "Success",
        description: "Exported Sucessfully!",
      });
      setOpen(false);
    }
  };

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
           
          <Button disabled={data?.every(pay => !pay.approved)} className="w-full px-6 whitespace-nowrap bg-green-600">Export</Button>
      </DialogTrigger>
      <DialogContent className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-lg shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Export Payment Voucher</DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            Are you sure you want to export? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-6 space-x-4">

          <div className="flex items-center gap-2 mt-8">
            <Link href={"/constants?display_name=Dollar+to+Naira+Conversion+Rate"}>
              <Button className="mr-10 px-6 whitespace-nowrap bg-red-500">
                Cancel
                
              </Button>
            </Link>
            <Button onClick={onSubmit} disabled={isLoading} className="w-full px-6 whitespace-nowrap bg-green-600">
                Export
            </Button>
          </div>
          </DialogFooter>
      </DialogContent>
    </Dialog>

    </div>
  );
};

export default ExportPaymentVoucher;
