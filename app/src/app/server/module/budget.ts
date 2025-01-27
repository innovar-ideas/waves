import { BudgetStatus, Prisma } from "@prisma/client";
import { publicProcedure } from "../trpc";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateItemCode } from "@/lib/helper-function";
import { TRPCError } from "@trpc/server";


export const getBudgets = publicProcedure
  .input(
    z.object({
      organizationSlug: z.string(),
      page: z.number().default(1),
      pageSize: z.number().default(10),
      search: z.string().optional(),
      status: z.enum(["APPROVED", "NOT_APPROVED"]).optional(),
    })
  )
  .query(async ({ input }) => {
    const { organizationSlug, page, pageSize, search, status } = input;
    const where: Prisma.BudgetWhereInput = {
      organization: { id: organizationSlug },
      ...(search && {
        name: {
          contains: search,
          mode: Prisma.QueryMode.insensitive,
        },
      }),
      ...(status && { status }),
    };

    const budgets = await prisma.budget.findMany({
      where,
      include: {
        items: {
          orderBy: {
            description: "asc",
          },
        },
      },
      orderBy: {
        id: "desc",
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const total = await prisma.budget.count({ where });

    return { budgets, total };
  });

  export const updateBudgetStatus = publicProcedure
  .input(
    z.object({
      id: z.string(),
      status: z.enum([BudgetStatus.APPROVED, BudgetStatus.NOT_APPROVED]),
    })
  )
  .mutation(async ({ input }) => {
    return prisma.budget.update({
      where: { id: input.id },
      data: { status: input.status },
    });
  });

  export const updateBudget = publicProcedure
  .input(
    z.object({
      id: z.string(),
      name: z.string(),
      session_id: z.string(),
      expense_account_id: z.string().optional(),
      items: z.array(
        z.object({
          name: z.string(),
          amount: z.number(),
        })
      ),
    })
  )
  .mutation(async ({ input }) => {
    const totalAmount = input.items.reduce((sum, item) => sum + item.amount, 0);
    const amountSpent = (await prisma.budget.findUnique({ where: { id: input.id } }))?.amount_spent ?? 0;

    // Update the budget and its items
    const budget = await prisma.budget.update({
      where: { id: input.id },
      data: {
        name: input.name,
        budgeted_amount: totalAmount,
        balance: totalAmount - amountSpent,
        ...(input.expense_account_id && { expense_account: { connect: { id: input.expense_account_id } } }),
        items: {
          deleteMany: {},  // Delete existing items
          create: input.items.map(item => ({
            description: item.name,
            budgeted_amount: item.amount,
            amount: 0,
            paid_in_by: "",
            date: new Date(),
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return budget;
  });

  export const createBudget = publicProcedure
  .input(
    z.object({
      name: z.string(),
      organizationSlug: z.string(),
      expense_account_id: z.string().optional(),
      items: z.array(
        z.object({
          name: z.string(),
          amount: z.number(),
        })
      ),
    })
  )
  .mutation(async ({ input }) => {
    const totalAmount = input.items.reduce((sum, item) => sum + item.amount, 0);

    const budget = await prisma.budget.create({
      data: {
        name: input.name,
        organization: { connect: { id: input.organizationSlug } },
        budgeted_amount: totalAmount,
        amount_spent: 0,
        balance: totalAmount,
        status: BudgetStatus.NOT_APPROVED,
        ...(input.expense_account_id && { expense_account: { connect: { id: input.expense_account_id } } }),
        items: {
          create: await Promise.all(input.items.map(async (item) => ({
            description: item.name,
            budgeted_amount: item.amount,
            amount: 0,
            paid_in_by: "",
            date: new Date(),
            item_code: await generateItemCode({
              accountId: input.expense_account_id,
            }),
          }))),
        },
      },
      include: {
        items: true,
      },
    });

    return budget;
  });

  export const updateBudgetItemsSpent = publicProcedure
  .input(
    z.array(
      z.object({
        id: z.string(),
        amount_spent: z.number(),
        paid_in_by: z.string(),
      })
    )
  )
  .mutation(async ({ input }) => {
    const results = await Promise.all(
      input.map(async (item) => {
        const budgetItem = await prisma.accountItem.update({
          where: { id: item.id },
          data: {
            amount: item.amount_spent,
            paid_in_by: item.paid_in_by,
          },
        });

        const budget = await prisma.budget.findUnique({
          where: { id: budgetItem.budget_id ?? "" },
          include: {
            items: true,
          },
        });
        const expenseAccount = await prisma.account.findUnique({
          where: { id: budget?.expense_account_id ?? "" }
        });

        const totalSpent = budget?.items.reduce((sum, item) => sum + item.amount, 0);
        const totalBalance = (budget?.budgeted_amount ?? 0) - (totalSpent ?? 0);

        if (budget) {
          await prisma.budget.update({
            where: { id: budget.id },
            data: {
              amount_spent: totalSpent,
              balance: totalBalance,
            },
          });
        }
        if (expenseAccount) {
          await prisma.account.update({
            where: { id: expenseAccount.id },
            data: {
              total_amount: expenseAccount.total_amount + item.amount_spent,
            },
          });
        }

        return { budgetItem, budget };
      })
    );

    return results;
  });

  export const getBudget = publicProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ input }) => {
    const budget = await prisma.budget.findUnique({
      where: { id: input.id },
      include: {
        items: {
          orderBy: {
            description: "asc",
          },
        },
      },
    });

    if (!budget) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Budget not found",
      });
    }

    return budget;
  });

