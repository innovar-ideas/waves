import { Prisma } from "@prisma/client";
import { Dispatch, SetStateAction } from "react";

export interface PayrollItem {
  name: string;
  amount: number;
  required: boolean;
  description: string;
  isDeduction: boolean;
}

export interface IPayrollData {
  name: string;
  amount: number;
  required: boolean;
  description: string;
  isDeduction: boolean;
}

export interface FormValues {
  [key: string]: number;
}

export type PayrollTemplateWithStaff = Prisma.PayrollTemplateGetPayload<{
  include: {
    staff: {
      include: {
        user: true;
      };
    };
  };
}>;

export type StaffWithPayrollTemplate = Prisma.StaffProfileGetPayload<{
  include: { payroll_template: true; user: true; payrolls: true };
}>;

export type StaffWithContractTemplate = Prisma.StaffProfileGetPayload<{
  include: { contracts: { include: { template: true } }; user: true; };
}>;

export type PayrollWithTemplate = Prisma.PayrollGetPayload<{
  include: {
    template: true;
    staff: {
      include: { user: true };
    };
  };
}>;

export type MonthlyPayrollGroup = {
  payrolls: PayrollWithTemplate[];
};

export type GroupedPayrollResponse = {
  month: Date;
  templateId: string;
  templateName: string;
  approved_status: string;
  approverNames: string;
  payrolls: MonthlyPayrollGroup[];
};

export interface Payroll {
  id: string;
  staff_id: string;
  month: Date;
  status: string;
  earningsTotal: number;
  deductionsTotal: number;
  grossPay: number;
  earnings: PayrollItem[];
  deductions: PayrollItem[];
}

export type PayrollWithStaffAndUser = Prisma.PayrollGetPayload<{
  include: {
    staff: {
      include: {
        user: true;
      };
    };
  };
}>;

export interface PayrollActionModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  payrollData: PayrollWithStaffAndUser[];
  action: "approve" | "disapprove" | "generate";
}

export interface SinglePayrollActionModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  payrollData: PayrollWithStaffAndUser;
  netpay: number;
  action: "approve" | "disapprove" | "generate";
  setSelectedId: Dispatch<SetStateAction<string[]>>
}

export interface MultiplePayrollActionModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  payrollData: PayrollWithStaffAndUser[];
  netpay: number[];
  action: "approve" | "disapprove" | "generate";
  setSelectedId: Dispatch<SetStateAction<string[]>>
}
