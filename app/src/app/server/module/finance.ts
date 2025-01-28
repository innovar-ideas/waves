import { prisma } from "@/lib/prisma";
import { publicProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { AccountTypeEnum, BillStatus, InvoiceStatus, Prisma } from "@prisma/client";
import { accountSchema, billSchema, invoiceSchema, paymentSchema, updateAccountSchema } from "../dtos";
import { generateAccountCode, generateBillNumber, generateInvoiceNumber, updateAccountBalance, updateBankBalance, updateBillStatus, updateInvoiceStatus } from "@/lib/helper-function";


export const downloadAccountStatement = publicProcedure
  .input(
    z.object({
      accountId: z.string(),
      startDate: z.date(),
      endDate: z.date(),
    })
  )
  .mutation(async ({ input }) => {
    const { accountId, startDate, endDate } = input;

    const account = await prisma.accounts.findUnique({
      where: { id: accountId },
      include: {
        account_items: {
          where: {
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
          orderBy: { date: "desc" },
        },
      },
    });

    if (!account) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Account not found",
      });
    }

    // Format data for CSV
    return {
      accountName: account.account_name,
      accountType: account.account_type_enum || "N/A",
      items: account.account_items.map(item => ({
        Date: item.date.toLocaleDateString(),
        Description: item.description,
        Amount: item.amount,
        PaidBy: item.paid_in_by || "N/A",
        Balance: item.amount // You might want to calculate running balance here
      }))
    };
  });

  export const getParentAccounts = publicProcedure
  .input(z.object({ organizationSlug: z.string(), accountType: z.nativeEnum(AccountTypeEnum) }))
  .query(async ({ input }) => {
    const { organizationSlug, accountType } = input;
    return await prisma.accounts.findMany({ where: { organization: { slug: organizationSlug }, account_type_enum: accountType, parent_id: null } });
  });

  export const createAccount = publicProcedure
  .input(accountSchema)
  .mutation(async ({ input }) => {
    const { 
      organization_slug,
      ...accountData 
    } = input;

    const organization = await prisma.organization.findUnique({ 
      where: { slug: organization_slug } 
    });

    if (!organization) {
      throw new TRPCError({ 
        code: "NOT_FOUND", 
        message: "Organization not found" 
      });
    }

    // Generate account code
    const accountCode = await generateAccountCode({
      organizationId: organization.id,
      organizationSlug: organization.slug || "",
      accountType: accountData.account_type_enum,
      accountTypeName: accountData.account_name,
    });

    return await prisma.accounts.create({
      data: {
        ...accountData,
        account_code: accountCode,
        organization_id: organization.id,
        total_amount: 0,
      },
      include: {
        parent_account: true,
        sub_accounts: true
      }
    });
});

