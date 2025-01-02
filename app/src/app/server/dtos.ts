import { z } from "zod";

export const createUserSchema = z.object({
  id: z.string().optional(),
  email: z.string().optional(),
  first_name: z.string().optional(),
  phone_number: z.string().optional(),
  last_name: z.string().optional(),
  password: z.string().optional(),

});


export const updateDesignationSchema = z.object({
  id: z.string(), 
  designation_id: z.string().optional(),
  name: z.string().optional(),
  team_id: z.string().optional(),
  role_level: z.number().optional(), 
  quantity: z.number().optional(), 
  description: z.string().optional(),
  job_description: z.string().optional(),
 
});
export type DeleteLeaveApplicationSchema = z.infer<typeof deleteLeaveApplicationSchema>;
export  type UpdateDesignationSchema = z.infer<typeof updateDesignationSchema>;

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
  team_designation_id: z.string().optional(),
  documents_url: z.string().optional(),
  position: z.string().optional(),
  skill: z.string().optional(),
  department: z.string().optional(),
  joined_at: z.coerce.date().optional(),
  salary_basis: z.string().optional(),
  amount_per_month: z.coerce.number().optional(),
  // effective_date: z.coerce.date().optional(),
  payment_type: z.string().optional(),
  staff_role_id: z.string().optional(),
  organization_id: z.string().optional()

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
  role_level: z.number().min(1).max(10).optional(),
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
  netpay: z.number().optional(),
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
  organization_id: z.string(),
  sign_before: z.number().optional(),
  contract_duration: z.number().optional()
});

export const createLeaveSettingSchema = z.object({
  name: z.string(),
  type: z.string(),
  duration: z.number(),
  applicable_to: z.string(),
  slug: z.string(),
  role_level: z.number().min(1).max(10).optional(),
});

export const updateLeaveSettingSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  type: z.string().optional(),
  duration: z.number().optional(),
  applicable_to: z.string().optional(),
  role_level: z.number().min(1).max(10).optional(),
});

export const createLeaveApplicationSchema = z.object({
  user_id: z.string(),
  leave_setting_id: z.string(),
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  reason: z.string().optional(),
  organization_id: z.string().optional(),
  sender_id: z.string().optional()
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
  sender_id: z.string().optional()
});

export const deleteLeaveApplicationSchema = z.object({
  id: z.string(),
});
export const changeLeaveApplicationStatusSchema = z.object({
  id: z.string(),
  status: z.string(),
  reviewed_by: z.string().optional(),
  reviewed_at: z.coerce.date().optional(),
  sender_id: z.string().optional()
});
export type ChangeLeaveApplicationStatusSchema = z.infer<typeof changeLeaveApplicationStatusSchema>;
export type CreateLeaveSettingSchema = z.infer<typeof createLeaveSettingSchema>;
export type UpdateLeaveSettingSchema = z.infer<typeof updateLeaveSettingSchema>;
export type CreateLeaveApplicationSchema = z.infer<typeof createLeaveApplicationSchema>;
export type UpdateLeaveApplicationSchema = z.infer<typeof updateLeaveApplicationSchema>;


export const createLoanSettingSchema = z.object({
  max_percentage: z.number(),
  max_repayment_months: z.number(),
  number_of_times: z.number().optional(),
  organization_id: z.string(),
});

export const updateLoanSettingSchema = z.object({
  id: z.string(),
  max_percentage: z.number().optional(),
  max_repayment_months: z.number().optional(),
  number_of_times: z.number().optional(),
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
  organization_id: z.string().optional(),
  sender_id: z.string().optional()
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

export const createPolicyAndProcedureSchema = z.object({
  title: z.string(),
  content: z.string(),
  organization_id: z.string(),
  team_id: z.string().optional(),
  created_by: z.string(),
  year_validity_duration: z.number().optional(),
});

export const updatePolicyAndProcedureSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  content: z.string().optional(),
  team_id: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
  is_approved: z.boolean().optional(),
  approved_by: z.string().optional(),
  year_validity_duration: z.number().optional(),

});

export type CreatePolicyAndProcedureSchema = z.infer<typeof createPolicyAndProcedureSchema>;
export type UpdatePolicyAndProcedureSchema = z.infer<typeof updatePolicyAndProcedureSchema>;

