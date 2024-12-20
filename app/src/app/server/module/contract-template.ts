import { prisma } from "@/lib/prisma";
import { publicProcedure } from "../trpc";
import { contractTemplateSchema } from "../dtos";
import { z } from "zod";
import { sendNotification } from "@/lib/utils";
import { updateContractTemplateSchema } from "@/lib/dtos";
import { ContractTemplate } from "@prisma/client";

export const createContractTemplate = publicProcedure.input(contractTemplateSchema).mutation(async (opts)=>{
  const template = await prisma.contractTemplate.create({
    data: {
      details: opts.input.details ?? "",
      name: opts.input.name ?? "",
      type: opts.input.type ?? "",
      organization_id: opts.input.organization_id,
      sign_before: opts.input.sign_before ?? 0,
      contract_duration: opts.input.contract_duration ?? 0
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
    console.error("Could not find contract template with id  ", templateId);
    throw new Error("Could not find contract template with id  ");
  }

  const signBefore = template.sign_before as number;
  const duration = template.contract_duration as number;
  const currentDate = new Date();

  const signBeforeDate = new Date(currentDate);
    signBeforeDate.setDate(currentDate.getDate() - signBefore * 7);

    // Calculate contract_duration date (add years to current date)
    const contractEndDate = new Date(currentDate);
    contractEndDate.setFullYear(currentDate.getFullYear() + duration);


  await prisma.contract.createMany({
    data: staffIds.map((staffId) => ({
      name: template.name,
      staff_profile_id: staffId,
      details: template.details!,
      template_id: templateId,
      type: template.type,
      organization_id: organization_id,
      sign_before: signBeforeDate,
      contract_duration: contractEndDate
    })),
  });
  const admin = await prisma.user.findMany({
    where: {
      organization_id: input.organization_id,
      roles: {
        some: {
          role: {
            name: "admin"
          }
        }
      }
    }
  });

  staffIds.forEach(async (staffId) => {
    const staff = await prisma.staffProfile.findUnique({ where: { id: staffId } });
 
    await sendNotification({
      userId: staff?.user_id as string,
      title: "New Contract Assignment",
      message: `A new contract "${template.name}" has been assigned to you. Please review and sign this contract before ${signBeforeDate.toLocaleDateString()}. Contract details:\n\nType: ${template.type}\nDuration: ${duration} years\nExpiry Date: ${contractEndDate.toLocaleDateString()}\n\nContent: ${template.details}\n\nIMPORTANT: This contract must be signed before ${signBeforeDate.toLocaleDateString()}. Failure to sign before this date may affect your employment status.`,
      notificationType: "Other",
      recipientIds: [
        { id: staffId, isAdmin: false },
        ...admin.map(admin => ({ id: admin.id, isAdmin: true }))
      ]
    });
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
 

  export const updateContractTemplate = publicProcedure.input(updateContractTemplateSchema).mutation(async (opts)=>{
    const oldTemplate = await prisma.contractTemplate.findUnique({
      where: {id: opts.input.id}, 
      select: {
        id: true,
        versions: true,
        name: true,
        type: true,
        sign_before: true,
        contract_duration: true,
        details: true
      }
    });

    if(!oldTemplate){
      throw new Error(`Could not find contract template  ${opts.input.id}`);
    }


    const newVersion = {
      version: Array.isArray(oldTemplate.versions) ? oldTemplate.versions.length + 1 : 1,
      name: oldTemplate.name,
      type: oldTemplate.type,
      sign_before: oldTemplate.sign_before,
      contract_duration: oldTemplate.contract_duration,
      details: oldTemplate.details,
      updated_at: new Date().toISOString() 
    };

    const versions = Array.isArray(oldTemplate.versions) ? oldTemplate.versions : [];
    versions.push(newVersion);

    let template: ContractTemplate | null = null;
    try {
      template = await prisma.contractTemplate.update({
        where: {id: opts.input.id},
        data: {
          versions: versions,
          name: opts.input.name,
          type: opts.input.type, 
          sign_before: opts.input.sign_before,
          contract_duration: opts.input.contract_duration,
          details: opts.input.details ?? ""
        }
      });
    } catch(error) {
      console.error("Failed to update contract template:", error);
      throw new Error("Could not update contract template");
    }
   

    const listOfContracts = await prisma.contract.findMany({where: {template_id: template?.id}});
    
    if(!listOfContracts.length){
      return template;
    }
  
    const signBefore = template.sign_before as number;
    const duration = template.contract_duration as number;
    const currentDate = new Date();
  
    const signBeforeDate = new Date(currentDate);
      signBeforeDate.setDate(currentDate.getDate() - signBefore * 7);
  
      // Calculate contract_duration date (add years to current date)
      const contractEndDate = new Date(currentDate);
      contractEndDate.setFullYear(currentDate.getFullYear() + duration);
    listOfContracts.forEach(async (contract)=>{
      await prisma.contract.update({where: {id: contract.id}, data: {
        name: template.name,
        type: template.type,
        sign_before: signBeforeDate,
        contract_duration: contractEndDate,
        details: template.details ?? ""
      }});
    });

  const admin = await prisma.user.findMany({
    where: {
      organization_id: opts.input.organization_id,
      roles: {
        some: {
          role: {
            name: "admin"
          }
        }
      }
    }
  });

    listOfContracts.forEach(async (contract)=>{
      const staff = await prisma.staffProfile.findUnique({where: {id: contract.staff_profile_id}});
      await sendNotification({
        userId: staff?.user_id as string,
        title: "Contract Updated",
        message: `The contract "${template.name}" has been updated. Please review and sign this contract before ${signBeforeDate.toLocaleDateString()}. Contract details:\n\nType: ${template.type}\nDuration: ${duration} years\nExpiry Date: ${contractEndDate.toLocaleDateString()}\n\nContent: ${template.details}\n\nIMPORTANT: This contract must be signed before ${signBeforeDate.toLocaleDateString()}. Failure to sign before this date may affect your employment status.`,
        notificationType: "Other",
        recipientIds: [
          { id: staff?.id as string, isAdmin: false },
          ...admin.map(admin => ({ id: admin.id, isAdmin: true }))
        ]
      });
    });
    return template;
  });

  export const deleteContractTemplate = publicProcedure.input(z.object({id: z.string()})).mutation(async (opts)=>{
    return await prisma.contractTemplate.update({where: {id: opts.input.id}, data: {deleted_at: new Date()}});
  });

  export const getContractTemplateVersion = publicProcedure.input(z.object({id: z.string()})).query(async (opts)=>{
    return await prisma.contractTemplate.findUnique({where: {id: opts.input.id}, select: {versions: true}});
  });

