"use client";

import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatAmountToNaira } from "@/lib/helper-function";
import { useForm } from "react-hook-form";
import { toast } from "@/components/ui/use-toast";
import { PayrollFormData, PayrollTemplateField, StaffWithPayroll } from "@/app/server/module/types";

interface PayrollTemplateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: StaffWithPayroll;
  onSubmit: (data: PayrollFormData) => Promise<void>;
}

interface LineItem {
  name?: string;
  required?: boolean;
  description?: string;
  isDeduction: boolean;
}

export default function PayrollTemplateModal({
  open,
  onOpenChange,
  staff,
  onSubmit,
}: PayrollTemplateModalProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { isSubmitting },
  } = useForm<PayrollFormData>();

  const template = staff.payroll_template?.data as unknown as LineItem[] || [];
  const additions = template.filter((field) => !field.isDeduction);
  const deductions = template.filter((field) => field.isDeduction);

  // Get the latest payroll data
  const getLatestPayroll = () => {
    if (!staff.payrolls.length) return null;
    return staff.payrolls.reduce((latest, current) => {
      return new Date(current.created_at) > new Date(latest.created_at) ? current : latest;
    });
  };

  const latestPayroll = getLatestPayroll();


  // Set initial values from the latest payroll
  useEffect(() => {
    // const latestPayroll = getLatestPayroll();
    if (latestPayroll?.data) {
      const payrollData = latestPayroll.data as unknown as PayrollTemplateField[];
      payrollData.forEach((field) => {
        setValue(field.name, field.amount);
      });
    }
  }, [staff.payrolls, setValue, latestPayroll?.data]);

  const calculateTotals = () => {
    
    const grossPay = additions.reduce((acc, item) => acc + (watch(`${latestPayroll?.id}_${item.name}`) || 0), 0);
    const totalDeductions = deductions.reduce((acc, item) => acc + (watch(`${latestPayroll?.id}_${item.name}`) || 0), 0);;
    return {
      grossPay,
      totalDeductions,
      netPay: grossPay - totalDeductions,
    };
  };

  const { grossPay, totalDeductions, netPay } = calculateTotals();

  const handleFormSubmit = async (data: PayrollFormData) => {
    try {
      await onSubmit(data);
      toast({
        title: "Success",
        description: "Payroll template updated successfully",
      });
      reset();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to update payroll template ${error}`,
        variant: "destructive",
      });
    } finally {
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Payroll Template - {staff.user.first_name} {staff.user.last_name}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Additions</h3>
              {additions.map((field) => (
                <div key={field.name} className="space-y-2">
                  <Label htmlFor={field.name}>{field.name}</Label>
                  <Input
                    id={field.name}
                    type="number"
                    step="0.01"
                    {...register(`${latestPayroll?.id}_${field.name}`, {
                      valueAsNumber: true,
                    })}
                    placeholder="0.00"
                  />
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold">Deductions</h3>
              {deductions.map((field) => (
                <div key={field.name} className="space-y-2">
                  <Label htmlFor={field.name}>{field.name}</Label>
                  <Input
                    id={field.name}
                    type="number"
                    step="0.01"
                    {...register(`${latestPayroll?.id}_${field.name}`, {
                      valueAsNumber: true,
                    })}
                    placeholder="0.00"
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2 border-t pt-4">
            <div className="flex justify-between">
              <span>Gross Pay:</span>
              <span>{formatAmountToNaira(grossPay.toFixed(2))}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Deductions:</span>
              <span>{formatAmountToNaira(totalDeductions.toFixed(2))}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Net Pay:</span>
              <span>{formatAmountToNaira(netPay.toFixed(2))}</span>
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Template"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

