"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { PaymentForm } from "./payment-form";
import { Bill, Invoice } from "@prisma/client";

interface PaymentDialogProps {
  sourceType: "invoice" | "bill" | "income" | "expense" | "account";
  sourceId?: string;
  amount?: number;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
  data?: Invoice | Bill;
}

export function PaymentDialog({
  sourceType,
  sourceId,
  amount,
  trigger,
  onSuccess,
  data
}: PaymentDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>Record Payment</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
        </DialogHeader>
        <PaymentForm
          sourceType={sourceType}
          sourceId={sourceId}
          data={data}
          defaultAmount={amount}
          onSuccess={handleSuccess}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
} 