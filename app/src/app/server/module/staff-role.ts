import { prisma } from "@/lib/prisma";
import { publicProcedure } from "../trpc";
import { staffRoleSchema } from "../dtos";

export const createStaffRole = publicProcedure.input(staffRoleSchema).mutation(async (opts)=>{
  const user = await prisma.staffRole.create({
    data: {
      description: opts.input.description as string

    }
  });

  return user;

});

export const getAllStaffRole = publicProcedure.query(async ()=>{
  return await prisma.staffRole.findMany({ where: { deleted_at: null }, include: {staff_profile: true} });
});