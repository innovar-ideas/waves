import React from "react";
import { LuWallet, LuSettings, LuUsers, LuLogIn, LuPieChart, LuArrowRightLeft, LuPaperclip, LuGroup, LuSun, LuCalendar, LuSpeaker, LuBell, LuHome, LuHeading, LuBookMarked, LuBook, LuAppWindow, LuCurrency } from "react-icons/lu";

export const PRIMARY_WALLET_NAME = "primary";

export const TRANSACTION_TYPES = {
  CREDIT: "credit",
  DEBIT: "debit",
};

export const TRANSACTION_CATEGORIES = {
  PURCHASE: "PURCHASE",
  BILLS: "BILLS",
};

export const TRANSACTION_DESCRIPTIONS = {
  BILLS: "Bills paid.",
};

export const ERROR_MESSAGES = {
  AUTH_ERROR: "Authentication failed.",
  AUTHORIZATION_ERROR: "Action not allowed.",
  UKNOWN_ERROR: "Something went wrong.",
  INPUT_VALIDATION_FAILED: "Input validation failed.",
  INVALID_CREDENTIALS: "Credentials are invalid, please try again.",
  INVALID_DENOMINATION: "Invalid voucher denomination.",
  WALLET_NOT_FOUND: "Wallet not found.",
  INSUFFICIENT_BALANCE: "Insufficient wallet balance.",
};

export const pages = {
  login: {
    title: "Login",
    pathname: "/",
    icon: <LuLogIn className='h-full w-full' />,
  },
  leave_application_settings: {
    title: "Leave Application Settings",
    pathname: "/leave-application-settings",
    icon: <LuSun className='h-full w-full' />,
  },
  manage_leave_application: {
    title: "Manage Leave Application",
    pathname: "/manage-leave-application",
    icon: <LuCalendar className='h-full w-full' />,
  },
  performance_review_template: {
    title: "Performance Review Template",
    pathname: "/performance-review-template",
    icon: <LuBookMarked className='h-full w-full' />,
  },
  performance_review: {
    title: "Performance Review",
    pathname: "/performance-review",
    icon: <LuBook className='h-full w-full' />,
  },
  bank: {
    title: "Bank",
    pathname: "/bank",
    icon: <LuCurrency className='h-full w-full' />,
  },
  wallet: {
    title: "Wallet",
    pathname: "/wallet",
    icon: <LuWallet className='h-full w-full' />,
  },
  settings: {
    title: "Settings",
    pathname: "/settings",
    icon: <LuSettings className='h-full w-full' />,
  },
  loan_settings: {
    title: "Loan Setting",
    pathname: "/loan-settings",
    icon: <LuArrowRightLeft className='h-full w-full' />,
  },
  transactions: {
    title: "Transactions",
    pathname: "/transactions",
    icon: <LuArrowRightLeft className='h-full w-full' />,
  },
  leave: {
    title: "Leave",
    pathname: "/leave",
    icon: <LuCalendar className='h-full w-full' />,
  },
  admin_dashboard: {
    title: "Dashboard",
    pathname: "/admin/dashboard",
    icon: <LuPieChart className='h-full w-full' />,
  },
  super_admin_dashboard: {
    title: "Dashboard",
    pathname: "/super-admin/dashboard",
    icon: <LuPieChart className='h-full w-full' />,
  },
  agents: {
    title: "Agents",
    pathname: "/agents",
    icon: <LuUsers className='h-full w-full' />,
  },
  users: {
    title: "Users",
    pathname: "/users",
    icon: <LuUsers className='h-full w-full' />,
  },
  policies_and_procedures: {
    title: "Policy and Procedures",
    pathname: "/pulicies-and-procedures",
    icon: <LuPaperclip className='h-full w-full' />,
  },
  staffs: {
    title: "Employee",
    pathname: "/staffs",
    icon: <LuUsers className='h-full w-full' />,
  },
  loan: {
    title: "Loan",
    pathname: "/loan",
    icon: <LuArrowRightLeft className='h-full w-full' />,
  },
  manage_loan: {
    title: "Manage Loan",
    pathname: "/manage-loan",
    icon: <LuArrowRightLeft className='h-full w-full' />,
  },
  payrolls: {
    title: "Payroll",
    pathname: "/payroll",
    icon: <LuUsers className='h-full w-full' />,
  },
  manage_loan_application: {
    title: "Manage Loan Application",
    pathname: "/manage-loan",
    icon: <LuArrowRightLeft className='h-full w-full' />,
  },
  admin_transactions: {
    title: "Transactions",
    pathname: "/admin/transactions",
    icon: <LuArrowRightLeft className='h-full w-full' />,
  },
  contracts: {
    title: "Contracts",
    pathname: "/contract",
    icon: <LuPaperclip className='h-full w-full' />,
  },
  admin_notification: {
    title: "Notification",
    pathname: "/admin-notification",
    icon: <LuBell className='h-full w-full' />,
  },
  teams: {
    title: "Teams",
    pathname: "/team",
    icon: <LuGroup className='h-full w-full' />,
  },
  designation: {
    title: "Designation",
    pathname: "/designation",
    icon: <LuPaperclip className='h-full w-full' />,
  },
  communication: {
    title: "Communication",
    pathname: "/communication",
    icon: <LuSpeaker className='h-full w-full' />,
  },
  loan_repayment: {
    title: "Loan Repayment",
    pathname: "/loan-repayment",
    icon: <LuSpeaker className='h-full w-full' />,
  },
  user_contract: {
    title: "User Contract",
    pathname: "/user-contract",
    icon: <LuAppWindow className='h-full w-full' />,
  },
  profile: {
    title: "Profile",
    pathname: "/profile",
    icon: <LuArrowRightLeft className='h-full w-full' />,
  },
  payslip: {
    title: "Payslip",
    pathname: "/payroll/payslip",
    icon: <LuArrowRightLeft className='h-full w-full' />,
  },
  organization: {
    title: "Organization",
    pathname: "/organization",
    icon: <LuHome className='h-full w-full' />,
  },
  admins: {
    title: "Admins",
    pathname: "/admins",
    icon: <LuHeading className='h-full w-full' />,
  },
} as const;

