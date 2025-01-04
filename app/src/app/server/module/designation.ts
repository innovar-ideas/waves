import { prisma } from "@/lib/prisma";
import { publicProcedure } from "../trpc";
import { createDesignationSchema, designationUserSchema, updateDesignationSchema, updateTeamDesignationSchema } from "../dtos";
import { z } from "zod";

export type TeamDesignationType = {
  id?: string;
  name?: string;
  team_id?: string;
  designation_id?: string;
  quantity?: number;
  role_level?: number;
  vacancies?: number;
  description?: string | null;
  job_description?: string | null;
  organization_id?: string;
  team_name?: string;
  designation_name?: string;
  number_of_staffs?: number;
  team?: {
    id?: string;
    name?: string;
    description?: string | null;
  };
  created_at: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
};

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

export const updateTeamDesignation = publicProcedure.input(updateTeamDesignationSchema).mutation(async (opts) => {
  return await prisma.teamDesignation.upsert({
    where: { 
      team_id_designation_id: {
        team_id: opts.input.team_id,
        designation_id: opts.input.designation_id
      }
    },
    update: { 
      quantity: opts.input.quantity ?? 0,
      team_job_description: opts.input.team_job_description ?? "",
      organization_id: opts.input.organization_id,
      team_id: opts.input.team_id,
      designation_id: opts.input.designation_id,
      staffs: {
        connect: opts.input.staffs?.map(id => ({ id })) ?? []
      }
    },
    create: { 
      team_id: opts.input.team_id,
      designation_id: opts.input.designation_id,
      quantity: opts.input.quantity ?? 0,
      team_job_description: opts.input.team_job_description ?? "",
      organization_id: opts.input.organization_id,
      staffs: {
        connect: opts.input.staffs?.map(id => ({ id })) ?? []
      }
    }
  });
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
export const getAllTeamDesignationsByOrganizationId = publicProcedure.input(z.object({
  id: z.string()
})).query(async (opts) => {
  try {
    const teamDesignations = await prisma.teamDesignation.findMany({
      where: {
        organization_id: opts.input.id,
        deleted_at: null,
      },
      include: {
        designation: {
          select: {
            name: true,
            job_description: true,
            role_level: true,
            quantity: true,
            id: true,
          },
        },
        team: {
          select: {
            name: true,
            description: true,
            id: true,
          },
        },
        staffs: {
          include: {
            user: {
              select: {
                first_name: true,
                last_name: true,
                email: true,
                id: true,
              },
            },
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return teamDesignations;
  } catch (error) {
    console.error("Error fetching teamDesignations:", error);
    throw new Error("Failed to fetch team designations");
  }
});


export const updateDesignation = publicProcedure.input(updateDesignationSchema).mutation(async (opts) => {

   await prisma.teamDesignation.update({
    where: { id: opts.input.id },
    data: {team_id: opts.input.team_id, 
    quantity: opts.input.quantity,
    }
  });
return await prisma.designation.update({
  where: { id: opts.input.designation_id },
  data: { name: opts.input.name ?? "", 
    description: opts.input.description ?? "" ,
    role_level: opts.input.role_level ?? 0,
    quantity: opts.input.quantity ?? 0,
    job_description: opts.input.job_description ?? ""
  }
});
});
