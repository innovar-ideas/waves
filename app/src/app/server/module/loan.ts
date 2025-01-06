
import { formatCurrency, sendNotification } from "@/lib/utils";
import { applyForLoanSchema, AttendToLoanManagementSchema, attendToLoanManagementSchema, createLoanSettingSchema, findByIdSchemaSchema, updateLoanApplicationSchema, updateLoanSettingSchema } from "../dtos";
import { publicProcedure } from "../trpc";
import { prisma } from "@/lib/prisma";

export type LoanApplicationWithLoanSetting = {
  user: {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
  };
  load: {
    id: string;
    amount: number;
    repayment_period: number;
    monthly_deduction: number | null;
    is_disbursed: boolean;
    reason: string | null;
    status: string;
    reviewed_by: string | null;
    reviewed_at: Date | null;
    user_id: string;
    organization_id: string;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
  };
  loan_id?: string;
  approvalLevel?: AttendToLoanManagementSchema[];
};

export const getLoanSettingByOrganizationSlug = publicProcedure.input(findByIdSchemaSchema).query(async ({ input }) => {
  const loanSetting = await prisma.loanSetting.findFirst({ where: { organization_id: input.id } });
  if (!loanSetting) {
    return await prisma.loanSetting.create({ data: { organization_id: input.id, max_percentage: 0, max_repayment_months: 0 } });
  }
  return loanSetting;
});

export const createLoanSetting = publicProcedure.input(createLoanSettingSchema).mutation(async ({ input }) => {
  const foundLoanSetting = await prisma.loanSetting.findFirst({
    where: {
      organization_id: input.organization_id
    }
  });
  if (foundLoanSetting) {
    return foundLoanSetting;
  }
  const loanSetting = await prisma.loanSetting.create({
    data: {
      organization_id: input.organization_id,
      max_percentage: input.max_percentage,
      max_repayment_months: input.max_repayment_months,
      number_of_times: input.number_of_times
    }
  });
  return loanSetting;
});

export const updateLoanSetting = publicProcedure.input(updateLoanSettingSchema).mutation(async ({ input }) => {
  const loanSetting = await prisma.loanSetting.update({
    where: { id: input.id },
    data: {
      max_percentage: input.max_percentage,
      max_repayment_months: input.max_repayment_months,
      number_of_times: input.number_of_times
    },
  });
  return loanSetting;
});

export const deleteLoanSetting = publicProcedure.input(findByIdSchemaSchema).mutation(async ({ input }) => {
  const loanSetting = await prisma.loanSetting.update({
    where: { id: input.id },
    data: { deleted_at: new Date() },
  });
  return loanSetting;
});

export const getLoanSettingById = publicProcedure.input(findByIdSchemaSchema).query(async ({ input }) => {
  const loanSetting = await prisma.loanSetting.findUnique({ where: { id: input.id } });
  return loanSetting;
});

export const getAllLoanSettingByOrganizationSlug = publicProcedure.input(findByIdSchemaSchema).query(async ({ input }) => {
  const loanSetting = await prisma.loanSetting.findMany({ where: { organization_id: input.id, deleted_at: null }, orderBy: { created_at: "desc" } });
  return loanSetting;
});

