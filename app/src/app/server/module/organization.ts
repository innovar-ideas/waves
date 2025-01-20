import { prisma } from "@/lib/prisma";
import { publicProcedure } from "../trpc";
import { createOrganizationSchema, findByIdSchema } from "../dtos";
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

export const getActiveOrganization = publicProcedure.input(findByIdSchema).query(async (opts) => {
  return await prisma.organization.findUnique({ where: { slug: opts.input.id }, include: { preferences: true } });
});