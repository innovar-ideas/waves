import { prisma } from "@/lib/prisma";
import { publicProcedure } from "../trpc";
import { createTeamSchema, staffByIdSchema } from "../dtos";
import { auth } from "@/auth";

export const createTeam = publicProcedure.input(createTeamSchema).mutation(async (opts) => {
  const team = await prisma.team.create({
    data: {
      name: opts.input.name ?? "",
      description: opts.input.description ?? "",
      parent_team_id: opts.input.parent_id ?? "",
      organization_id: opts.input.organization_id ?? ""

    }
  });

  return team;

});

export const getAllTeams = publicProcedure.query(async () => {
  
  return await prisma.team.findMany({ where: { deleted_at: null}, include: { childTeams: true } });
});

export const getAllParentTeams = publicProcedure.query(async () => {

  const session = await auth();

  return await prisma.team.findMany({ where: { deleted_at: null, parent_team_id: null, organization_id: session?.user.organization_id as string }, include: { childTeams: true } });
});

export const getSingleTeamById = publicProcedure.input(staffByIdSchema).query(async (opts) => {
  return await prisma.team.findFirst({
    where: {
      id: opts.input.id,
      deleted_at: null,
      parent_team_id: null
    },
    include: { childTeams: true }
  });
});

export const getAllTeamMember = publicProcedure
  .input(staffByIdSchema)
  .query(async (opts) => {
    const team = await prisma.team.findFirst({
      where: {
        id: opts.input.id,
        deleted_at: null,
      },
      include: {
        designations: {
          include: {
            staffs: {
              include: {
                user: true,
                team_designation: { include: { designation: true } }
              },
            },
          },
        },
      },
    });

    if (!team) {
      return [];
    }

    const allStaffs = team.designations.flatMap((designation) => designation.staffs);

    return allStaffs;
  });

export const getTeamsByOrganizationId = publicProcedure.input(staffByIdSchema).query(async (opts) => {
  return await prisma.team.findMany({
    where: {
      organization_id: opts.input.id,
      deleted_at: null,
    },
    include: { childTeams: true, designations: true }
  });
});

export const getUniqueTeamsFromTeamDesignationsByOrganizationId = publicProcedure.input(staffByIdSchema).query(async (opts) => {
  return await prisma.teamDesignation.findMany({
    where: {
      team: { organization: { id: opts.input.id } },
      deleted_at: null,
    },
    distinct: ["team_id"],
    include: { team: true }
  });
});

export const getTeamDesignationsByTeamId = publicProcedure.input(staffByIdSchema).query(async (opts) => {
  return await prisma.teamDesignation.findMany({
    where: {
      team_id: opts.input.id,
      deleted_at: null,
    },
    include: { designation: true }
  });
});
