import { z } from "zod";

export const createUserSchema = z.object({
  id: z.string().optional(),
  email: z.string().optional(),
  first_name: z.string().optional(),
  phone_number: z.string().optional(),
  last_name: z.string().optional(),
  password: z.string().optional(),

});

export const createStaffSchema = z.object({
  id: z.string().optional(),
  user_id: z.string().optional(),
  role_id: z.string().optional(),
  email: z.string().optional(),
  first_name: z.string().optional(),
  phone_number: z.string().optional(),
  last_name: z.string().optional(),
  password: z.string().optional(),
  user_role: z.string().optional(),
  tin: z.string().optional(),
  nin: z.string().optional(),
  bank_account_no: z.string().optional(),
  bank_name: z.string().optional(),
  passport_number: z.string().optional(),
  passport_expiry_date: z.coerce.date().optional(),
  marital_status: z.string().optional(),
  date_of_birth: z.coerce.date().optional(),
  profile_picture_url: z.string().optional(),
  documents_url: z.string().optional(),
  position: z.string().optional(),
  skill: z.string().optional(),
  department: z.string().optional(),
  joined_at: z.coerce.date().optional(),
  salary_basis: z.string().optional(),
  amount_per_month: z.coerce.number().optional(),
  effective_date: z.coerce.date().optional(),
  payment_type: z.string().optional(),
  staff_role_id: z.string().optional()

});

export const createTeamSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  parent_id: z.string().optional(),
  organization_id: z.string().optional(),
});

export const createDesignationSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  quantity: z.coerce.number().optional(),
  description: z.string().optional(),
  team_job_description: z.string().optional(),
  team_id: z.string().optional(),
  organization_id: z.string().optional(),
});

export const designationUserSchema = z.object({
  team_designation_id: z.string(),
  staff_id: z.string(),
});

export const staffRoleSchema = z.object({
  id: z.string().optional(),
  description: z.string().optional(),

});

export const createWorkHistorySchema = z.object({
  id: z.string().optional(),
  job_title: z.string().optional(),
  company_industry: z.string().optional(),
  company_name: z.string().optional(),
  responsibilities: z.string().optional(),
  start_date: z.coerce.date().optional(),
  end_date: z.coerce.date().optional()

});

export const staffByIdSchema = z.object({
  id: z.string(),

});

export const findByIdSchema = z.object({
  id: z.string(),
});

export const getAllStaffByOrganizationSlugSchema = z.object({ slug: z.string() });

export const assignPayrollTemplateSchema = z.object({
  templateId: z.string(),
  organization_id: z.string().optional(),
  staffIds: z.string().array().optional(),
});

export type AssignPayrollTemplateSchema = z.infer<typeof assignPayrollTemplateSchema>;

export const updatePayrollTemplateSchema = z.object({
  id: z.string().optional(),
  organization_id: z.string().optional(),
  name: z.string().optional(),
  data: z.unknown(),
});

export const createPayrollTemplateSchema = z.object({
  id: z.string().optional(),
  organization_id: z.string(),
  name: z.string(),
  data: z.unknown(),
});

const payrollItemSchema = z.object({
  name: z.string(),
  amount: z.number(),
  required: z.boolean(),
  description: z.string(),
  isDeduction: z.boolean(),
});

const staffPayrollDataSchema = z.object({
  staffId: z.string(),
  templateId: z.string(),
  payrollData: z.array(payrollItemSchema),
});

export const createPayrollSchema = z.object({
  month: z.string().min(1, "Month is required"),
  staffPayrollData: z.array(staffPayrollDataSchema),
  slug: z.string(),
  status: z.string().optional().default("UNPROCESSED"),
});

export const createSinglePayrollSchema = z.object({
  month: z.string().min(1, "Month is required"),
  staffPayrollData: staffPayrollDataSchema,
  slug: z.string(),
  status: z.string().optional().default("UNPROCESSED"),
});

export const approvePayrollSchema = z.object({
  id: z.string(),
  organization_slug: z.string().optional(),
});

export const updatePayrollSchema = z.object({
  id: z.string(),
  employee_id: z.string().optional(),
  template_id: z.string().optional(),
  data: z.unknown(),
  status: z.string().optional(),
  slug: z.string(),
});

export const contractTemplateSchema = z.object({
  name: z.string().min(2, {
    message: "Template name must be at least 2 characters.",
  }),
  type: z.string({
    required_error: "Please select a contract type.",
  }),
  details: z.string().min(1, {
    message: "Template content is required.",
  }),
});

export const createLeaveSettingSchema = z.object({
  name: z.string(),
  type: z.string(),
  duration: z.number(),
  applicable_to: z.string(),
  slug: z.string(),
});

export const updateLeaveSettingSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  type: z.string().optional(),
  duration: z.number().optional(),
  applicable_to: z.string().optional(),
});

