"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Payroll, StaffProfile, User } from "@prisma/client";
import { format } from "date-fns";

interface PayrollItem {
  name: string;
  amount: number;
  required: boolean;
  description: string;
  isDeduction: boolean;
};

interface ModernPayslipProps {
  payroll: (Payroll & { staff: StaffProfile & { user: User }; approved_by: User | null })
}

export default function ViewStaffPayslip({ payroll }: ModernPayslipProps) {
  const earnings = (payroll.data as unknown as PayrollItem[]).filter(item => !item.isDeduction);
  const deductions = (payroll.data as unknown as PayrollItem[]).filter(item => item.isDeduction);
  const grossPay = earnings.reduce((sum, item) => sum + item.amount, 0);
  const totalDeductions = deductions.reduce((sum, item) => sum + item.amount, 0);
  const netPay = grossPay - totalDeductions;

  return (
    <Card className="w-full max-w-3xl mx-auto bg-white shadow-lg print:shadow-none">
      <CardHeader className="space-y-4 print:space-y-2">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Payslip</h2>
            <p className="text-sm text-muted-foreground">
              For the month of {format(new Date(payroll.month), "MMMM yyyy")}
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
              <p><span className="font-medium">Department:</span> {payroll.staff.department}</p>
              <p><span className="font-medium">Join Date:</span> {format(new Date(payroll.staff.joined_at!), "dd/MM/yyyy")}</p>
            </div>
            <div>
              <p><span className="font-medium">Email:</span> {payroll.staff.user.email}</p>
              <p><span className="font-medium">Phone:</span> {payroll.staff.user.phone_number}</p>
              <p><span className="font-medium">TIN:</span> {payroll.staff.tin}</p>
            </div>
          </div>
        </div>

        {/* Earnings Section */}
        <div>
          <h3 className="font-semibold mb-3">Earnings</h3>
          <div className="space-y-2">
            {earnings.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>{item.name}</span>
                <span>₦ {item.amount.toLocaleString()}</span>
              </div>
            ))}
            <Separator className="my-2" />
            <div className="flex justify-between font-medium">
              <span>Gross Pay</span>
              <span>₦ {grossPay.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Deductions Section */}
        <div>
          <h3 className="font-semibold mb-3">Deductions</h3>
          <div className="space-y-2">
            {deductions.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>{item.name}</span>
                <span>₦ {item.amount.toLocaleString()}</span>
              </div>
            ))}
            <Separator className="my-2" />
            <div className="flex justify-between font-medium">
              <span>Total Deductions</span>
              <span>₦ {totalDeductions.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Net Pay Section */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-lg">Net Pay</h3>
              <p className="text-sm text-muted-foreground">Final amount after deductions</p>
            </div>
            <span className="text-2xl font-bold">₦ {netPay.toLocaleString()}</span>
          </div>
        </div>

        {/* Payment Details Section */}
        <div>
          <h3 className="font-semibold mb-3">Payment Details</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <p><span className="font-medium">Bank Name:</span> {payroll.staff.bank_name}</p>
            <p><span className="font-medium">Account Number:</span> {payroll.staff.bank_account_no}</p>
          </div>
        </div>

        {/* Footer Section */}
        <div className="mt-8 pt-4 border-t text-sm text-muted-foreground">
          <div className="flex justify-between">
            <div>
              <p>Approved by: {`${payroll.approved_by?.first_name} ${payroll.approved_by?.last_name}`}</p>
              <p>Status: {payroll.approval_status}</p>
            </div>
            <div className="text-right">
              <p>Generated on: {format(new Date(), "dd/MM/yyyy HH:mm")}</p>
              <p>Reference: PS-{payroll.id.slice(0, 8)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

