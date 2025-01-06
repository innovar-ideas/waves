import { prisma } from "@/lib/prisma";
import { publicProcedure } from "../trpc";
import { bankEditableTableSchema, createBankSchema, findByIdSchema } from "../dtos";
import { auth } from "@/auth";

export const editBankTable = publicProcedure.input(bankEditableTableSchema).mutation(async (opts) => {

  const session = await auth();

  if(!session){

  }

  for (const item of opts.input) {
      await prisma.bank.update({
        where: { id: item.id },
        data: { sort_code: item.sort_code, organization_id: item.organization_id }
      });
  }


  return "success";

});

export const getAllBanks = publicProcedure.query(async () => {
  return await prisma.bank.findMany({ where: { deleted_at: null}, include: { organization: true } });
});

export const createBank = publicProcedure.input(createBankSchema).mutation(async (opts) => {
  const bank = await prisma.bank.create({
    data: {
      name: opts.input.name,
      sort_code: opts.input.sort_code ?? "",
      organization_id: opts.input.organization_id,
    }
  });

  return bank;
});

export const getAllBanksByOrganizationId = publicProcedure.input(findByIdSchema).query(async (opts) => {
  try {
    const bank = await prisma.bank.findMany({
      where: {
        organization_id: opts.input.id,
        deleted_at: null,
      },
      include: {
        organization: true
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return bank;
  } catch (error) {
    console.error("Error fetching banks:", error);
    throw new Error("Failed to fetch banks");
  }
});