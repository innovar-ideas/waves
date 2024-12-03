import { publicProcedure } from "../trpc";
import { createPolicyAndProcedureSchema, updatePolicyAndProcedureSchema } from "../dtos";
import { prisma } from "@/lib/prisma";
import { z } from "zod";


export const createPolicyAndProcedure = publicProcedure.input(createPolicyAndProcedureSchema).mutation(async ({ input}) => {
  const { title, content, organization_id, team_id, created_by } = input;

  const policyAndProcedure = await prisma.policyAndProcedure.create({
    data: {
      title, content, organization_id, team_id, created_by
    }
  })

  return policyAndProcedure;
});

export const updatePolicyAndProcedure = publicProcedure.input(updatePolicyAndProcedureSchema).mutation(async ({ input }) => {
  console.log(input,"input   !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!===");
  const { id, title, content, team_id, status, is_approved, approved_by } = input;
if(team_id === "" || team_id === null || !team_id){
  try {
    const policyAndProcedure = await prisma.policyAndProcedure.update({
    where: { id },
      data: { title, content, status, is_approved, approved_by }
    });

    return policyAndProcedure;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to update policy and procedure");
  }
}
  try {
    const policyAndProcedure = await prisma.policyAndProcedure.update({
    where: { id },
      data: { title, content, team_id, status, is_approved, approved_by }
    });

    return policyAndProcedure;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to update policy and procedure");
  }
});

export const deletePolicyAndProcedure = publicProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
  const { id } = input;
  await prisma.policyAndProcedure.update({ where: { id }, data: { deleted_at: new Date() } });
});

export const getPolicyAndProcedureById = publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
  const { id } = input;
  return await prisma.policyAndProcedure.findUnique({ 
    where: { 
      id, 
      deleted_at: null 
    }, 
    include: { 
      createdBy: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
        }
      },
      approvedBy: {
        select: {
          id: true, 
          first_name: true,
          last_name: true,
        }
      },
      team: {
        select: {
          id: true,
          name: true
        }
      }
    } 
  });
}); 
export const getAllPolicyAndProcedureByOrganization = publicProcedure.input(z.object({ organization_id: z.string()})).query(async ({ input }) => {
  const { organization_id } = input;
  return await prisma.policyAndProcedure.findMany({ where: { organization_id, deleted_at: null }, include: { createdBy: true, approvedBy: true }, orderBy: { created_at: "desc" } });
}); 
export const approvePolicyAndProcedure = publicProcedure.input(updatePolicyAndProcedureSchema).mutation(async ({ input }) => {
  const { id, approved_by } = input;
  await prisma.policyAndProcedure.update({ where: { id, deleted_at: null }, data: { is_approved: true, approved_by,  } });
});