export const applyForLoan = publicProcedure.input(applyForLoanSchema).mutation(async ({ input }) => {
  
  const { amount, user_id, repayment_period } = input;
 
  const staff = await prisma.staffProfile.findUnique({ where: { user_id: user_id }, include: { user: true } });
  if (!staff) throw new Error("Staff not found");
  
  const loanSetting = await prisma.loanSetting.findFirst({ where: { organization_id: input.organization_id } });
  const numberOfLoansAllowed = loanSetting?.number_of_times || 0;
  const staffNumberOfLoans = staff.number_of_loans || 0;
  if(staffNumberOfLoans >= numberOfLoansAllowed){
    throw new Error("Staff has reached the maximum number of loans allowed");
  }
  if (!loanSetting) throw new Error("Loan setting not found");
  const maxPercentage = loanSetting.max_percentage;
  const maxRepaymentMonths = loanSetting.max_repayment_months;
  console.log(maxPercentage, maxRepaymentMonths,"------------------------------01");
  if (!staff.amount_per_month) {
   staff.amount_per_month = 0;
  }
  console.log(staff.amount_per_month, maxPercentage,"------------------------------1");
  const maxAllowedAmount = (staff.amount_per_month * maxPercentage) / 100;
  // if (amount > maxAllowedAmount) {
  //   throw new Error(`Loan amount exceeds maximum allowed (${maxPercentage}% of monthly salary). Maximum allowed: ${maxAllowedAmount}`);
  // }
  console.log(maxAllowedAmount,"------------------------------2");

  if (repayment_period > maxRepaymentMonths) {
    throw new Error(`Repayment period exceeds maximum allowed ${maxRepaymentMonths} months`);
  }

  const deduction = Math.floor(input.amount/input.repayment_period);
  const loanApplication = await prisma.loanApplication.create({ data: { 
    user_id: user_id,
    amount: amount,
    repayment_period: repayment_period,
    monthly_deduction: deduction,
    reason: input.reason,
    organization_id: input.organization_id,
    status: "pending"
  } 
  });
  
  const admin = await prisma.user.findMany({
    where: {
      organization_id: input.organization_id,
      roles: {
        some: {
          role: {
            name: "admin"
          }
        }
      }
    }
  });
  await sendNotification({
    is_sender: false,
    title: "Loan Application",
    message: `New loan application received from ${staff.user.first_name} ${staff.user.last_name} for ${formatCurrency(amount)}${loanApplication.reason ? ` for ${loanApplication.reason}` : ""}. Repayment period: ${repayment_period} months. Please review and approve/reject this application.`,
    notificationType: "Loan",
    recipientIds: admin.map(admin => ({ id: admin.id, isAdmin: true, is_sender: false, sender_id: user_id as unknown as string }))
  });

   const finance = await prisma.user.findMany({
    where: {
      organization_id: input.organization_id,
      roles: {
        some: {
          role: {
            name: "finance"
          }
        }
      }
    }
  });
  await sendNotification({
    is_sender: false,
    title: "Loan Application",
    message: `New loan application received from ${staff.user.first_name} ${staff.user.last_name} for ${formatCurrency(amount)}${loanApplication.reason ? ` for ${loanApplication.reason}` : ""}. Repayment period: ${repayment_period} months. Please review and approve/reject this application.`,
    notificationType: "Loan",
    recipientIds: finance.map(finance => ({ id: finance.id, isAdmin: true, is_sender: false, sender_id: user_id as unknown as string }))
  });
 
 

  return loanApplication;
});

export const updateLoanApplication = publicProcedure.input(updateLoanApplicationSchema).mutation(async ({ input }) => {
  const { amount, user_id, repayment_period } = input;
  const loanApplicationInDb = await prisma.loanApplication.findUnique({ where: { id: input.id } });
  if(!loanApplicationInDb) throw new Error("Loan application not found");
  if(loanApplicationInDb.status === "approved" || loanApplicationInDb.status === "rejected" || loanApplicationInDb.status !== "pending") throw new Error("Loan application already approved or rejected, you cannot update it");

  const staff = await prisma.staffProfile.findUnique({ where: { user_id: user_id } });
  if (!staff) throw new Error("Staff not found");

  const loanSetting = await prisma.loanSetting.findFirst({ where: { organization_id: input.organization_id } });
  if (!loanSetting) throw new Error("Loan setting not found");

  const maxPercentage = loanSetting.max_percentage;
  const maxRepaymentMonths = loanSetting.max_repayment_months;
  if (!staff.amount_per_month) {
    throw new Error("Staff salary information not found");
  }

  const maxAllowedAmount = (staff.amount_per_month * maxPercentage) / 100;

  if (amount && repayment_period) {
    if (amount > maxAllowedAmount) {
      throw new Error(`Loan amount exceeds maximum allowed (${maxPercentage}% of monthly salary). Maximum allowed: ${maxAllowedAmount}`);
    }

    if (repayment_period > maxRepaymentMonths) {
      throw new Error(`Repayment period exceeds maximum allowed ${maxRepaymentMonths} months`);
    }
  }

  const loanApplication = await prisma.loanApplication.update({ where: { id: input.id }, data: input });
  return loanApplication;
});

export const getAllLoanApplicationByUserId = publicProcedure.input(findByIdSchemaSchema).query(async ({ input }) => {
  const loanApplication = await prisma.loanApplication.findMany({ where: { user_id: input.id, deleted_at: null }, orderBy: { created_at: "desc" } });
  return loanApplication;
});

