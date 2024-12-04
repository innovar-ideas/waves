import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { publicProcedure } from "../trpc";
import { createAdminSchema } from "../dtos";
import { userRoleNames } from "@/lib/constants";

export const createAdmin = publicProcedure.input(createAdminSchema).mutation(async (opts) => {

  const admin = await prisma.user.create({
    data: {
      first_name: opts.input.first_name,
      last_name: opts.input.last_name,
      email: opts.input.email,
      phone_number: opts.input.phone_number,
      password: bcrypt.hashSync(opts.input.password as string, 10),
      organization_id: opts.input.organization_id,

    }
  });

  await prisma.userRole.create({
    data: {
      role_name: userRoleNames.admin,
      user_id: admin.id
    }
  });

  return admin;

});

export const getAllAdmins = publicProcedure.query(async () => {
  return await prisma.user.findMany({ where: { deleted_at: null, roles: { some: { role_name: userRoleNames.admin } } }, include: { organization: true } });
});