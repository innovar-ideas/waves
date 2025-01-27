import { prisma } from "@/lib/prisma";
import { publicProcedure } from "../trpc";
import { z } from "zod";
import { AccountTypeEnum, Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { accountSchema } from "../dtos";
import { generateAccountCode } from "@/lib/utils";

export const getAllIncomeAccounts = publicProcedure
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
    const where: Prisma.AccountWhereInput = {
      organization: { id: slug },
      account_type_enum: AccountTypeEnum.INCOME,
      deleted_at: null,
      parent_id: null,
      ...(search && {
        OR: [
          { account_name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } }
        ]
      }),
      // ...(sessionId && { session_id: sessionId }),
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
    const total = await prisma.account.count({ where });

    // Get paginated accounts
    const accounts = await prisma.account.findMany({
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

  export const createIncome = publicProcedure.input(accountSchema).mutation(async (opts) => {
    const {  account_name,  } = opts.input;
  
    const organization = await prisma.organization.findUnique({ where: { id: opts.input.organization_slug } });
  
    if (organization === null) {
      console.error("Could not find organization with slug >> ");
  
      throw new TRPCError({ code: "NOT_FOUND", message: "Could not find organization with slug" });
    }
  
    const createdAccount = await prisma.account.create({
      data: {
        account_name,
        account_type_enum: AccountTypeEnum.INCOME,
        account_code: await generateAccountCode({
          organizationId: organization.id,
          accountType: AccountTypeEnum.INCOME,
          accountTypeName: "INCOME",
        }),
        total_amount: 0,
        organization_id: organization.id,
      
      },
    });
  
  
  
    return createdAccount;
  });