export const changeLoanApplicationStatus = publicProcedure.input(updateLoanApplicationSchema).mutation(async ({ input }) => {
  const loanApplication = await prisma.loanApplication.update({ where: { id: input.id }, data: { ...input, status: input.status } });
  const loan = await prisma.loanApplication.findUnique({
    where: { id: input.id },
    include: {
      user: {
        include: {
          staffProfile: true
        }
      }
    }
  });

  if (!loan || !loan.user) {
    throw new Error("Loan application not found");
  }

  if (input.status === "approved") {
    const staffProfile = await prisma.staffProfile.findUnique({
      where: { user_id: loan.user.id }
    });
    await prisma.staffProfile.update({
      where: { user_id: loan.user.id },
      data: { 
        number_of_loans: (staffProfile?.number_of_loans || 0) + 1
      }
    });
  }
 
  await sendNotification({
    is_sender: false,
    title: "Loan Application",
    message: input.status === "rejected" ?
      "We regret to inform you that your loan application has been rejected. Please contact the admin for more details." :
      "Congratulations! Your loan application has been approved. The amount will be processed shortly.",
    notificationType: "Loan",
    recipientIds: [{ id: loanApplication.user_id, isAdmin: false, is_sender: false, sender_id: input.sender_id as unknown as string }]
  });
  return loanApplication;
});

export const deleteLoanApplication = publicProcedure.input(findByIdSchemaSchema).mutation(async ({ input }) => {
  return await prisma.loanApplication.update({
    where: {
      id: input.id
    },
    data: {
      deleted_at: new Date()
    }
  });
});

export const getAllPendingLoanApplicationByOrganizationSlug = publicProcedure.input(findByIdSchemaSchema).query(async ({ input }) => {
  const applications = await prisma.loanApplication.findMany({
    where: { organization_id: input.id, deleted_at: null, status: "pending" },
    orderBy: { created_at: "desc" },
    include: {
      user: true
    }
  });

  return applications.map(app => ({
    user: {
      id: app.user.id,
      email: app.user.email,
      first_name: app.user.first_name,
      last_name: app.user.last_name,

      created_at: app.user.created_at,
      updated_at: app.user.updated_at,
      deleted_at: app.user.deleted_at
    },
    load: {
      id: app.id,
      amount: app.amount,
      repayment_period: app.repayment_period,
      monthly_deduction: app.monthly_deduction,
      reason: app.reason,
      status: app.status,
      is_disbursed: app.is_disbursed,
      reviewed_by: app.reviewed_by,
      reviewed_at: app.reviewed_at,
      user_id: app.user_id,
      organization_id: app.organization_id,
      created_at: app.created_at,
      updated_at: app.updated_at,
      deleted_at: app.deleted_at,
    },
    loan_id: app.id,
   
  }));
});

export const getAllApprovedLoanApplicationByOrganizationSlug = publicProcedure.input(findByIdSchemaSchema).query(async ({ input }) => {
  const applications = await prisma.loanApplication.findMany({
    where: { organization_id: input.id, deleted_at: null, status: "approved" },
    orderBy: { created_at: "desc" },
    include: {
      user: true
    }
  });
  try {
    return applications.map(app => ({
      user: {
        id: app.user.id,
        email: app.user.email,
        first_name: app.user.first_name,
        last_name: app.user.last_name,
        created_at: app.user.created_at,
        updated_at: app.user.updated_at,
        deleted_at: app.user.deleted_at
      },
      load: {
        id: app.id,
        amount: app.amount,
        repayment_period: app.repayment_period,
        monthly_deduction: app.monthly_deduction,
        reason: app.reason,
        status: app.status,
        is_disbursed: app.is_disbursed,
        reviewed_by: app.reviewed_by,
        reviewed_at: app.reviewed_at,
        user_id: app.user_id,
        organization_id: app.organization_id,
        created_at: app.created_at,
        updated_at: app.updated_at,
        deleted_at: app.deleted_at,
      },
      loan_id: app.id,
    }));
  } catch (error) {
    console.error("Error mapping approved loan applications:😪😪🤐>>>>>>>", error);
    throw error;
  }
});

export const getAllRejectedLoanApplicationByOrganizationSlug = publicProcedure.input(findByIdSchemaSchema).query(async ({ input }) => {
  const applications = await prisma.loanApplication.findMany({
    where: { organization_id: input.id, deleted_at: null, status: "rejected" },
    orderBy: { created_at: "desc" },
    include: {
      user: true
    }
  });

  try {
    return applications.map(app => ({
      user: {
        id: app.user.id,
        email: app.user.email,
        first_name: app.user.first_name,
        last_name: app.user.last_name,
        created_at: app.user.created_at,
        updated_at: app.user.updated_at,
        deleted_at: app.user.deleted_at
      },
      load: {
        id: app.id,
        amount: app.amount,
        repayment_period: app.repayment_period,
        monthly_deduction: app.monthly_deduction,
        reason: app.reason,
        status: app.status,
        is_disbursed: app.is_disbursed,
        reviewed_by: app.reviewed_by,
        reviewed_at: app.reviewed_at,
        user_id: app.user_id,
        organization_id: app.organization_id,
        created_at: app.created_at,
        updated_at: app.updated_at,
        deleted_at: app.deleted_at,
      },
      loan_id: app.id,
    }));
  } catch (error) {
    console.error("Error mapping rejected loan applications:😫😫😯😯>>>>>>>", error);
    throw error;
  }
});

