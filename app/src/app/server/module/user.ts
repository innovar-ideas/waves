import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { publicProcedure } from "../trpc";
import { createUserSchema, findByIdSchema } from "../dtos";

export const createUser = publicProcedure.input(createUserSchema).mutation(async (opts)=>{
  const user = await prisma.user.create({
    data: {
      email: opts.input.email ?? "",
      password: bcrypt.hashSync(opts.input.password as string, 10),
      phone_number: opts.input.phone_number ?? "",
      first_name: opts.input.first_name ?? "",
      created_at: new Date(),
      last_name: opts.input.last_name ?? "",

    }
  });

  return user;

});

export const getAllUsers = publicProcedure.query(async ()=>{
  return await prisma.user.findMany({ where: { deleted_at: null }, include: {staffProfile: true} });
});

export const getUserById = publicProcedure.input(findByIdSchema).query(async (opts) => {
  const staff = await prisma.user.findUnique({ where: { id: opts.input.id as string }, include: { organization: true, roles: true } });

  return staff;
});

export const getSingleUserById = publicProcedure.input(findByIdSchema).query(async (opts) => {
  const user = await prisma.user.findUnique({ where: { id: opts.input.id as string }, include: { organization: true, staffProfile: {include: {contracts: true}} } });

  if(!user?.staffProfile){
    throw new Error("Staff profile not found");
  }

 const contracts = await prisma.contract.findMany({
    where: {staff_profile_id: user.staffProfile[0].id},
    include: {staff_profile: {include: {user: true}}}
  });

  return contracts;
});