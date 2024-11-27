import { prisma } from "@/lib/prisma";
import { publicProcedure } from "../trpc";
import { z } from "zod";
import { GroupedPayrollResponse, Payroll, PayrollItem } from "./types";
import { approvePayrollSchema, createPayrollSchema, createPayrollTemplateSchema, createSinglePayrollSchema, updatePayrollSchema, updatePayrollTemplateSchema } from "../dtos";
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { auth } from "@/auth";
import { APPROVE_STATUS } from "@/lib/constants";

export const getAllPayrollTemplatesForOrganization = publicProcedure
  .input(z.object({ organization_slug: z.string() }))
  .query(async ({ input }) => {
    return await prisma.payrollTemplate.findMany({
      where: {
        organization: { id: input.organization_slug },
        deleted_at: null,
      },
      include: { staff: { include: { user: true } } },
    });
  });

  export const getAllPayrollsGroupedByMonth = publicProcedure
  .input(z.object({ organization_slug: z.string() }))
  .query(async ({ input }): Promise<GroupedPayrollResponse[]> => {
    const uniqueMonths = await prisma.payroll.findMany({
      where: {
        deleted_at: null,
        organization: { id: input.organization_slug },
      },
      select: {
        month: true,
        template: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      distinct: ["month"],
      orderBy: {
        month: "desc",
      },
    });

    // 
    
    const groupedPayrolls = await Promise.all(
      uniqueMonths.map(async ({ month, template }) => {
        const payrollsForMonth = await prisma.payroll.findMany({
          where: {
            deleted_at: null,
            organization: { id: input.organization_slug },
            month: month,
          },
          include: {
            template: true,
            staff: {
              include: {
                user: true,
              },
            },
            approved_by: true,
          },
          orderBy: {
            staff: {
              id: "asc",
            },
          },
        });
    
        const totalPayrolls = payrollsForMonth.length;
        const approvedCount = payrollsForMonth.filter((p) => p.approved).length;
    
        let approved_status = APPROVE_STATUS.NOT_APPROVED;
        if (approvedCount === totalPayrolls) {
          approved_status = APPROVE_STATUS.APPROVED;
        } else if (approvedCount > 0) {
          approved_status = APPROVE_STATUS.PARTIALLY_APPROVED;
        }

        const approverNames = Array.from(
          new Set(
            payrollsForMonth
              .map((p) =>( p.approved_by?.first_name as string))
              .filter((name) => name)
          )
        ).join(", ");

        // const approverNames = "Tehinse";
    
        return {
          month,
          templateId: template.id,
          templateName: template.name,
          approved_status,
          approverNames,
          payrolls: [
            {
              payrolls: payrollsForMonth,
            },
          ],
        };
      })
    );
    

    return groupedPayrolls;
  });

  export const assignStaffToPayrollTemplate = publicProcedure
  .input(
    z.object({
      templateId: z.string(),
      staffIds: z.array(z.string()),
    })
  )
  .mutation(async ({ input }) => {
    const { templateId, staffIds } = input;

    await prisma.payrollTemplate.update({
      where: { id: templateId },
      data: { staff: { connect: staffIds.map((id) => ({ id })) } },
    });

    return { success: true };
  });

  export const updatePayrollTemplate = publicProcedure.input(updatePayrollTemplateSchema).mutation(async ({ input }) => {
    const organization = await prisma.organization.findUnique({ where: { slug: input.organization_id } });
  
    if (organization === null) {
      console.error("Could not find organization with slug >> ");
      throw new Error(" not find organization with slug >> ");
    }
  
    return prisma.payrollTemplate.update({
      where: { id: input.id },
      data: {
        name: input.name,
        organization_id: organization.id,
        data: (input.data as Prisma.JsonValue) || Prisma.JsonNull,
      },
    });
  });

  export const createPayrollTemplate = publicProcedure.input(createPayrollTemplateSchema).mutation(async ({ input }) => {
    const { organization_id, ...rest } = input;
    const organization = await prisma.organization.findUnique({ where: { id: organization_id } });
  
    if (!organization) {
      throw new Error("Couldn't find organization");
    }
  
    const payrollTemplateData: Prisma.PayrollTemplateCreateInput = {
      organization: { connect: { id: organization.id } },
      ...rest,
      data: (rest.data as Prisma.JsonValue) ?? undefined,
    };
  
    const payrollTemplate = await prisma.payrollTemplate.create({ data: payrollTemplateData });
  
    return payrollTemplate;
  });

  export const getPreviousMonthPayrolls = publicProcedure
  .input(
    z.object({
      organization_slug: z.string(),
      currentMonth: z.string(),
    })
  )
  .query(async ({ input }) => {
    const currentDate = new Date(input.currentMonth);
    const previousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);

    const previousPayrolls = await prisma.payroll.findMany({
      where: {
        deleted_at: null,
        organization: { slug: input.organization_slug },
        month: {
          gte: previousMonth,
          lt: new Date(previousMonth.getFullYear(), previousMonth.getMonth() + 1, 1),
        },
      },
      include: {
        staff: {
          include: {
            user: true,
          },
        },
      },
    });

    return previousPayrolls;
  });

  export const getPayrollTemplateById = publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    const { id } = input;
  
    const payrollTemplate = prisma.payrollTemplate.findUnique({
      where: { id },
      include: { staff: { include: { user: true } } },
    });
  
    if (!payrollTemplate) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Payroll template not found",
      });
    }
  
    return payrollTemplate;
  });

  export const createPayroll = publicProcedure.input(createPayrollSchema).mutation(async ({ input }) => {
    const { month, staffPayrollData, slug, status } = input;
  
    if (!staffPayrollData || staffPayrollData.length === 0) {
      throw new Error("No staff IDs provided for payroll creation.");
    }
  
    const organization = await prisma.organization.findUnique({ where: { slug } });
  
    if (!organization) {
      throw new Error("Couldn't find organization");
    }
  
    const existingPayrolls = await prisma.payroll.findMany({
      where: {
        organization_id: organization.id,
        month: new Date(month),
        staff_id: { in: staffPayrollData.map((staffData) => staffData.staffId) },
      },
      select: { staff_id: true },
    });
  
    const existingEmployeeIds = new Set(existingPayrolls.map((payroll) => payroll.staff_id));
  
    const newPayrollData = staffPayrollData.filter((staffData) => !existingEmployeeIds.has(staffData.staffId));
  
    if (newPayrollData.length === 0) {
      throw new Error("Payroll already exists for employees in the given month.");
    }
  
    const payrolls = staffPayrollData
      .filter((staffData) => !existingEmployeeIds.has(staffData.staffId))
      .map((staffData) => ({
        template_id: staffData.templateId,
        month: new Date(month),
        staff_id: staffData.staffId,
        organization_id: organization.id,
        data: (staffData.payrollData as Prisma.JsonValue) || Prisma.JsonNull,
        status,
      }));
  
    await Promise.all(payrolls.map((payroll) => prisma.payroll.create({ data: payroll })));
  
    return { success: true, month };
  });

  export const getAllPayrollsForOrganization = publicProcedure
  .input(z.object({ organization_slug: z.string() }))
  .query(async ({ input }) => {
    const payroll = await prisma.payroll.findMany({
      where: {
        deleted_at: null,
        organization: { slug: input.organization_slug },
      },
      include: { template: true, staff: { include: { user: true } } },
    });

    return { payroll: payroll ?? [] };
  });

  export const createSinglePayroll = publicProcedure.input(createSinglePayrollSchema).mutation(async ({ input }) => {
    const { month, staffPayrollData, slug, status } = input;
    const organization = await prisma.organization.findUnique({ where: { id: slug } });
  
    if (!organization) {
      throw new Error("Couldn't find organization");
    }
  
    await prisma.payroll.create({
      data: {
        template_id: staffPayrollData.templateId,
        month: new Date(month),
        staff_id: staffPayrollData.staffId,
        organization_id: organization.id,
        data: (staffPayrollData.payrollData as Prisma.JsonValue) || Prisma.JsonNull,
        status,
      },
    });
  
    return { success: true, month };
  });
  
  export const getEmployeePayrollByStaffId = publicProcedure
  .input(z.object({ staff_id: z.string() }))
  .query(async ({ input }) => {
    const payrollData = await prisma.payroll.findMany({
      where: {
        staff_id: input.staff_id,
      },
      orderBy: {
        month: "desc",
      },
    });

    const processedPayroll: Payroll[] = payrollData.map((payroll) => {
      const data = payroll.data as unknown as PayrollItem[];
      const earnings = data.filter((item) => !item.isDeduction);
      const deductions = data.filter((item) => item.isDeduction);

      const earningsTotal = earnings.reduce((sum, item) => sum + item.amount, 0);
      const deductionsTotal = deductions.reduce((sum, item) => sum + item.amount, 0);
      const grossPay = earningsTotal - deductionsTotal;

      return {
        id: payroll.id,
        staff_id: payroll.staff_id,
        month: new Date(payroll.month),
        status: payroll.status,
        earningsTotal,
        deductionsTotal,
        grossPay,
        earnings,
        deductions,
      };
    });

    return processedPayroll;
  });

  export const approvePayroll = publicProcedure.input(approvePayrollSchema).mutation(async (opts) => {
    const organization = await prisma.organization.findUnique({ where: { id: opts.input.organization_slug } });
  
    const session = await auth();

    if(!session){
      console.error("User session not found");

      return;
    }

    if (organization === null) {
      console.error("Could not find organization with slug >> ");
      throw new Error(" not find organization with slug >> ");
    }
  
    return prisma.payroll.update({
      where: { id: opts.input.id },
      data: { approved: true, approved_by_id: session.user.id, approval_status: APPROVE_STATUS.APPROVED  },
    });
  });

  export const disapprovePayroll = publicProcedure.input(approvePayrollSchema).mutation(async (opts) => {
    const organization = await prisma.organization.findUnique({ where: { id: opts.input.organization_slug } });
  
    if (organization === null) {
      console.error("Could not find organization with slug >> ");
      throw new Error(" not find organization with slug >> ");
    }
  
    return prisma.payroll.update({
      where: { id: opts.input.id },
      data: { approved: false, approved_by_id: null },
    });
  });

  export const generatePayroll = publicProcedure.input(approvePayrollSchema).mutation(async (opts) => {
    const organization = await prisma.organization.findUnique({
      where: { id: opts.input.organization_slug },
    });
  
    if (!organization) {
      throw new Error("Organization not found");
    }
  
    return prisma.payroll.update({
      where: { id: opts.input.id },
      data: { generated: true },
    });
  });

  export const getPayrollsByTemplateAndMonth = publicProcedure
  .input(
    z.object({
      templateId: z.string(),
      month: z.string(),
      organization_id: z.string(),
    })
  )
  .query(async ({ input }) => {
    const organization = await prisma.organization.findUnique({
      where: { id: input.organization_id, deleted_at: null },
    });

    if (!organization) {
      throw new Error("Couldn't find organization");
    }

    const payrolls = await prisma.payroll.findMany({
      where: {
        template_id: input.templateId,
        month: new Date(input.month),
        organization_id: organization.id,
        deleted_at: null,
      },
      include: { staff: { include: { user: true } } },
    });

    if (payrolls.length === 0) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No payroll records found for the specified template and month",
      });
    }

    return payrolls.map((payroll) => ({
      ...payroll,
    }));
  });

  export const getApprovedPayrollsByTemplateAndMonth = publicProcedure
  .input(
    z.object({
      templateId: z.string(),
      month: z.string(),
      organization_id: z.string(),
    })
  )
  .query(async ({ input }) => {
    const organization = await prisma.organization.findUnique({
      where: { id: input.organization_id, deleted_at: null },
    });

    if (!organization) {
      throw new Error("Couldn't find organization");
    }

    const payrolls = await prisma.payroll.findMany({
      where: {
        template_id: input.templateId,
        month: new Date(input.month),
        organization_id: organization.id,
        approved: true,
        deleted_at: null,
      },
      include: { staff: { include: { user: true } }, approved_by: true },
    });

    if (payrolls.length === 0) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No payroll records found for the specified template and month",
      });
    }

    return payrolls.map((payroll) => ({
      ...payroll,
    }));
  });

  export const getUnapprovedPayrollsByTemplateAndMonth = publicProcedure
  .input(
    z.object({
      templateId: z.string(),
      month: z.string(),
      organization_id: z.string(),
    })
  )
  .query(async ({ input }) => {
    const organization = await prisma.organization.findUnique({
      where: { id: input.organization_id, deleted_at: null },
    });

    if (!organization) {
      throw new Error("Couldn't find organization");
    }

    const payrolls = await prisma.payroll.findMany({
      where: {
        template_id: input.templateId,
        month: new Date(input.month),
        organization_id: organization.id,
        approved: false,
        deleted_at: null,
      },
      include: { staff: { include: { user: true } }, approved_by: true },
    });

    if (payrolls.length === 0) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No payroll records found for the specified template and month",
      });
    }

    return payrolls.map((payroll) => ({
      ...payroll,
    }));
  });

  export const updatePayroll = publicProcedure.input(updatePayrollSchema).mutation(async ({ input }) => {
    const { id, slug: _, data, ...rest } = input;
<<<<<<< HEAD
    void _;
  
=======
  console.log(_);
>>>>>>> 012f370 (completed load approval and rejection and load crud)
    try {
      return await prisma.payroll.update({
        where: { id },
        data: { data: (data as Prisma.JsonValue) || Prisma.JsonNull, ...rest },
      });
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to update payroll",
        cause: error,
      });
    }
  });