export const getAllLoanApplicationByOrganizationSlug = publicProcedure.input(findByIdSchemaSchema).query(async ({ input }) => {
  const applications = await prisma.loanApplication.findMany({
    where: { organization_id: input.id, deleted_at: null },
    orderBy: { created_at: "desc" },
    include: {
      user: true
    }
  });

  try {
    return applications.map(app => ({
      user: {
        id: app.user.id,
        email: app.user.email,
        first_name: app.user.first_name,
        last_name: app.user.last_name,
        created_at: app.user.created_at,
        updated_at: app.user.updated_at,
        deleted_at: app.user.deleted_at
      },
      load: {
        id: app.id,
        amount: app.amount,
        repayment_period: app.repayment_period,
        monthly_deduction: app.monthly_deduction,
        reason: app.reason,
        status: app.status,
        is_disbursed: app.is_disbursed,
        reviewed_by: app.reviewed_by,
        reviewed_at: app.reviewed_at,
        user_id: app.user.id,
        organization_id: app.organization_id,
        created_at: app.created_at,
        updated_at: app.updated_at,
        deleted_at: app.deleted_at,
      },
      loan_id: app.id,
    }));
  } catch (error) {
    console.error("Error mapping all loan applications:😐😐>>>>>>>", error);
    throw error;
  }
});

export const getLoanApplicationById = publicProcedure.input(findByIdSchemaSchema).query(async ({ input }) => {
  const app = await prisma.loanApplication.findUnique({
    where: { id: input.id },
    include: { user: true }
  });

  if (!app) return null;

  return {
    user: {
      id: app.user.id,
      email: app.user.email,
      first_name: app.user.first_name,
      last_name: app.user.last_name,
      created_at: app.user.created_at,
      updated_at: app.user.updated_at,
      deleted_at: app.user.deleted_at
    },
    load: {
      id: app.id,
      amount: app.amount,
      repayment_period: app.repayment_period,
      monthly_deduction: app.monthly_deduction,
      reason: app.reason,
      status: app.status,
      is_disbursed: app.is_disbursed,
      reviewed_by: app.reviewed_by,
      reviewed_at: app.reviewed_at,
      user_id: app.user_id,
      organization_id: app.organization_id,
      created_at: app.created_at,
      updated_at: app.updated_at,
      deleted_at: app.deleted_at,
      approvalLevel: app.approval_level
    },
    loan_id: app.id,
    approvalLevel: app.approval_level
  };
});

export const disburseLoan = publicProcedure.input(findByIdSchemaSchema).mutation(async ({ input }) => {
  const { id } = input;

  const loan = await prisma.loanApplication.update({
    where: { id },
    data: { is_disbursed: true },
  });

  await prisma.loanRepayment.create({
    data: {
      loan_id: id,
      repayment_date: new Date(),
      amount_paid: 0,
      balance_remaining: loan.amount,
      payment_method: "None",
      remarks: "Initial repayment line after loan disbursement",
      organization_id: loan.organization_id,
    },
  });


  return loan;
});
export const attendToLoanManagement = publicProcedure.input(attendToLoanManagementSchema).mutation(async ({ input }) => {
  if(input.department_name !== "finance" && input.department_name !== "admin"){
    throw new Error("Invalid department name");
  }
  const loan = await prisma.loanApplication.findUnique({
    where: { id: input.loan_id }
  });

  if (!loan) throw new Error("Loan not found");
  const approvalLevel = loan.approval_level as AttendToLoanManagementSchema[] | null;
  if(approvalLevel && approvalLevel.length === 2){
    throw new Error("No more approval levels allowed");
  }

  const currentApprovalLevels = (loan.approval_level as AttendToLoanManagementSchema[] | null) ?? [];

  
  const financeReview = currentApprovalLevels.find(level => level.department_name === "finance");
  if (financeReview && input.department_name === "finance") {
    throw new Error("Loan has already been reviewed by finance department");
  }
  if (currentApprovalLevels.length >= 2) {
    throw new Error("Maximum number of approval levels (2) has been reached");
  }

  const loan_management_department_details: AttendToLoanManagementSchema = {
    loan_id: input.loan_id,
    department_name: input.department_name,
    approved_by: input.approved_by,
    approved_at: input.approved_at,
    loan_approval_status: input.loan_approval_status,
  };

  const updatedApprovalLevels = [...currentApprovalLevels, loan_management_department_details];

  return await prisma.loanApplication.update({
    where: { id: input.loan_id },
    data: {
      approval_level: updatedApprovalLevels
    }
  });
});