export const createLeaveApplicationSchema = z.object({
  user_id: z.string(),
  leave_setting_id: z.string(),
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  reason: z.string().optional(),
  organization_id: z.string().optional(),
});

export const updateLeaveApplicationSchema = z.object({
  id: z.string(),
  status: z.string().optional(),
  reviewed_by: z.string().optional(),
  reviewed_at: z.coerce.date().optional(),
  reason: z.string().optional(),
  organization_id: z.string().optional(),
  leave_setting_id: z.string().optional(),
  start_date: z.coerce.date().optional(),
  end_date: z.coerce.date().optional(),
});

export const deleteLeaveApplicationSchema = z.object({
  id: z.string(),
});
export const changeLeaveApplicationStatusSchema = z.object({
  id: z.string(),
  status: z.string(),
  reviewed_by: z.string().optional(),
  reviewed_at: z.coerce.date().optional(),
});
export type ChangeLeaveApplicationStatusSchema = z.infer<typeof changeLeaveApplicationStatusSchema>;
export type CreateLeaveSettingSchema = z.infer<typeof createLeaveSettingSchema>;
export type UpdateLeaveSettingSchema = z.infer<typeof updateLeaveSettingSchema>;
export type CreateLeaveApplicationSchema = z.infer<typeof createLeaveApplicationSchema>;
export type UpdateLeaveApplicationSchema = z.infer<typeof updateLeaveApplicationSchema>;
export type DeleteLeaveApplicationSchema = z.infer<typeof deleteLeaveApplicationSchema>;

export const createLoanSettingSchema = z.object({
  max_percentage: z.number(),
  max_repayment_months: z.number(),
  organization_id: z.string(),
});

export const updateLoanSettingSchema = z.object({
  id: z.string(),
  max_percentage: z.number().optional(),
  max_repayment_months: z.number().optional(),
  organization_id: z.string().optional(),
});
export const findByIdSchemaSchema = z.object({
  id: z.string(),
});
export const applyForLoanSchema = z.object({
  amount: z.number(),
  organization_id: z.string(),
  user_id: z.string(),
  reason: z.string().optional(),
  repayment_period: z.number(),
  monthly_deduction: z.number().optional(),
});

export const updateLoanApplicationSchema = z.object({
  id: z.string(),
  status: z.string().optional(),
  reviewed_by: z.string().optional(),
  reviewed_at: z.coerce.date().optional(),
  amount: z.number().optional(),
  repayment_period: z.number().optional(),
  monthly_deduction: z.number().optional(),
  reason: z.string().optional(),
  user_id: z.string().optional(),
  organization_id: z.string().optional()
});

export type CreateLoanSettingSchema = z.infer<typeof createLoanSettingSchema>;
export type UpdateLoanSettingSchema = z.infer<typeof updateLoanSettingSchema>;
export type FindByIdSchema = z.infer<typeof findByIdSchemaSchema>;
export type ApplyForLoanSchema = z.infer<typeof applyForLoanSchema>;
export type UpdateLoanApplicationSchema = z.infer<typeof updateLoanApplicationSchema>;

export const getEventsUsingFilterSchema = z.object({
  dateRange: z
    .object({
      from: z.date().nullable(),
      to: z.date().nullable(),
    })
    .optional(),
  type: z.string().optional(),
  pageSize: z.number().optional(),
  page: z.number().optional(),
  slug: z.string(),
});

export const organizationSlugSchema = z.object({ slug: z.string() });

export const eventDateRangeSchema = z.object({
  slug: z.string(),
  startDate: z.date(),
  endDate: z.date(),
});

export const eventSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  link: z.string().optional(),
  location: z.string().optional(),
  starts: z.date(),
  ends: z.date(),
  subject_id: z.string().optional(),
  slug: z.string(),
  session_id: z.string().optional(),
  type: z.string(),
  attendees_group_type: z.enum(["by-individuals", "by-team", "by-roles", "all-roles"]).optional(),
  repeat: z.enum(["NONE", "DAILY", "WEEKLY", "MONTHLY", "YEARLY"]),
  roles: z.string().array().optional(),
  students_ids: z.string().array().optional(),
  class_ids: z.string().array().optional(),
  staff_ids: z.string().array().optional(),
  parents_ids: z.string().array().optional(),
  all_day: z.boolean().optional(),
  save_to_calendar: z.boolean().optional(),
});

export const getEventsSchema = z.object({
  slug: z.string(),
  userId: z.string(),
  sessionId: z.string().optional(),
});

export const getGlobalSessionIdSchema = z.object({
  user_id: z.string(),
  organization_slug: z.string(),
  name: z.string(),
});

export type EventSchema = z.infer<typeof eventSchema>;