export const createPerformanceReviewTemplateSchema = z.object({
  organization_id: z.string(),
  name: z.string(),
  type: z.enum(["monthly", "quarterly", "annual", "bi-annual"]),
  created_by_id: z.string(),
  role_level: z.number().min(1).max(10).optional(),
  metrics: z.object({
    column_name: z.string().optional(),
    column_description: z.string().optional(),
    column_type: z.enum(["text", "number", "date", "link", "boolean", "select", "multi-select", "other"]).optional(),
  }).array().optional(),

});

export const updatePerformanceReviewTemplateSchema = z.object({
  id: z.string(),
  organization_id: z.string(),
  role_level: z.number().min(1).max(10).optional(),
  name: z.string().optional(),
  type: z.enum(["monthly", "quarterly", "annual", "bi-annual"]).optional(),
  metrics: z.object({
    column_name: z.string().optional(),
    column_description: z.string().optional(),
    column_type: z.enum(["text", "number", "date", "link", "boolean", "select", "multi-select", "other"]).optional(),
  }).array().optional(),
  created_by_id: z.string().optional(),
});

export const assignPerformanceReviewTemplateToTeamSchema = z.object({
  template_id: z.string(),
  team_id: z.string().optional(),
  role_level: z.number().min(0).max(10).optional(),
  role_level_max: z.number().min(0).max(10).optional(),
  role_level_min: z.number().min(0).max(10).optional(),
  organization_id: z.string(),
});

export const updatePerformanceReviewSchema = z.object({
  id: z.string(),
  feedback: z.object({
    column_name: z.string().optional(),
    column_value: z.string().optional(),
  }).array().optional(),
  score: z.number().optional(),
  completed_at: z.coerce.date().optional(),
  reviewer_id: z.string().optional(),
});

export const createPerformanceForStaffReviewSchema = z.object({
  team_id: z.string().optional(),
  staff_id: z.string(),
  reviewer_id: z.string(),
  organization_id: z.string(),
  created_by_id: z.string(),
  template_id: z.string(),
  feedback: z.object({
    column_name: z.string(),
    column_type: z.enum(["text", "number", "date", "link", "boolean", "select", "multi-select", "other"]),
    column_value: z.string(),
  }).array(),
});



export type CreatePerformanceReviewTemplateSchema = z.infer<typeof createPerformanceReviewTemplateSchema>;
export type UpdatePerformanceReviewTemplateSchema = z.infer<typeof updatePerformanceReviewTemplateSchema>;
export type AssignPerformanceReviewTemplateToTeamSchema = z.infer<typeof assignPerformanceReviewTemplateToTeamSchema>;

export const createLoanRepaymentSchema = z.object({
  loanId: z.string(),
  amountPaid: z.number().positive(), // Amount being repaid
  paymentMethod: z.string(), // e.g., "deduction", "transfer", "in-person"
  remarks: z.string().optional(), // Optional notes
  organization_id: z.string(),
});



export const StaffBulkUploadSchema = z.object({
  list_of_staff: z.array(z.object({
    email: z.string().optional(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    phone_number: z.string().optional(),
    password: z.string().optional(),
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
  })),
  organization_id: z.string(),
});

export const externalStaffBulkUploadSchema = z.object({
  list_of_staff: z.array(z.object({
    email: z.string().optional(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    phone_number: z.string().optional(),
    password: z.string().optional(),
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
  })),
  organization_id: z.string(),
});

export const createOrganizationSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  slug: z.string(),
});

export const createAdminSchema = z.object({
  id: z.string().optional(),
  email: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  phone_number: z.string().optional(),
  password: z.string(),
  organization_id: z.string(),
});

export type StaffBulkUploadSchema = z.infer<typeof StaffBulkUploadSchema>;

export type ExternalStaffBulkUploadSchema = z.infer<typeof externalStaffBulkUploadSchema>;


export const okohStaffBulkUploadSchema = z.object({
  list_of_staff: z.array(z.object({
    email: z.string(),
    name: z.string(),
    password: z.string(),
    date_of_birth: z.coerce.date(),
  })),
  organization_id: z.string(),
});
export const userGenerateTokenSchema = z.object({
  email: z.string(),
});
export const updateTeamDesignationSchema = z.object({
  team_id: z.string(),
  designation_id: z.string(),
  quantity: z.number().optional(),
  team_job_description: z.string().optional(),
  staffs: z.string().array().optional(),
  organization_id: z.string(),
});