export const pageRoleMapping = {
  default: [pages.wallet, pages.transactions, pages.agents, pages.settings, pages.loan, pages.admin_notification],
  admin: [pages.admin_dashboard, pages.users, pages.staffs, pages.bank, pages.contracts, pages.payrolls, pages.teams, pages.designation, pages.leave_application_settings, pages.manage_leave_application, pages.loan_settings, pages.manage_loan, pages.loan_repayment, pages.performance_review_template, pages.performance_review, pages.policies_and_procedures, pages.admin_notification, pages.communication, pages.settings],
  employee: [pages.profile, pages.loan, pages.leave, pages.user_contract, pages.payslip, pages.communication, pages.settings, pages.admin_notification],
  finance: [pages.profile, pages.loan, pages.leave, pages.user_contract, pages.payslip, pages.communication, pages.settings, pages.admin_notification],
  super_admin: [pages.super_admin_dashboard, pages.organization, pages.admins, pages.settings]
};

export type PageName = keyof typeof pages;
export type Page = (typeof pages)[PageName];
export type PageRole = keyof typeof pageRoleMapping;

export const userRoleNames = {
  super_admin: "super_admin",
  admin: "admin",
  default: "default",
  supervisor: "supervisor",
  employee: "employee",
  finance: "finance",
  loan: "loan",
  leave: "leave",
  team: "team",
  designation: "designation",
  communication: "communication",
  payslip: "payslip",
  admins: "admins",
  performance: "performance",
  contract: "contract"
} as const;

export const APPROVE_STATUS = {
  APPROVED: "approved",
  NOT_APPROVED: "not_approved",
  PARTIALLY_APPROVED: "partially_approved",
};

export const EventTypes = {
  WORKSHOP: "Workshop",
  SEMINAR: "Seminar",
  CULTURAL_EVENT: "Cultural Event",
  BIRTHDAY: "Birthday",
} as const;
