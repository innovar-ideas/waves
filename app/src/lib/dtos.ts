
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
export const createPurchaseOrderSchema = z.object({
  purchase_order_number: z.string(),
  type: z.string().optional(),
  vendor_id: z.string().optional(),
  account_item_id: z.string().optional(),
  price: z.number().nonnegative(),
  organization_id: z.string(),
  created_by_id: z.string(),
});
export type TCreatePurchaseOrderSchema = z.infer<typeof createPurchaseOrderSchema>;

export const createPurchaseOrderBillSchema = z.object({
  purchase_order_number: z.string(),
  type: z.string().optional(),
  vendor_id: z.string().optional(),
  amount: z.number().nonnegative(),
  organization_id: z.string(),
  due_date: z.date(),
  list_of_purchase_orders: z.array(z.string()),
});
export type TCreatePurchaseOrderBillSchema = z.infer<typeof createPurchaseOrderBillSchema>;
