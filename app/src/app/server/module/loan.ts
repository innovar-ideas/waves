
import { formatCurrency, sendNotification } from "@/lib/utils";
import { applyForLoanSchema, createLoanSettingSchema, findByIdSchemaSchema, updateLoanApplicationSchema, updateLoanSettingSchema } from "../dtos";
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
};

export const getLoanSettingByOrganizationSlug = publicProcedure.input(findByIdSchemaSchema).query(async ({input}) => {
  const loanSetting = await prisma.loanSetting.findFirst({where: {organization_id: input.id}});
  if(!loanSetting){
    return await prisma.loanSetting.create({data: {organization_id: input.id, max_percentage: 0, max_repayment_months: 0}});
  }
  return loanSetting;
});

export const createLoanSetting = publicProcedure.input(createLoanSettingSchema).mutation(async ({input}) => {
  const foundLoanSetting = await prisma.loanSetting.findFirst({
    where: {
      organization_id: input.organization_id
    }
  });
  if(foundLoanSetting){
    return foundLoanSetting;
  } 
  const loanSetting = await prisma.loanSetting.create({
    data: {
      ...input,
    }
  });
  return loanSetting;
});

export const updateLoanSetting = publicProcedure.input(updateLoanSettingSchema).mutation(async ({input}) => {
  console.log(input.organization_id);
  const loanSetting = await prisma.loanSetting.update({
    where: {id: input.id},
    data: input,
  });
  return loanSetting;
});

export const deleteLoanSetting = publicProcedure.input(findByIdSchemaSchema).mutation(async ({input}) => {
  const loanSetting = await prisma.loanSetting.update({
    where: {id: input.id},
    data: {deleted_at: new Date()},
  });
  return loanSetting;
});

export const getLoanSettingById = publicProcedure.input(findByIdSchemaSchema).query(async ({input}) => {
  const loanSetting = await prisma.loanSetting.findUnique({where: {id: input.id}});
  return loanSetting;
});

export const getAllLoanSettingByOrganizationSlug = publicProcedure.input(findByIdSchemaSchema).query(async ({input}) => {
  const loanSetting = await prisma.loanSetting.findMany({where: {organization_id: input.id, deleted_at: null}, orderBy: {created_at: "desc"}});
  return loanSetting;
});

export const applyForLoan = publicProcedure.input(applyForLoanSchema).mutation(async ({input}) => {
  const {amount, user_id, repayment_period} = input;
  const staff = await prisma.staffProfile.findUnique({where: {user_id: user_id}, include: {user: true}});
  if(!staff) throw new Error("Staff not found");

  const loanSetting = await prisma.loanSetting.findFirst({where: {organization_id: input.organization_id}});
  if(!loanSetting) throw new Error("Loan setting not found");

  const maxPercentage = loanSetting.max_percentage; 
  const maxRepaymentMonths = loanSetting.max_repayment_months;
  if (!staff.amount_per_month) {
    throw new Error("Staff salary information not found");
  }

  const maxAllowedAmount = (staff.amount_per_month * maxPercentage) / 100;

  if (amount > maxAllowedAmount) {
    throw new Error(`Loan amount exceeds maximum allowed (${maxPercentage}% of monthly salary). Maximum allowed: ${maxAllowedAmount}`);
  }

  if (repayment_period > maxRepaymentMonths) {
    throw new Error(`Repayment period exceeds maximum allowed ${maxRepaymentMonths} months`);
  }
 
  const loanApplication = await prisma.loanApplication.create({data: {...input, status: "pending"}});
  const admin = await prisma.user.findFirst({
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
    userId: user_id,
    title: "Loan Application",
    message: `New loan application received from ${staff.user.first_name} ${staff.user.last_name} for ${formatCurrency(amount)}${loanApplication.reason ? ` for ${loanApplication.reason}` : ""}. Repayment period: ${repayment_period} months. Please review and approve/reject this application.`,
    notificationType: "Loan",
    recipientIds: [{id: admin?.id || "", isAdmin: true}]
  });
  
  return loanApplication;
});

export const updateLoanApplication = publicProcedure.input(updateLoanApplicationSchema).mutation(async ({input}) => {
  const {amount, user_id, repayment_period} = input;

  const staff = await prisma.staffProfile.findUnique({where: {user_id: user_id}});
  if(!staff) throw new Error("Staff not found");
 
  const loanSetting = await prisma.loanSetting.findFirst({where: {organization_id: input.organization_id}});
  if(!loanSetting) throw new Error("Loan setting not found");
 
  const maxPercentage = loanSetting.max_percentage; 
  const maxRepaymentMonths = loanSetting.max_repayment_months;
  if (!staff.amount_per_month) {
    throw new Error("Staff salary information not found");
  }
 
  const maxAllowedAmount = (staff.amount_per_month * maxPercentage) / 100;
 
  if(amount && repayment_period){
    if (amount > maxAllowedAmount) {
      throw new Error(`Loan amount exceeds maximum allowed (${maxPercentage}% of monthly salary). Maximum allowed: ${maxAllowedAmount}`);
    }
  
    if (repayment_period > maxRepaymentMonths) {
      throw new Error(`Repayment period exceeds maximum allowed ${maxRepaymentMonths} months`);
    }
  }

  const loanApplication = await prisma.loanApplication.update({where: {id: input.id}, data: input});
  return loanApplication;
});

