import { assignStaffToContractTemplate, createContractTemplate, getAllContractTemplate, getAllContractTemplatesForOrganization } from "./module/contract-template";
import { createDesignation, designateStaff, getAllDesignation, getAllTeamDesignation } from "./module/designation";
import { approvePayroll, assignStaffToPayrollTemplate, createPayroll, createPayrollTemplate, createSinglePayroll, disapprovePayroll, generatePayroll, getAllPayrollsForOrganization, getAllPayrollsGroupedByMonth, getAllPayrollTemplatesForOrganization, getApprovedPayrollsByTemplateAndMonth, getEmployeePayrollByStaffId, getPayrollsByTemplateAndMonth, getPayrollsGroupedByMonthForStaff, getPayrollTemplateById, getPreviousMonthPayrolls, getUnapprovedPayrollsByTemplateAndMonth, getUserPayrollByTemplateAndMonth, updatePayroll, updatePayrollTemplate } from "./module/payroll";
<<<<<<< HEAD
import { createStaff, getAllStaffs, getAllStaffsWithoutRoles, getSingleStaffById, getStaffById, getStaffByUserId, getStaffsByOrganizationId, getStaffWithContractTemplate, getStaffWithPayrollTemplate, updateStaff, createStaffBulkUpload } from "./module/staff";
=======
import { createStaff, getAllStaffs, getAllStaffsWithoutRoles, getSingleStaffById, getStaffById, getStaffByUserId, getStaffsByOrganizationId, getStaffWithContractTemplate, getStaffWithPayrollTemplate, updateStaff, createExternalStaffBulkUpload } from "./module/staff";
>>>>>>> 2227e22 (completed not sure completion)
import { createStaffRole, getAllStaffRole } from "./module/staff-role";
import { createTeam, getAllParentTeams, getAllTeamMember, getAllTeams, getSingleTeamById, getTeamDesignationsByTeamId, getTeamsByOrganizationId, getUniqueTeamsFromTeamDesignationsByOrganizationId } from "./module/team";
import {
  createUser,
  getAllUsers,
  getUserById,
} from "./module/user";
import { deleteNotification, markNotificationAsRead, getAllNotificationByUserId, getNotificationById } from "./module/notification";
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
  getLoanApplicationById,
  disburseLoan
} from "./module/loan";
import { publicProcedure, router } from "./trpc";
import { createEvent, deleteEvent, getAllBirthdayEventsForOrganizationBySlug, getAllEventOfAnOrganization, getAllEventsForCalenderByOrgSlug, getAllEventsForOrganizationBySlug, getAllEventsGroupedByMonth, getEvents, getEventsByDateRange, updateEvent } from "./module/event";
import {
  createBroadcast, createChat, createComplaint, createFeedback, getActiveUsers, getChatMessages, getComplaintChats, getDraftChatById, getDraftCount,
  getDraftMessages, getFeedbackChats, getGroupChatMessages, getGroupChats, getParentComplaintAndFeedbackMessages, getRecipients, getSentMessages, getTrashedMessages, getUnreadMessageCount, getUserChats, markComplaintAsClosed, markFeedbackAsResolved, markMessagesAsRead, saveBroadcastDraft, sendDraft, sendMessage, updateDraft
} from "./module/communication";
import {
  createPerformanceReviewTemplate, createPerformanceForStaffReview,
  getAllAssignedPerformanceReviewTemplateToTeam, deletePerformanceReviewTemplate,
  getAllPerformanceReviewTemplateByOrganizationSlug, updatePerformanceReviewTemplate,
  deletePerformanceReview, updatePerformanceReview, getAllPerformanceReviewByOrganizationSlug,
  assignPerformanceReviewTemplateToTeam, getPerformanceReviewAssignedById, findPerformanceReviewByStaffId
} from "./module/performance-review";
import { createLoanRepayment, getAllLoanRepayment, getGroupedLoanRepayments } from "./module/loan-repayment";
import { createOrganization, getAllOrganization } from "./module/organization";
import { createAdmin, getAllAdmins } from "./module/admins";
import { generateUserToken, verifyToken } from "./module/generate-token";
import { approvePolicyAndProcedure, createPolicyAndProcedure, deletePolicyAndProcedure, getAllPolicyAndProcedureByOrganization, getPolicyAndProcedureById, updatePolicyAndProcedure } from "./module/policy_procedures";

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
  getNotificationById,
  deleteNotification,
  markNotificationAsRead,
  getUnreadMessageCount,
  getDraftCount,
  getUserChats,
  markMessagesAsRead,
  getActiveUsers,
  createChat,
  getChatMessages,
  sendMessage,
  getDraftMessages,
  getRecipients,
  getDraftChatById,
  updateDraft,
  sendDraft,
  getGroupChats,
  getGroupChatMessages,
  getSentMessages,
  getTrashedMessages,
  getFeedbackChats,
  createFeedback,
  getComplaintChats,
  getParentComplaintAndFeedbackMessages,
  markComplaintAsClosed,
  createComplaint,
  createBroadcast,
  saveBroadcastDraft,
  markFeedbackAsResolved,
  createPerformanceReviewTemplate,
  getAllPerformanceReviewTemplateByOrganizationSlug,
  updatePerformanceReviewTemplate,
  deletePerformanceReviewTemplate,
  deletePerformanceReview,
  updatePerformanceReview,
  assignPerformanceReviewTemplateToTeam,
  getAllPerformanceReviewByOrganizationSlug,
  getAllAssignedPerformanceReviewTemplateToTeam,
  getPerformanceReviewAssignedById,
  createPerformanceForStaffReview,
  findPerformanceReviewByStaffId,
  getUniqueTeamsFromTeamDesignationsByOrganizationId,
  getTeamDesignationsByTeamId,
  createLoanRepayment,
  disburseLoan,
  getAllLoanRepayment,
  getGroupedLoanRepayments,
  getPayrollsGroupedByMonthForStaff,
  getUserPayrollByTemplateAndMonth,
<<<<<<< HEAD
  createStaffBulkUpload,
  createOrganization,
  getAllOrganization,
  createAdmin,
  getAllAdmins,
  generateUserToken,
  verifyToken,
  getPolicyAndProcedureById,
  approvePolicyAndProcedure,
  updatePolicyAndProcedure,
  getAllPolicyAndProcedureByOrganization,
  createPolicyAndProcedure,
  deletePolicyAndProcedure,

=======
  createExternalStaffBulkUpload,
>>>>>>> 2227e22 (completed not sure completion)
  healthCheck: publicProcedure.query(() => {
    return { message: "API up and running..." };
  }),
});

export type AppRouter = typeof appRouter;
