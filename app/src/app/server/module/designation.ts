import { prisma } from "@/lib/prisma";
import { publicProcedure } from "../trpc";
import { createDesignationSchema, designationUserSchema } from "../dtos";

export const createDesignation = publicProcedure.input(createDesignationSchema).mutation(async (opts) => {
  const designation = await prisma.designation.create({
    data: {
      name: opts.input.name ?? "",
      description: opts.input.description ?? "",
      quantity: opts.input.quantity ?? 0,

    }
  });

  await prisma.teamDesignation.create({
    data: {
      team_id: opts.input.team_id ?? "",
      designation_id: designation.id,
      quantity: opts.input.quantity ?? 0,
      team_job_description: opts.input.team_job_description,
      organization_id: opts.input.organization_id as string
    }
  });

  return designation;

});

export const getAllDesignation = publicProcedure.query(async () => {
  return await prisma.designation.findMany({ where: { deleted_at: null }, include: { teamDesignations: true } });
});

export const getAllTeamDesignation = publicProcedure.query(async () => {
  return await prisma.teamDesignation.findMany({ where: { deleted_at: null }, include: { designation: true, team: true, staffs: true } });
});

export const designateStaff = publicProcedure.input(designationUserSchema).mutation(async (opts) => {
  return await prisma.staffProfile.update({
    where: { id: opts.input.staff_id, deleted_at: null },
    data: { team_designation_id: opts.input.team_designation_id }
  });

});