export const getAllLoanApplicationByUserId = publicProcedure.input(findByIdSchemaSchema).query(async ({input}) => {
  const loanApplication = await prisma.loanApplication.findMany({where: {user_id: input.id, deleted_at: null}, orderBy: {created_at: "desc"}});
  return loanApplication;
});

export const changeLoanApplicationStatus = publicProcedure.input(updateLoanApplicationSchema).mutation(async ({input}) => {
  const loanApplication = await prisma.loanApplication.update({where: {id: input.id}, data: {...input, status: input.status}});
  const admin = await prisma.user.findFirst({
    where: {
      organization_id: input.organization_id,
      roles: {
        some: {
          role: {
            name: "ADMIN"
          }
        }
      }
    }
  });
  await sendNotification({
    userId: admin?.id || "",
    title: "Loan Application",
    message: input.status === "rejected" ? 
      "We regret to inform you that your loan application has been rejected. Please contact the admin for more details." :
      "Congratulations! Your loan application has been approved. The amount will be processed shortly.",
    notificationType: "Loan",
    recipientIds: [{id: loanApplication.user_id, isAdmin: false}]
  });
  return loanApplication;
});

export const deleteLoanApplication = publicProcedure.input(findByIdSchemaSchema).mutation(async ({input}) =>{
  return await prisma.loanApplication.update({
    where:{
      id: input.id
    },
    data: {
      deleted_at: new Date()
    }
  });
});

export const getAllPendingLoanApplicationByOrganizationSlug = publicProcedure.input(findByIdSchemaSchema).query(async ({input}) => {
  const applications = await prisma.loanApplication.findMany({
    where: {organization_id: input.id, deleted_at: null, status: "pending"}, 
    orderBy: {created_at: "desc"},
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
      reviewed_by: app.reviewed_by,
      reviewed_at: app.reviewed_at,
      user_id: app.user_id,
      organization_id: app.organization_id,
      created_at: app.created_at,
      updated_at: app.updated_at,
      deleted_at: app.deleted_at
    },
    loan_id: app.id
  }));
});

export const getAllApprovedLoanApplicationByOrganizationSlug = publicProcedure.input(findByIdSchemaSchema).query(async ({input}) => {
  const applications = await prisma.loanApplication.findMany({
    where: {organization_id: input.id, deleted_at: null, status: "approved"}, 
    orderBy: {created_at: "desc"},
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
      reviewed_by: app.reviewed_by,
      reviewed_at: app.reviewed_at,
      user_id: app.user_id,
      organization_id: app.organization_id,
      created_at: app.created_at,
      updated_at: app.updated_at,
      deleted_at: app.deleted_at
    },
    loan_id: app.id
  }));
});

export const getAllRejectedLoanApplicationByOrganizationSlug = publicProcedure.input(findByIdSchemaSchema).query(async ({input}) => {
  const applications = await prisma.loanApplication.findMany({
    where: {organization_id: input.id, deleted_at: null, status: "rejected"}, 
    orderBy: {created_at: "desc"},
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
      reviewed_by: app.reviewed_by,
      reviewed_at: app.reviewed_at,
      user_id: app.user_id,
      organization_id: app.organization_id,
      created_at: app.created_at,
      updated_at: app.updated_at,
      deleted_at: app.deleted_at
    },
    loan_id: app.id
  }));
});

export const getAllLoanApplicationByOrganizationSlug = publicProcedure.input(findByIdSchemaSchema).query(async ({input}) => {
  const applications = await prisma.loanApplication.findMany({
    where: {organization_id: input.id, deleted_at: null}, 
    orderBy: {created_at: "desc"},
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
      reviewed_by: app.reviewed_by,
      reviewed_at: app.reviewed_at,
      user_id: app.user_id,
      organization_id: app.organization_id,
      created_at: app.created_at,
      updated_at: app.updated_at,
      deleted_at: app.deleted_at
    },
    loan_id: app.id
  }));
});

export const getLoanApplicationById = publicProcedure.input(findByIdSchemaSchema).query(async ({input}) => {
  const app = await prisma.loanApplication.findUnique({
    where: {id: input.id}, 
    include: {user: true}
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
      reviewed_by: app.reviewed_by,
      reviewed_at: app.reviewed_at,
      user_id: app.user_id,
      organization_id: app.organization_id,
      created_at: app.created_at,
      updated_at: app.updated_at,
      deleted_at: app.deleted_at
    },
    loan_id: app.id
  };
});