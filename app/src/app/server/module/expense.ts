import { prisma } from "@/lib/prisma";
import { createExpenseSchema } from "../dtos";
import { publicProcedure } from "../trpc";
import { z } from "zod";
import { AccountTypeEnum, Prisma } from "@prisma/client";


export const createExpense = publicProcedure.input(createExpenseSchema).mutation(async (opts) => {
  const organization = await prisma.organization.findUnique({ where: { id: opts.input.slug } });

  const expense = await prisma.expense.create({
    data: {
      organization_id: organization?.id ?? "",
      line_items: opts.input.lineItems,
      amount: parseFloat(opts.input.amount),
      description: opts.input.description,
      category_id: opts.input.categoryId,
      created_by: opts.input.createdBy,
      status: "PENDING_APPROVAL",
    },
  });

  return { expense: expense };
});

export const getAllExpensesAccounts = publicProcedure
  .input(z.object({ 
    slug: z.string(),
    search: z.string().optional(),
    dateRange: z.enum(["week", "month", "2months", "custom"]).optional(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    page: z.number().min(1).default(1),
    pageSize: z.number().min(1).default(10)
  }))
  .query(async ({ input }) => {
    const { 
      slug, 
      search, 
      dateRange, 
      startDate, 
      endDate, 
      page,
      pageSize 
    } = input;

    // Build where clause
    const where: Prisma.AccountsWhereInput = {
      organization: { slug },
      account_type_enum: AccountTypeEnum.EXPENSE,
      deleted_at: null,
      parent_id: null,
      ...(search && {
        OR: [
          { account_name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } }
        ]
      }),
    };

    // Add date filtering
    if (dateRange || (startDate && endDate)) {
      let dateFilter: { gte?: Date; lte?: Date } = {};
      
      if (dateRange === "week") {
        dateFilter.gte = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      } else if (dateRange === "month") {
        dateFilter.gte = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      } else if (dateRange === "2months") {
        dateFilter.gte = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
      } else if (startDate && endDate) {
        dateFilter = {
          gte: startDate,
          lte: endDate
        };
      }

      if (Object.keys(dateFilter).length > 0) {
        where.account_items = {
          some: {
            date: dateFilter
          }
        };
      }
    }

    // Get total count for pagination
    const total = await prisma.accounts.count({ where });

    // Get paginated accounts
    const accounts = await prisma.accounts.findMany({
      where,
      include: {
        account_items: true,
        sub_accounts: {
          include: {
            account_items: true,
            sub_accounts: {
              include: {
                account_items: true,
                sub_accounts: {
                  include: {
                    account_items: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { created_at: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      accounts,
      pagination: {
        total,
        pageCount: Math.ceil(total / pageSize),
        page,
        pageSize
      }
    };
  });