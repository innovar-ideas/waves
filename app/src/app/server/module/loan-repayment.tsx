import { createLoanRepaymentSchema } from "../dtos";
import { publicProcedure } from "../trpc";
import { prisma } from "@/lib/prisma";

export const createLoanRepayment = publicProcedure.input(createLoanRepaymentSchema).mutation(async ({ input }) => {
  const { loanId, amountPaid, paymentMethod, remarks } = input;

  // Fetch the latest repayment for the loan
  const lastRepayment = await prisma.loanRepayment.findFirst({
    where: { loan_id: loanId },
    orderBy: { repayment_date: "desc" },
  });

  if (!lastRepayment) {
    throw new Error("No repayment history found for this loan");
  }

  // Calculate the new balance
  const newBalance = lastRepayment.balance_remaining - amountPaid;

  if (newBalance < 0) {
    throw new Error("Repayment amount exceeds outstanding balance");
  }

  // Create a new repayment record
  const newRepayment = await prisma.loanRepayment.create({
    data: {
      loan_id: loanId,
      repayment_date: new Date(),
      amount_paid: amountPaid,
      balance_remaining: newBalance,
      payment_method: paymentMethod,
      remarks,
      organization_id: lastRepayment.organization_id,
    },
  });

  // Check if the loan is fully repaid
  if (newBalance === 0) {
    await prisma.loanApplication.update({
      where: { id: loanId },
      data: { status: "fully repaid" },
    });
  }

  return {
    success: true,
    message: "Repayment recorded successfully",
    repayment: newRepayment,
  };
});

export const getAllLoanRepayment = publicProcedure.query(async () => {
  return await prisma.loanRepayment.findMany({ where: { deleted_at: null }, include: { loan: { include: { user: true } } } });
});

export const getGroupedLoanRepayments = publicProcedure.query(async () => {
  // Fetch all loan repayments with loan and user relations
  const repayments = await prisma.loanRepayment.findMany({
    where: { deleted_at: null },
    include: { loan: { include: { user: true } } },
  });

  // Group repayments by loan_id
  const groupedRepayments = repayments.reduce((acc, repayment) => {
    if (!acc[repayment.loan_id]) {
      acc[repayment.loan_id] = {
        loan: repayment.loan,
        repayments: [],
      };
    }
    acc[repayment.loan_id].repayments.push(repayment);
    return acc;
  }, {} as Record<string, { loan: typeof repayments[0]["loan"]; repayments: typeof repayments }>);

  // Return the grouped repayments as an array for easier frontend processing
  return Object.values(groupedRepayments);
});



