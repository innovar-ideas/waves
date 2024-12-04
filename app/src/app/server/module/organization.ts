import { prisma } from "@/lib/prisma";
import { publicProcedure } from "../trpc";
import { createOrganizationSchema } from "../dtos";
import { generateUniqueToken } from "@/lib/helper-function";

export const createOrganization = publicProcedure.input(createOrganizationSchema).mutation(async (opts) => {
  const token = await generateUniqueToken();

  const organization = await prisma.organization.create({
    data: {
      name: opts.input.name,
      slug: opts.input.slug,
      token
    }
  });

  return organization;

});

export const getAllOrganization = publicProcedure.query(async () => {
  return await prisma.organization.findMany({ where: { deleted_at: null } });
});