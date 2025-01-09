"use client";

import { PayrollItem } from "@/app/server/module/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Payroll, StaffProfile, User } from "@prisma/client";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ModernPayslipProps {
  payroll: Payroll & {
    staff: StaffProfile & { user: User };
    approved_by: User | null;
  }
}

export default function ModernPayslip({ payroll }: ModernPayslipProps) {
  const [earnings, setEarnings] = useState<PayrollItem[]>([]);
  const [deductions, setDeductions] = useState<PayrollItem[]>([]);
  const [netPay, setNetPay] = useState(0);

  useEffect(() => {
    if (payroll?.data) {
      const payrollItems = payroll.data as unknown as PayrollItem[];
      const earningsArray = payrollItems.filter((item) => !item.isDeduction);
      const deductionsArray = payrollItems.filter((item) => item.isDeduction);

      const earningsTotal = earningsArray.reduce((sum, item) => sum + item.amount, 0);
      const deductionsTotal = deductionsArray.reduce((sum, item) => sum + item.amount, 0);
      const grossPay = earningsTotal - deductionsTotal;

      setEarnings(earningsArray);
      setDeductions(deductionsArray);
      setNetPay(grossPay);

    }
  }, [payroll]);

  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" className="text-left px-2 bg-emerald-600 text-white hover:text-white hover:bg-emerald-600" > View Payslip</Button>
        </DialogTrigger>
        <DialogContent className="w-full overflow-scroll h-full">
          <DialogHeader>
            <DialogTitle>View Payslip</DialogTitle>
          </DialogHeader>
          <Card className="w-full max-w-3xl mx-auto bg-white shadow-lg print:shadow-none">
            <CardHeader className="space-y-4 print:space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Payslip</h2>
                  <p className="text-sm text-muted-foreground">
                    For the month of {format(new Date(payroll?.month), "MMMM yyyy")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{`${payroll.staff.user.first_name} ${payroll.staff.user.last_name}`}</p>
                  <p className="text-sm text-muted-foreground">Employee ID: {payroll.staff.id}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Employee Details Section */}
              <div>
                <h3 className="font-semibold mb-3">Employee Details</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p><span className="font-medium">Position:</span> {payroll.staff.position || "N/A"}</p>
                    <p><span className="font-medium">Department:</span> {payroll.staff.department || "N/A"}</p>
                    <p><span className="font-medium">Join Date:</span> {payroll.staff.joined_at ? format(new Date(payroll.staff.joined_at), "dd/MM/yyyy") : "N/A"}</p>
                  </div>
                  <div>
                    <p><span className="font-medium">Email:</span> {payroll.staff.user.email || "N/A"}</p>
                    <p><span className="font-medium">Phone:</span> {payroll.staff.user.phone_number || "N/A"}</p>
                    <p><span className="font-medium">TIN:</span> {payroll.staff.tin || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Earnings Section */}
              {earnings.map((earning, index) => (
                <div key={index}>
                  <h4 className="font-semibold mb-3 uppercase text-sm">{earning.name}</h4>
                  <div className="flex justify-between text-sm">
                    <span>{earning.description}</span>
                    <span>₦{earning.amount.toLocaleString()}</span>
                  </div>

                </div>
              ))}

              {/* Deductions Section */}
              {deductions.map((deduction, index) => (
                <div key={index}>
                  <h4 className="font-semibold mb-3 uppercase text-sm">{deduction.name}</h4>
                  <div className="flex justify-between text-sm">
                    <span>{deduction.description}</span>
                    <span>₦{deduction.amount.toLocaleString()}</span>
                  </div>
                </div>
              ))}

              {/* Net Pay Section */}
              <div className="mt-6 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-lg">Net Pay</h3>
                    <p className="text-sm text-muted-foreground">Final amount after deductions</p>
                  </div>
                  <span className="text-2xl font-bold">₦ {netPay.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Details Section */}
              <div>
                <h3 className="font-semibold mb-3">Payment Details</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p><span className="font-medium">Bank Name:</span> {payroll.staff.bank_name || "N/A"}</p>
                  <p><span className="font-medium">Account Number:</span> {payroll.staff.bank_account_no || "N/A"}</p>
                </div>
              </div>

              {/* Footer Section */}
              <div className="mt-8 pt-4 border-t text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <div>
                    <p>Approved by: {`${payroll?.approved_by?.first_name} ${payroll?.approved_by?.last_name}`}</p>
                    <p>Date: {format(new Date(payroll.updated_at), "dd/MM/yyyy")}</p>
                  </div>
                  <div className="text-right">
                    <p>Generated on: {format(new Date(), "dd/MM/yyyy HH:mm")}</p>
                    <p>Reference: PS-{payroll.id.slice(0, 8)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    </div>
  );
}

