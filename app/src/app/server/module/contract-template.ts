import { prisma } from "@/lib/prisma";
import { publicProcedure } from "../trpc";
import { contractTemplateSchema } from "../dtos";
import { z } from "zod";

export const createContractTemplate = publicProcedure.input(contractTemplateSchema).mutation(async (opts)=>{
  const template = await prisma.contractTemplate.create({
    data: {
      details: opts.input.details ?? "",
      name: opts.input.name ?? "",
      type: opts.input.type ?? "",
      organization_id: opts.input.organization_id
    }
  });

  return template;

});

export const getAllContractTemplate = publicProcedure.query(async ()=>{
  return await prisma.contractTemplate.findMany({ where: { deleted_at: null }, include: {contract: true} });
});

export const assignStaffToContractTemplate = publicProcedure
.input(
  z.object({
    templateId: z.string(),
    staffIds: z.array(z.string()),
    organization_id: z.string()
  })
)
.mutation(async ({ input }) => {
  const { templateId, staffIds, organization_id } = input;

  const template = await prisma.contractTemplate.findUnique({
    where: {id: templateId}, 
    include: {contract: {include: {template: true}}}
  });

  if(!template){
    console.error("Could not find contract template with id >> ", templateId);
    throw new Error("Could not find contract template with id >> ");
  }

  await prisma.contract.createMany({
    data: staffIds.map((staffId) => ({
      name: template.name,
      staff_profile_id: staffId,
      details: template.details!,
      template_id: templateId,
      type: template.type,
      organization_id: organization_id
    })),
  });


  return { success: true };
});

export const getAllContractTemplatesForOrganization = publicProcedure
  .input(z.object({ organization_slug: z.string() }))
  .query(async ({ input }) => {
    return await prisma.contractTemplate.findMany({
      where: {
        organization: { id: input.organization_slug },
        deleted_at: null,
      },
      include: { contract: { include: { staff_profile: {include: {user: true}} } } },
    });
  });