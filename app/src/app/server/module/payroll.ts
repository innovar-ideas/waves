import { prisma } from "@/lib/prisma";
import { publicProcedure } from "../trpc";
import { z } from "zod";
import { GroupedPayrollResponse, IPayrollData, Payroll, PayrollItem } from "./types";
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
              .map((p) => (p.approved_by?.first_name as string))
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

// export const createSinglePayroll = publicProcedure.input(createSinglePayrollSchema).mutation(async ({ input }) => {
//   const { month, staffPayrollData, slug, status } = input;
//   const organization = await prisma.organization.findUnique({ where: { id: slug } });

//   if (!organization) {
//     throw new Error("Couldn't find organization");
//   }

//   await prisma.payroll.create({
//     data: {
//       template_id: staffPayrollData.templateId,
//       month: new Date(month),
//       staff_id: staffPayrollData.staffId,
//       organization_id: organization.id,
//       data: (staffPayrollData.payrollData as Prisma.JsonValue) || Prisma.JsonNull,
//       status,
//     },
//   });

//   return { success: true, month };
// });

export const createSinglePayroll = publicProcedure
  .input(createSinglePayrollSchema)
  .mutation(async ({ input }) => {
    const { month, staffPayrollData, slug, status } = input;

    // Fetch the organization
    const organization = await prisma.organization.findUnique({
      where: { id: slug },
    });
    if (!organization) {
      throw new Error("Couldn't find organization");
    }

    // Fetch the staff profile
    const staffProfile = await prisma.staffProfile.findUnique({
      where: { id: staffPayrollData.staffId },
      include: { user: { include: { loan_applications: true } } }, // Include the associated user
    });
    if (!staffProfile || !staffProfile.user) {
      throw new Error("Couldn't find staff profile or associated user");
    }

    // Check for active loans
    const activeLoan = staffProfile.user.loan_applications.find(
      (loan) => loan.status === "approved"
    );
    let additionalPayrollData = [] as IPayrollData[];
    if (activeLoan) {
      additionalPayrollData = [
        {
          name: "Loan Deduction",
          description: "Monthly loan deduction",
          required: true,
          amount: activeLoan.monthly_deduction ?? 0,
          isDeduction: true,
        },
      ];
    }

    // Merge the provided payrollData with the loan deduction if applicable
    const payrollData = [
      ...(staffPayrollData.payrollData || []),
      ...additionalPayrollData,
    ];

    // Create the payroll
    await prisma.payroll.create({
      data: {
        template_id: staffPayrollData.templateId,
        month: new Date(month),
        staff_id: staffPayrollData.staffId,
        organization_id: organization.id,
        data: (payrollData as Prisma.JsonValue) || Prisma.JsonNull,
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

export const approvePayroll1 = publicProcedure.input(approvePayrollSchema).mutation(async (opts) => {
  const organization = await prisma.organization.findUnique({ where: { id: opts.input.organization_slug } });

  const session = await auth();

  if (!session) {
    console.error("User session not found");

    return;
  }

  if (organization === null) {
    console.error("Could not find organization with slug >> ");
    throw new Error(" not find organization with slug >> ");
  }

  return prisma.payroll.update({
    where: { id: opts.input.id },
    data: { approved: true, approved_by_id: session.user.id, approval_status: APPROVE_STATUS.APPROVED },
    include: { staff: { include: { user: { include: { loan_applications: true } } } } }
  });
});

export const approvePayroll = publicProcedure
  .input(approvePayrollSchema)
  .mutation(async (opts) => {
    const { organization_slug, id } = opts.input;

    // Step 1: Get the organization
    const organization = await prisma.organization.findUnique({
      where: { id: organization_slug },
    });

    if (!organization) {
      console.error(`Could not find organization with slug: ${organization_slug}`);
      throw new Error("Organization not found");
    }

    // Step 2: Get the current session
    const session = await auth();
    if (!session) {
      console.error("User session not found");
      throw new Error("User not authenticated");
    }

    // Step 3: Approve the payroll
    const payroll = await prisma.payroll.update({
      where: { id },
      data: {
        approved: true,
        approved_by_id: session.user.id,
        approval_status: APPROVE_STATUS.APPROVED,
      },
      include: {
        staff: {
          include: {
            user: {
              include: {
                loan_applications: true,
              },
            },
          },
        },
      },
    });

    if (!payroll || !payroll.staff?.user) {
      console.error("Could not find payroll staff or user");
      throw new Error("Invalid payroll or user data");
    }

    const user = payroll.staff.user;

    // Step 4: Get the active loan
    const activeLoan = user.loan_applications.find(
      (loan) => loan.status === "approved" && !loan.fully_paid
    );

    if (!activeLoan) {
      console.log(`No active loan found for user: ${user.id}`);
      return { success: true, message: "Payroll approved, no active loan found" };
    }

    // Step 5: Find the "Loan Deduction" in payroll data
    const payrollData = payroll.data || [];
    const loanDeductionItem = (payrollData as unknown as PayrollItem[]).find((item) => item.name === "Loan Deduction");

    if (!loanDeductionItem) {
      console.error(`No "Loan Deduction" item found in payroll data for payroll ID: ${id}`);
      throw new Error("Loan Deduction item not found in payroll data");
    }

    const amountPaid = loanDeductionItem.amount;
    const balanceRemaining = (activeLoan.monthly_deduction || 0) - amountPaid;

    // Step 6: Create a LoanRepayment entry for the active loan
    const loanRepayment = await prisma.loanRepayment.create({
      data: {
        loan_id: activeLoan.id,
        repayment_date: new Date(),
        amount_paid: amountPaid,
        balance_remaining: Math.max(balanceRemaining, 0), // Prevent negative balances
        payment_method: "deduction", // Assumed payroll deduction
        remarks: "Repayment processed through payroll approval",
        organization_id: organization.id,
      },
    });

    return {
      success: true,
      message: "Payroll approved and loan repayment created successfully",
      loanRepayment,
    };
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

export const getUserPayrollByTemplateAndMonth = publicProcedure
  .input(
    z.object({
      templateId: z.string(),
      month: z.string(),
      organization_id: z.string(),
      user_id: z.string(),
    })
  )
  .query(async ({ input }) => {
    const organization = await prisma.organization.findUnique({
      where: { id: input.organization_id, deleted_at: null },
    });

    if (!organization) {
      throw new Error("Couldn't find organization");
    }

    const payroll = await prisma.payroll.findFirst({
      where: {
        template_id: input.templateId,
        month: new Date(input.month),
        organization_id: organization.id,
        approved: true,
        deleted_at: null,
        staff: {
          user: {
            id: input.user_id,
          },
        },
      },
      include: { staff: { include: { user: true } }, approved_by: true },
    });

    if (!payroll) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No payroll record found for the specified user, template, and month",
      });
    }

    return payroll;
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
  void _;

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

export const getPayrollsGroupedByMonthForStaff = publicProcedure
  .input(
    z.object({
      organization_slug: z.string(),
      staffProfile_id: z.string(),
    })
  )
  .query(async ({ input }): Promise<GroupedPayrollResponse[]> => {
    const uniqueMonths = await prisma.payroll.findMany({
      where: {
        deleted_at: null,
        organization: { id: input.organization_slug },
        staff: { user_id: input.staffProfile_id }, // Filter by staffProfile_id
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

    const groupedPayrolls = await Promise.all(
      uniqueMonths.map(async ({ month, template }) => {
        const payrollsForMonth = await prisma.payroll.findMany({
          where: {
            deleted_at: null,
            organization: { id: input.organization_slug },
            month: month,
            staff: { user_id: input.staffProfile_id }, // Filter by staffProfile_id
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
              .map((p) => (p.approved_by?.first_name as string))
              .filter((name) => name)
          )
        ).join(", ");

        return {
          month,
          templateId: template.id,
          templateName: template.name,
          approved_status,
          approverNames,
          payrolls: [
            {
              payrolls: payrollsForMonth, // Wrap in the correct structure
            },
          ],
        };
      })
    );

    return groupedPayrolls;
  });



