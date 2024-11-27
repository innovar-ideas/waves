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