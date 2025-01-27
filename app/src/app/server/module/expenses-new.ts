import { TRPCError } from "@trpc/server";
import { accountSchema } from "../dtos";
import { publicProcedure } from "../trpc";
import { generateAccountCode } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { AccountTypeEnum } from "@prisma/client";


export const createExpenses = publicProcedure.input(accountSchema).mutation(async (opts) => {
 

  const organization = await prisma.organization.findUnique({ where: { id: opts.input.organization_slug } });

  if (organization === null) {
    console.error("Could not find organization with slug >> ");

    throw new TRPCError({ code: "NOT_FOUND", message: "Could not find organization with slug" });
  }


  const accountCode = await generateAccountCode({organizationId: organization.id, accountType: AccountTypeEnum.EXPENSE, accountTypeName: opts.input.account_name});

  const createdAccount = await prisma.account.create({
    data: {
      account_name: opts.input.account_name,
      account_type_enum: AccountTypeEnum.EXPENSE,
      total_amount: 0,
      account_code: accountCode,
      organization_id: organization.id,
    },
  });



  return createdAccount;
});