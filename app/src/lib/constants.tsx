import React from "react";
import { LuWallet, LuSettings, LuUsers, LuLogIn, LuPieChart, LuArrowRightLeft, LuPaperclip } from "react-icons/lu";

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
  transactions: {
    title: "Transactions",
    pathname: "/transactions",
    icon: <LuArrowRightLeft className='h-full w-full' />,
  },
  admin_dashboard: {
    title: "Dashboard",
    pathname: "/admin/dashboard",
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
  staffs: {
    title: "Employee",
    pathname: "/staffs",
    icon: <LuUsers className='h-full w-full' />,
  },
  payrolls: {
    title: "Payroll",
    pathname: "/payroll",
    icon: <LuUsers className='h-full w-full' />,
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
  profile: {
    title: "Profile",
    pathname: "/profile",
    icon: <LuArrowRightLeft className='h-full w-full' />,
  },
} as const;

export const pageRoleMapping = {
  default: [pages.wallet, pages.transactions, pages.settings],
  admin: [pages.admin_dashboard, pages.agents, pages.users, pages.admin_transactions, pages.contracts, pages.staffs, pages.payrolls, pages.settings],
  employee: [pages.profile, pages.settings]
};

export type PageName = keyof typeof pages;
export type Page = (typeof pages)[PageName];
export type PageRole = keyof typeof pageRoleMapping;

export const userRoleNames = {
  admin: "admin",
  default: "default",
  supervisor: "supervisor",
  employee: "employee",
  finance: "finance",
} as const;

export const APPROVE_STATUS = {
  APPROVED: "approved",
  NOT_APPROVED: "not_approved",
  PARTIALLY_APPROVED: "partially_approved",
};
