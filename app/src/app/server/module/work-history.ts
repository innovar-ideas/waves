import { prisma } from "@/lib/prisma";
import { publicProcedure } from "../trpc";
import { createWorkHistorySchema } from "../dtos";

export const createWorkHistory = publicProcedure.input(createWorkHistorySchema).mutation(async (opts)=>{
  return await prisma.workHistory.create({
    data: {
      job_title: opts.input.job_title as string,
      company_industry: opts.input.company_industry as string,
      company_name: opts.input.company_name as string,
      responsibilities: opts.input.responsibilities as string,
      start_date: opts.input.start_date as Date,
      end_date: opts.input.end_date as Date,
      staff_profile_id: opts.input.id as string,

    }
  });

});

export const getAllWorkHistory = publicProcedure.query(async ()=>{
  return await prisma.workHistory.findMany({ where: { deleted_at: null }, include: {staffProfile: true} });
});