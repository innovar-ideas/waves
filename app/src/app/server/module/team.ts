import { prisma } from "@/lib/prisma";
import { publicProcedure } from "../trpc";
import { createTeamSchema, staffByIdSchema } from "../dtos";

export const createTeam = publicProcedure.input(createTeamSchema).mutation(async (opts)=>{
  const team = await prisma.team.create({
    data: {
      name: opts.input.name ?? "",
      description: opts.input.description ?? "",
      parent_team_id: opts.input.parent_id,
      organization_id: opts.input.organization_id ?? ""

    }
  });

  return team;

});

export const getAllTeams = publicProcedure.query(async ()=>{
  return await prisma.team.findMany({ where: { deleted_at: null }, include: {childTeams: true} });
});

export const getAllParentTeams = publicProcedure.query(async ()=>{
  return await prisma.team.findMany({ where: { deleted_at: null, parent_team_id: null }, include: {childTeams: true} });
});

export const getSingleTeamById = publicProcedure.input(staffByIdSchema).query(async (opts) => {
  return await prisma.team.findFirst({
    where: {
      id: opts.input.id,
      deleted_at: null,
      parent_team_id: null
    },
    include: { childTeams: true}
  });
});

export const getAllTeamMember = publicProcedure
  .input(staffByIdSchema)
  .query(async (opts) => {
    const team = await prisma.team.findFirst({
      where: {
        id: opts.input.id,
        deleted_at: null,
        // parent_team_id: null,
      },
      include: {
        designations: {
          include: {
            staffs: {
              include: {
                user: true,
                team_designation: {include: {designation: true}}
              },
            },
          },
        },
      },
    });

    if (!team) {
      return []; // Handle case where team is not found
    }

    // Flatten all staffs from designations
    const allStaffs = team.designations.flatMap((designation) => designation.staffs);

    return allStaffs;
  });
