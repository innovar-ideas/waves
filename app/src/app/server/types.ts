import { Payroll, PayrollTemplate, Prisma, StaffTask, Task, User } from "@prisma/client";
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

export interface StaffWithPayroll {
  id: string;
  user: User;
  payroll_template: PayrollTemplate | null;
  payrolls: Payroll[];
}

export interface PayrollTemplateField {
  name: string;
  amount: number;
  isDeduction: boolean;
  required: boolean;
  description?: string;
}

export interface PayrollFormData {
  [key: string]: number;
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

export interface IPayroll {
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

export interface DocumentMetadata {
  document_name: string
  file: string // URL of the uploaded file
  expiry_date?: Date | null // ISO string date
}

export interface StaffDocumentState {
  documentType: string
  file: File | null
  expiryDate: Date | null
  isUploading: boolean
  fileUrl: string | null
}

export interface StaffDocumentSubmission {
  documents_url: DocumentMetadata[]
  staffId: string
}

export interface TaskTable {
  id: string;
  task: Task;
  task_repeat_time_table?: TaskTimeTable;
  created_by_user?: User;
  staff_tasks?: StaffTask[];
}

export type TaskTimeTable = {
  type?: string; //daily, weekly, monthly, yearly
  daily?: TaskDailyTimeTable;
  weekly?: TaskWeeklyTimeTable;
  monthly?: TaskMonthlyTimeTable;
  yearly?: TaskYearlyTimeTable;
};

export type TaskDailyTimeTable = {
  day?: string; //day of the week
  start_time?: Date;
  end_time?: Date;
};

export type TaskWeeklyTimeTable = {
  start_day?: string;
  end_day?: string;
};

export type TaskMonthlyTimeTable = {
  start_date?: Date;
  end_date?: Date;
};

export type TaskYearlyTimeTable = {
  month?: number; //month of the year
  start_date?: Date;
  end_date?: Date;
};

export type TaskInstructions = {
  instruction_type?: string; 
  instruction_content?: string;
  form?: TaskForm[];
};

export type TaskForm = {
  form_type?: string;
  form_content?: string;
  form_options?: string[];
  form_value?: string;
  form_description?: string;
};

export type StaffTaskResponseType = {
  response_type?: string;
  instructions_text_response?: string;
  staff_task_repeat_time_table?: StaffTaskRepeatTimeTable;
  form_data?: TaskForm[];
};

export type StaffTaskRepeatTimeTable = {
  type?: string;
  daily?: TaskDailyTimeTable;
  weekly?: TaskWeeklyTimeTable;
  monthly?: TaskMonthlyTimeTable;
  yearly?: TaskYearlyTimeTable;
};

export type StaffTaskColumnTable = {
  task?: Task;
  user?: User;
  staff_task?: StaffTask;
  created_by_user?: User;
  status?: string;
  instructions?: TaskInstructions;
  task_repeat_time_table?: StaffTaskRepeatTimeTable;
  created_at?: Date;
  is_completed?: boolean;
};
