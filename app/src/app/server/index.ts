import { assignStaffToContractTemplate, createContractTemplate, getAllContractTemplate, getAllContractTemplatesForOrganization } from "./module/contract-template";
import { createDesignation, designateStaff, getAllDesignation, getAllTeamDesignation } from "./module/designation";
import { approvePayroll, assignStaffToPayrollTemplate, createPayroll, createPayrollTemplate, createSinglePayroll, disapprovePayroll, generatePayroll, getAllPayrollsForOrganization, getAllPayrollsGroupedByMonth, getAllPayrollTemplatesForOrganization, getApprovedPayrollsByTemplateAndMonth, getEmployeePayrollByStaffId, getPayrollsByTemplateAndMonth, getPayrollTemplateById, getPreviousMonthPayrolls, getUnapprovedPayrollsByTemplateAndMonth, updatePayroll, updatePayrollTemplate } from "./module/payroll";
import { createStaff, getAllStaffs, getAllStaffsWithoutRoles, getSingleStaffById, getStaffById, getStaffByUserId, getStaffsByOrganizationId, getStaffWithContractTemplate, getStaffWithPayrollTemplate, updateStaff } from "./module/staff";
import { createStaffRole, getAllStaffRole } from "./module/staff-role";
import { createTeam, getAllParentTeams, getAllTeamMember, getAllTeams, getSingleTeamById, getTeamsByOrganizationId } from "./module/team";
import {
  createUser,
  getAllUsers,
  getUserById,
} from "./module/user";
import { deleteNotification, markNotificationAsRead, getAllNotificationByUserId } from "./module/notification";
import { createLeaveSetting, getAllLeaveSetting, updateLeaveSetting, deleteLeaveSetting } from "./module/leave";
import { createWorkHistory, getAllWorkHistory } from "./module/work-history";
import {
  createLeaveApplication, getAllLeaveApplication, updateLeaveApplication,
  deleteLeaveApplication, getAllPendingLeaveApplicationByOrganization,
  getAllLeaveApplicationByOrganization, getAllApprovedLeaveApplicationByOrganization, getAllRejectedLeaveApplicationByOrganization, getLeaveApplicationById, changeLeaveApplicationStatus
} from "./module/leave";
import {
  createLoanSetting, deleteLoanSetting, updateLoanSetting, getLoanSettingById,
  getAllLoanSettingByOrganizationSlug, applyForLoan,
  getLoanSettingByOrganizationSlug, updateLoanApplication, deleteLoanApplication,
  getAllLoanApplicationByUserId, getAllLoanApplicationByOrganizationSlug, changeLoanApplicationStatus,
  getAllPendingLoanApplicationByOrganizationSlug, getAllApprovedLoanApplicationByOrganizationSlug, getAllRejectedLoanApplicationByOrganizationSlug,
  getLoanApplicationById
} from "./module/loan";
import { publicProcedure, router } from "./trpc";
import { createEvent, deleteEvent, getAllBirthdayEventsForOrganizationBySlug, getAllEventOfAnOrganization, getAllEventsForCalenderByOrgSlug, getAllEventsForOrganizationBySlug, getAllEventsGroupedByMonth, getEvents, getEventsByDateRange, updateEvent } from "./module/event";

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
  createTeam,
  getAllTeams,
  getAllParentTeams,
  createDesignation,
  getAllDesignation,
  getSingleTeamById,
  getAllTeamDesignation,
  designateStaff,
  getAllTeamMember,
  getAllStaffsWithoutRoles,
  createLeaveSetting,
  getAllLeaveSetting,
  updateLeaveSetting,
  deleteLeaveSetting,
  createLeaveApplication,
  getAllLeaveApplication,
  updateLeaveApplication,
  deleteLeaveApplication,
  getAllPendingLeaveApplicationByOrganization,
  getAllLeaveApplicationByOrganization,
  getAllApprovedLeaveApplicationByOrganization,
  getAllRejectedLeaveApplicationByOrganization,
  getLeaveApplicationById,
  changeLeaveApplicationStatus,
  createLoanSetting,
  updateLoanSetting,
  deleteLoanSetting,
  getLoanSettingById,
  getAllLoanSettingByOrganizationSlug,
  applyForLoan,
  updateLoanApplication,
  getAllLoanApplicationByUserId,
  getAllLoanApplicationByOrganizationSlug,
  changeLoanApplicationStatus,
  deleteLoanApplication,
  getLoanSettingByOrganizationSlug,
  getAllPendingLoanApplicationByOrganizationSlug,
  getAllApprovedLoanApplicationByOrganizationSlug,
  getAllRejectedLoanApplicationByOrganizationSlug,
  getLoanApplicationById,
  getAllEventOfAnOrganization,
  getAllEventsForOrganizationBySlug,
  getEventsByDateRange,
  createEvent,
  updateEvent,
  deleteEvent,
  getEvents,
  getAllEventsGroupedByMonth,
  getAllBirthdayEventsForOrganizationBySlug,
  getAllEventsForCalenderByOrgSlug,
  getTeamsByOrganizationId,
  getStaffsByOrganizationId,
  getAllNotificationByUserId,
  deleteNotification,
  markNotificationAsRead,
  healthCheck: publicProcedure.query(() => {
    return { message: "API up and running..." };
  }),
});

export type AppRouter = typeof appRouter;
