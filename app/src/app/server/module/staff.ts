import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { publicProcedure } from "../trpc";
import { createStaffSchema, findByIdSchema, getAllStaffByOrganizationSlugSchema, staffByIdSchema } from "../dtos";
import { userRoleNames } from "@/lib/constants";
import { TRPCError } from "@trpc/server";

export const createStaff = publicProcedure.input(createStaffSchema).mutation(async (opts) => {
  const user = await prisma.user.create({
    data: {
      email: opts.input.email ?? "",
      password: bcrypt.hashSync(opts.input.password as string, 10),
      phone_number: opts.input.phone_number ?? "",
      first_name: opts.input.first_name ?? "",
      created_at: new Date(),
      last_name: opts.input.last_name ?? "",
      organization_id: opts.input.organization_id

    }
  });

  await prisma.staffProfile.create({
    data: {
      user_id: user.id,
      tin: opts.input.tin,
      nin: opts.input.nin,
      bank_account_no: opts.input.bank_account_no,
      bank_name: opts.input.bank_name,
      passport_number: opts.input.passport_number,
      passport_expiry_date: opts.input.passport_expiry_date,
      marital_status: opts.input.marital_status,
      date_of_birth: opts.input.date_of_birth,
      profile_picture_url: opts.input.profile_picture_url,
      documents_url: opts.input.documents_url,
      position: opts.input.position,
      department: opts.input.department,
      joined_at: opts.input.joined_at,
      salary_basis: opts.input.salary_basis,
      amount_per_month: opts.input.amount_per_month,
      effective_date: opts.input.effective_date,
      payment_type: opts.input.payment_type,
      skill: opts.input.skill,
      organization_id: opts.input.organization_id,
      team_designation_id: opts.input.team_designation_id
    }
  });

  await prisma.userRole.create({
    data: {
      role_name: userRoleNames.employee,
      user_id: user.id
    }
  });

  return user;

});

export const getAllStaffs = publicProcedure.query(async () => {
  return await prisma.staffProfile.findMany({ where: { deleted_at: null }, include: { user: true, work_history: true, team_designation: { include: { designation: true, team: true } } } });
});

export const getAllStaffsWithoutRoles = publicProcedure.query(async () => {
  return await prisma.staffProfile.findMany({ where: { deleted_at: null, team_designation_id: null }, include: { user: true, work_history: true, team_designation: { include: { designation: true, team: true } } } });
});

export const getStaffById = publicProcedure.input(staffByIdSchema).query(async (opts) => {
  return await prisma.staffProfile.findFirst({
    where: {
      user_id: opts.input.id,
      deleted_at: null,
    },
    include: { user: true, work_history: true, team_designation: { include: { designation: true, team: true } } }
  });
});

export const getSingleStaffById = publicProcedure.input(staffByIdSchema).query(async (opts) => {
  return await prisma.staffProfile.findFirst({
    where: {
      id: opts.input.id,
      deleted_at: null,
    },
    include: { user: true, work_history: true, team_designation: true, contracts: true }
  });
});

export const getStaffByUserId = publicProcedure.input(findByIdSchema).query(async (opts) => {
  const staff = await prisma.staffProfile.findUnique({ where: { user_id: opts.input.id as string }, include: { user: true, work_history: true } });

  return staff;
});

export const getStaffWithPayrollTemplate = publicProcedure
  .input(getAllStaffByOrganizationSlugSchema)
  .query(async (opts) => {
    try {
      return await prisma.staffProfile.findMany({
        where: {
          organization: { id: opts.input.slug },
          user: { deleted_at: null },
        },
        include: { user: true, payroll_template: true, payrolls: true },
        orderBy: { created_at: "desc" },
      });
    } catch (error) {
      console.error("Error fetching staff by organization:", error);

      return [];
    }
  });

export const getStaffWithContractTemplate = publicProcedure
  .input(getAllStaffByOrganizationSlugSchema)
  .query(async (opts) => {
    try {
      return await prisma.staffProfile.findMany({
        where: {
          organization: { id: opts.input.slug },
          user: { deleted_at: null },
        },
        include: { user: true, contracts: { include: { template: true } } },
        orderBy: { created_at: "desc" },
      });
    } catch (error) {
      console.error("Error fetching staff by organization:", error);

      return [];
    }
  });

export const updateStaff = publicProcedure.input(createStaffSchema).mutation(async ({ input }) => {

  try {

    if (!input.id && !input.user_id) {
      console.error("Error: Staff and user Id not found");

      return;
    }

    await prisma.user.update({
      where: { id: input.user_id },
      data: {
        email: input.email,
        phone_number: input.phone_number,
        first_name: input.first_name,
        updated_at: new Date(),
        last_name: input.last_name,
      }
    });

    return await prisma.staffProfile.update({
      where: { id: input.id },
      data: {
        tin: input.tin,
        nin: input.nin,
        bank_account_no: input.bank_account_no,
        bank_name: input.bank_name,
        passport_number: input.passport_number,
        passport_expiry_date: new Date(input.passport_expiry_date!),
        marital_status: input.marital_status,
        date_of_birth: new Date(input.date_of_birth!),
        profile_picture_url: input.profile_picture_url,
        documents_url: input.documents_url,
        position: input.position,
        department: input.department,
        joined_at: new Date(input.joined_at!),
        salary_basis: input.salary_basis,
        amount_per_month: input.amount_per_month,
        effective_date: new Date(input.effective_date!),
        payment_type: input.payment_type,
        team_designation_id: input.team_designation_id,
        skill: input.skill
      },
    });
  } catch (error) {
    console.error("Error updating staff:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to update staff",
      cause: error,
    });
  }
});

export const getStaffsByOrganizationId = publicProcedure.input(staffByIdSchema).query(async (opts) => {
  return await prisma.staffProfile.findMany({
    where: {
      organization_id: opts.input.id,
      deleted_at: null,
    },
    include: { user: true, work_history: true, team_designation: true, contracts: true }
  });
});