
import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(5),
});

export const registrationSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  phoneNumber: z.string(),
  emailAddress: z.string().email(),
  password: z.string(),
});
export const updateTeamSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  description: z.string().optional(),
});
export type TUpdateTeamSchema = z.infer<typeof updateTeamSchema>;
export const createPayrollTemplateSchema = z.object({
  id: z.string().optional(),
  organization_id: z.string(),
  name: z.string(),
  data: z.unknown(),
});

export type TCreatePayrollTemplateSchema = z.infer<typeof createPayrollTemplateSchema>;

export const updateStaffDepartmentSchema = z.object({
  staff_id: z.string(),
  team_id: z.string(),
  department_id: z.string(),
});

export type TUpdateStaffDepartmentSchema = z.infer<typeof updateStaffDepartmentSchema>;

export const updateContractTemplateSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  type: z.string().optional(),
  sign_before: z.number().optional(),
  contract_duration: z.number().optional(),
  details: z.unknown().optional(),
  organization_id: z.string(),
  sender_id: z.string().optional()
});

export type TUpdateContractTemplateSchema = z.infer<typeof updateContractTemplateSchema>;