export const getAccountTypeDetails = publicProcedure
  .input(z.object({ 
    name: z.nativeEnum(AccountTypeEnum),
    organizationSlug: z.string(),
    dateRange: z.enum(["month", "week", "2months", "custom"]).optional(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    sessionId: z.string().optional(),
    search: z.string().optional(),
    page: z.number().default(1),
    pageSize: z.number().default(10),
  }))
  .query(async ({ input }) => {
    const { 
      name, 
      organizationSlug, 
      dateRange, 
      startDate, 
      endDate, 
      sessionId,
      search,
      page,
      pageSize 
    } = input;

    // Calculate date range
    let dateFilter = {};
    if (dateRange) {
      const now = new Date();
      switch (dateRange) {
        case "month":
          dateFilter = { gte: new Date(now.setMonth(now.getMonth() - 1)) };
          break;
        case "week":
          dateFilter = { gte: new Date(now.setDate(now.getDate() - 7)) };
          break;
        case "2months":
          dateFilter = { gte: new Date(now.setMonth(now.getMonth() - 2)) };
          break;
        case "custom":
          dateFilter = {
            ...(startDate && { gte: startDate }),
            ...(endDate && { lte: endDate })
          };
          break;
      }
    }

    const where = {
      organization: { slug: organizationSlug },
      account_type_enum: name,
      parent_id: null,
      deleted_at: null,
      ...(sessionId && { session_id: sessionId }),
      ...(search && {
        OR: [
          { account_name: { contains: search, mode: "insensitive" as const } },
          { description: { contains: search, mode: "insensitive" as const } }
        ]
      }),
      ...(Object.keys(dateFilter).length > 0 && {
        account_items: {
          some: {
            date: dateFilter
          }
        }
      })
    } as const;

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

  export const getAllExpensesAccounts = publicProcedure
  .input(z.object({ 
    slug: z.string(),
    search: z.string().optional(),
    dateRange: z.enum(["week", "month", "2months", "custom"]).optional(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    sessionId: z.string().optional(),
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
      sessionId,
      page,
      pageSize 
    } = input;

    // Build where clause
    const where: Prisma.AccountsWhereInput = {
      organization: { id: slug },
      account_type_enum: AccountTypeEnum.EXPENSE,
      deleted_at: null,
      parent_id: null,
      ...(search && {
        OR: [
          { account_name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } }
        ]
      }),
      ...(sessionId && { session_id: sessionId }),
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

  export const getInvoices = publicProcedure
  .input(z.object({ 
    organizationSlug: z.string(),
    search: z.string().optional(),
    dateRange: z.enum(["week", "month", "2months", "custom"]).optional(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    sessionId: z.string().optional(),
    status: z.nativeEnum(InvoiceStatus).optional(),
    page: z.number().min(1).default(1),
    pageSize: z.number().min(1).default(10)
  }))
  .query(async ({ input }) => {
    const { 
      organizationSlug, 
      search, 
      dateRange, 
      startDate, 
      endDate, 
      sessionId,
      status,
      page,
      pageSize 
    } = input;

    // Build where clause
    const where: Prisma.InvoiceWhereInput = {
      organization: { id: organizationSlug },
      deleted_at: null,
      ...(search && {
        OR: [
          { customer_name: { contains: search, mode: "insensitive" } },
          { invoice_number: { contains: search, mode: "insensitive" } }
        ]
      }),
      ...(sessionId && { session_id: sessionId }),
      ...(status && { status }),
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
        where.created_at = dateFilter;
      }
    }

    // Get total count for pagination
    const total = await prisma.invoice.count({ where });

    // Get paginated invoices
    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        account_items: true,
        payments: true
      },
      orderBy: { created_at: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      invoices,
      pagination: {
        total,
        pageCount: Math.ceil(total / pageSize),
        page,
        pageSize
      }
    };
  });

  export const getBills = publicProcedure
  .input(z.object({ 
    organizationSlug: z.string(),
    search: z.string().optional(),
    dateRange: z.enum(["week", "month", "2months", "custom"]).optional(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    status: z.nativeEnum(BillStatus).optional(),
    page: z.number().min(1).default(1),
    pageSize: z.number().min(1).default(10)
  }))
  .query(async ({ input }) => {
    const { 
      organizationSlug, 
      search, 
      dateRange, 
      startDate, 
      endDate, 
      status,
      page,
      pageSize 
    } = input;

    // Build where clause
    const where: Prisma.BillWhereInput = {
      organization: { id: organizationSlug },
      deleted_at: null,
      ...(search && {
        OR: [
          { vendor_name: { contains: search, mode: "insensitive" } },
          { bill_number: { contains: search, mode: "insensitive" } }
        ]
      }),
      ...(status && { status }),
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
        where.created_at = dateFilter;
      }
    }

    // Get total count for pagination
    const total = await prisma.bill.count({ where });

    // Get paginated bills
    const bills = await prisma.bill.findMany({
      where,
      include: {
        account_items: true,
        payments: true
      },
      orderBy: { created_at: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      bills,
      pagination: {
        total,
        pageCount: Math.ceil(total / pageSize),
        page,
        pageSize
      }
    };
  });

  export const updateAccount = publicProcedure
  .input(updateAccountSchema)
  .mutation(async ({ input }) => {
    const { id, ...updateData } = input;

    // Verify account exists
    const existingAccount = await prisma.accounts.findUnique({
      where: { id }
    });

    if (!existingAccount) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Account not found"
      });
    }

    // Update the account
    return await prisma.accounts.update({
      where: { id },
      data: updateData,
      include: {
        parent_account: true,
        sub_accounts: true,
      },
    });
  });

  export const getBankAccounts = publicProcedure
  .input(z.object({ 
    organizationSlug: z.string() 
  }))
  .query(async ({ input }) => {
    return await prisma.accounts.findMany({
      where: {
        organization: { id: input.organizationSlug },
        account_type_enum: AccountTypeEnum.BANK,
        deleted_at: null
      },
      select: {
        id: true,
        account_name: true,
        bank_name: true,
        account_number: true,
        is_default: true
      }
    });
  });

  export const getPaymentSources = publicProcedure
  .input(z.object({
    organizationSlug: z.string(),
    sourceType: z.enum(["invoice", "bill", "account"]),
  }))
  .query(async ({ input }) => {
    const { organizationSlug, sourceType } = input;
    let result;

    switch (sourceType) {
      case "invoice":
        result = await prisma.invoice.findMany({
          where: {
            organization: { id: organizationSlug },
            status: "PENDING",
          },
          select: {
            id: true,
            invoice_number: true,
            customer_name: true,
          },
        });
        return result.map(inv => ({
          id: inv.id,
          label: `${inv.invoice_number} - ${inv.customer_name}`,
        }));

      case "bill":
        result = await prisma.bill.findMany({
          where: {
            organization: { id: organizationSlug },
            status: "PENDING",
          },
          select: {
            id: true,
            bill_number: true,
            vendor_name: true,
          },
        });
        return result.map(bill => ({
          id: bill.id,
          label: `${bill.bill_number} - ${bill.vendor_name}`,
        }));

      case "account":
        result = await prisma.accounts.findMany({
          where: {
            organization: { id: organizationSlug },
            account_type_enum: {
              notIn: [AccountTypeEnum.BANK, AccountTypeEnum.CREDIT_CARD],
            },
          },
          select: {
            id: true,
            account_name: true,
          },
        });
        return result.map(acc => ({
          id: acc.id,
          label: acc.account_name,
        }));
    }
  });

  export const createPayment = publicProcedure
  .input(paymentSchema)
  .mutation(async ({ input }) => {
    return await prisma.$transaction(async (tx) => {
      // 1. Get all required data in a single query
      const [organization, sourceAccount, bankAccount] = await Promise.all([
        tx.organization.findUnique({ 
          where: { slug: input.organization_slug },
          select: { id: true }
        }),
        input.account_id ? tx.accounts.findUnique({
          where: { id: input.account_id },
          select: {
            account_type_enum: true,
            account_name: true,
          }
        }) : null,
        input.bank_account_id ? tx.accounts.findUnique({
          where: { id: input.bank_account_id },
          select: {
            account_type_enum: true,
            account_name: true,
          }
        }) : null
      ]);

      // 2. Validate existence
      if (!organization) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Organization not found" });
      }
      if (input.account_id && !sourceAccount) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Account not found" });
      }
      if (input.bank_account_id && !bankAccount) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Bank account not found" });
      }

      // 3. Create payment record
      const payment = await tx.payment.create({
        data: {
          amount: input.amount,
          payment_date: input.payment_date,
          payment_method: input.payment_method,
          reference: input.reference,
          bank_reference: input.bank_reference,
          description: input.description,
          transaction_type: input.transaction_type,
          ...(input.bank_account_id ? { account_id: input.bank_account_id } : {}),
          ...(input.invoice_id ? { invoice_id: input.invoice_id } : {}),
          ...(input.bill_id ? { bill_id: input.bill_id } : {}),
          organization_id: organization.id,
        }
      });

      // 4. Create source account item if needed
      if (sourceAccount) {
        const accountCode = await generateAccountCode({
          organizationId: organization.id,
          organizationSlug: input.organization_slug,
          accountType: sourceAccount.account_type_enum,
          accountTypeName: sourceAccount.account_name,
        });
        
        await tx.accountItem.create({
          data: {
            description: input.description || "",
            paid_in_by: input.reference,
            amount: input.amount,
            quantity: 1,
            price: 0,
            date: input.payment_date,
            account_id: input.account_id!,
            item_code: accountCode,
            payment: {
              connect: { id: payment.id }
            }
          }
        });
      }

      // 5. Create bank account item if needed
      if (bankAccount) {
        const bankAccountCode = await generateAccountCode({
          organizationId: organization.id,
          organizationSlug: input.organization_slug,
          accountType: bankAccount.account_type_enum,
          accountTypeName: bankAccount.account_name,
        });

        await tx.accountItem.create({
          data: {
            amount: input.amount,
            description: `${input.description} (Bank Transaction)`,
            date: input.payment_date,
            account_id: input.bank_account_id!,
            paid_in_by: input.reference,
            quantity: 1,
            price: 0,
            item_code: bankAccountCode,
            payment: {
              connect: { id: payment.id }
            }
          }
        });
      }

      // 6. Update source document status if applicable
      if (input.invoice_id) {
        await updateInvoiceStatus(tx, input.invoice_id, input.amount);
      }
      if (input.bill_id) {
        await updateBillStatus(tx, input.bill_id, input.amount);
      }

      // 7. Update balances
      if (bankAccount) {
        const transactionType = (
          sourceAccount?.account_type_enum === AccountTypeEnum.INCOME || 
          input.invoice_id
        ) ? "INFLOW" : (
          sourceAccount?.account_type_enum === AccountTypeEnum.EXPENSE ||
          input.bill_id
        ) ? "OUTFLOW" : "INFLOW";
        await updateBankBalance(tx, input.bank_account_id!, input.amount, transactionType);
      }

      if (sourceAccount) {
        await updateAccountBalance(tx, input.account_id!, input.amount, input.transaction_type);
      }

      return payment;
    });
  });

  export const getExpenseAccounts = publicProcedure
  .input(z.object({ organizationSlug: z.string() }))
  .query(async ({ input }) => {
    const { organizationSlug } = input;
    return await prisma.accounts.findMany({ where: { organization: { id: organizationSlug }, account_type_enum: AccountTypeEnum.EXPENSE, parent_id: null } });
  });

  export const getCashFlow = publicProcedure
  .input(
    z.object({
      organizationSlug: z.string(),

    })
  )
  .query(async ({ input }) => {
    const { organizationSlug} = input;

    // Get accounts with their items
    const accounts = await prisma.accounts.findMany({
      where: {
        organization: { slug: organizationSlug },
        deleted_at: null,
      },
      include: {
        account_items: {
          orderBy: {
            date: "asc",
          },
        },
      },
    });

    // Group by month for the chart
    const monthlyData = accounts.reduce((acc, account) => {
      account.account_items.forEach(item => {
        const month = item.date.toLocaleString("default", { month: "short" }).toUpperCase();
        if (!acc[month]) {
          acc[month] = { in: 0, out: 0 };
        }
        if (account.account_type_enum === AccountTypeEnum.INCOME) {
          acc[month].in += item.amount;
        } else {
          acc[month].out += item.amount;
        }
      });
      return acc;
    }, {} as Record<string, { in: number; out: number }>);

    // Calculate totals
    const totals = accounts.reduce((acc, account) => {
      const total = account.account_items.reduce((sum, item) => sum + item.amount, 0);
      if (account.account_type_enum === AccountTypeEnum.INCOME) {
        acc.totalIn += total;
      } else {
        acc.totalOut += total;
      }
      return acc;
    }, { totalIn: 0, totalOut: 0 });

    // Format data for the table
    const tableData = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      in: data.in,
      out: data.out,
    }));

    return {
      chartData: Object.entries(monthlyData).map(([name, data]) => ({
        name,
        value: data.in - data.out,
      })),
      tableData,
      totals,
    };
  });

  export const getPayments = publicProcedure
  .input(
    z.object({
      organizationSlug: z.string(),
      page: z.number().default(1),
      pageSize: z.number().default(10),
      searchTerm: z.string().optional(),
      transactionType: z.enum(["ALL", "INFLOW", "OUTFLOW"]).default("ALL"),
      paymentMethod: z.enum(["ALL", "CASH", "BANK_TRANSFER", "CARD", "CHEQUE"]).default("ALL"),
    })
  )
  .query(async ({ input }) => {
    const { 
      organizationSlug, 
      page, 
      pageSize, 
      searchTerm,
      transactionType,
      paymentMethod,
    } = input;

    // Build where clause
    const where: Prisma.PaymentWhereInput = {
      organization: { slug: organizationSlug },
    };

    // Add transaction type filter
    if (transactionType !== "ALL") {
      where.transaction_type = transactionType;
    }

    // Add payment method filter
    if (paymentMethod !== "ALL") {
      where.payment_method = paymentMethod;
    }

    // Add search filter
    if (searchTerm) {
      where.OR = [
        { description: { contains: searchTerm, mode: "insensitive" } },
        { reference: { contains: searchTerm, mode: "insensitive" } },
        { invoice: { invoice_number: { contains: searchTerm, mode: "insensitive" } } },
        { bill: { bill_number: { contains: searchTerm, mode: "insensitive" } } },
      ];
    }

    // Get total count for pagination
    const total = await prisma.payment.count({ where });

    // Get paginated payments
    const payments = await prisma.payment.findMany({
      where,
      include: {
        invoice: true,
        bill: true,
        account: true,
        account_item: true,
        organization: {
          select: {
            name: true,
            contact_email: true,
            contact_phone_number: true,
            preferences: {
              where: {
                name: { in: ["primary_color", "largeLogo"] }
              }
            }
          }
        }
      },
      orderBy: { payment_date: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    // Calculate totals for summary cards
    const totals = await prisma.payment.groupBy({
      by: ["transaction_type"],
      where: {
        organization: { slug: organizationSlug },
      },
      _sum: {
        amount: true,
      },
    });

    const totalInflow = totals.find(t => t.transaction_type === "INFLOW")?._sum.amount || 0;
    const totalOutflow = totals.find(t => t.transaction_type === "OUTFLOW")?._sum.amount || 0;

    return {
      payments,
      pagination: {
        total,
        pageCount: Math.ceil(total / pageSize),
        page,
        pageSize,
      },
      summary: {
        totalInflow,
        totalOutflow,
        netCashFlow: totalInflow - totalOutflow,
      },
    };
  });

  export const createBill = publicProcedure
  .input(billSchema)
  .mutation(async ({ input }) => {
    const organization = await prisma.organization.findUnique({
      where: { slug: input.organization_slug },
      select: { id: true }
    });

   

    if (!organization?.id) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Organization not found" });
    }

    // Calculate total amount from line items
    const totalAmount = input.line_items?.reduce((sum, item) => sum + item.amount, 0) ?? 0  ;

    // Create bill
    const bill = await prisma.bill.create({
      data: {
        vendor_name: input.vendor_name,
        vendor_id: input.vendor_id,
        account_id: input.account_id,
        amount: totalAmount,
        balance_due: totalAmount,
        due_date: input.due_date,
        status: "PENDING",
        organization_id: organization.id,
        bill_number: await generateBillNumber({ organizationId: organization.id, organizationSlug: input.organization_slug }),
      }
    });

    // Create line items
    if (input.line_items) {
    await Promise.all(input.line_items.map(item =>
      prisma.accountItem.create({
        data: {
          description: item.description,
          quantity: item.quantity,
          price: item.price,
          amount: item.amount,
          date: input.due_date,
          bill_id: bill.id,
        }
      })
    ));
  }

    return bill;
  });

  export const getIncomeAccounts = publicProcedure
  .input(z.object({ organizationSlug: z.string() }))
  .query(async ({ input }) => {
    const { organizationSlug } = input;
    return await prisma.accounts.findMany({ where: { organization: { id: organizationSlug }, account_type_enum: AccountTypeEnum.INCOME, parent_id: null } });
  });

  export const createInvoice = publicProcedure
  .input(invoiceSchema)
  .mutation(async ({ input }) => {
    const organization = await prisma.organization.findUnique({
      where: { id: input.organization_slug },
      select: { id: true }
    });

    if (!organization) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Organization not found" });
    }

    // Calculate total amount from line items
    const totalAmount = (input?.line_items && input.line_items.length > 0 )? input.line_items?.reduce((sum, item) => sum + item.amount, 0): 0;

    // Create invoice
    const invoice = await prisma.invoice.create({
      data: {
        customer_name: input.customer_name,
        customer_id: input.customer_id,
        account_id: input.account_id,
        amount: totalAmount,
        balance_due: totalAmount,
        due_date: input.due_date,
        status: "DRAFT",
        organization_id: organization.id,
        invoice_number: await generateInvoiceNumber({organizationId: organization.id, organizationSlug: input.organization_slug}),
      }
    });

    // Create line items
    if (input.line_items) {
    await Promise.all(input.line_items.map(item =>
      prisma.accountItem.create({
        data: {
          description: item.description,
          quantity: item.quantity,
          price: item.price,
          amount: item.amount,
          date: input.due_date,
          invoice_id: invoice.id,
        }
      })
    ));
  }

    return invoice;
  });