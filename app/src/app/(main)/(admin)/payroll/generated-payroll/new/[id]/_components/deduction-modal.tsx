"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { PayrollItem } from "@/app/server/types";
import { formatAmountToNaira } from "@/lib/helper-function";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { useState } from "react";
import { generateDeductionPDF } from "./generate-deduction-pdf";

interface DeductionsModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  staffName: string;
  deductions: PayrollItem[];
  month: string;
  date: string;
}

export default function DeductionsModal({ 
  open, 
  setOpen, 
  staffName, 
  deductions,
  month,
  date 
}: DeductionsModalProps) {
  const [showExportDialog, setShowExportDialog] = useState<boolean>(false);
  const [selectedDeduction, setSelectedDeduction] = useState<PayrollItem | null>(null);

  const handleExport = (deduction: PayrollItem): void => {
    setSelectedDeduction(deduction);
    setShowExportDialog(true);
  };

  const confirmExport = (): void => {
    if (selectedDeduction) {
      generateDeductionPDF({
        staffName,
        deduction: selectedDeduction,
        month,
        date
      });
    }
    setShowExportDialog(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Deductions for {staffName}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <div className="space-y-4">
              {deductions.map((deduction) => (
                <div key={deduction.name} className="flex justify-between items-center">
                  <span className="font-medium">{deduction.name}</span>
                  <div className="flex items-center gap-4">
                    <span>{formatAmountToNaira(deduction.amount.toFixed(2))}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExport(deduction)}
                    >
                      <FileDown className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              ))}
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center font-semibold">
                  <span>Total Deductions</span>
                  <span>
                    {formatAmountToNaira(
                      deductions.reduce((acc, curr) => acc + curr.amount, 0).toFixed(2)
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Export Deduction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to export {selectedDeduction?.name} deduction for {staffName} as PDF?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmExport}>
              Export PDF
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

