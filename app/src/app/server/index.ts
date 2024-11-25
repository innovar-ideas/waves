import { assignStaffToContractTemplate, createContractTemplate, getAllContractTemplate, getAllContractTemplatesForOrganization } from "./module/contract-template";
import { approvePayroll, assignStaffToPayrollTemplate, createPayroll, createPayrollTemplate, createSinglePayroll, disapprovePayroll, generatePayroll, getAllPayrollsForOrganization, getAllPayrollsGroupedByMonth, getAllPayrollTemplatesForOrganization, getApprovedPayrollsByTemplateAndMonth, getEmployeePayrollByStaffId, getPayrollsByTemplateAndMonth, getPayrollTemplateById, getPreviousMonthPayrolls, getUnapprovedPayrollsByTemplateAndMonth, updatePayroll, updatePayrollTemplate } from "./module/payroll";
import { createStaff, getAllStaffs, getSingleStaffById, getStaffById, getStaffByUserId, getStaffWithContractTemplate, getStaffWithPayrollTemplate, updateStaff } from "./module/staff";
import { createStaffRole, getAllStaffRole } from "./module/staff-role";
import {
    createUser,
    getAllUsers,
    getUserById,
  } from "./module/user";
import { createWorkHistory, getAllWorkHistory } from "./module/work-history";
  import { publicProcedure, router } from "./trpc";
  
  export const appRouter = router({
    createUser,
    getAllUsers,
    getAllStaffs,
    getAllStaffRole,
    createStaff,
    createStaffRole,
    getStaffById,
    getStaffByUserId,
    getAllPayrollTemplatesForOrganization,
    getAllPayrollsGroupedByMonth,
    getStaffWithPayrollTemplate,
    assignStaffToPayrollTemplate,
    updatePayrollTemplate,
    createPayrollTemplate,
    getPreviousMonthPayrolls,
    getPayrollTemplateById,
    createPayroll,
    getAllPayrollsForOrganization,
    createSinglePayroll,
    getEmployeePayrollByStaffId,
    getUserById,
    approvePayroll,
    disapprovePayroll,
    generatePayroll,
    getPayrollsByTemplateAndMonth,
    updatePayroll,
    updateStaff,
    createWorkHistory,
    getAllWorkHistory,
    getApprovedPayrollsByTemplateAndMonth,
    getUnapprovedPayrollsByTemplateAndMonth,
    createContractTemplate,
    getAllContractTemplate,
    getStaffWithContractTemplate,
    assignStaffToContractTemplate,
    getAllContractTemplatesForOrganization,
    getSingleStaffById,

    healthCheck: publicProcedure.query(() => {
      return { message: "API up and running..." };
    }),
  });
  
  export type AppRouter = typeof appRouter;
  