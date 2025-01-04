import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { publicProcedure } from "../trpc";
import { createUserSchema, findByIdSchema, userRoleSchema } from "../dtos";

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
  return await prisma.user.findMany({ where: { deleted_at: null }, include: {staffProfile: true, roles: true} });
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

export const getUserRoles = publicProcedure.input(findByIdSchema).query(async (opts) => {

  const roles = await prisma.userRole.findMany({
    where: {user_id: opts.input.id},
    include: {role: true, user: true}
  });

  return roles;
});

export const getRoles = publicProcedure.query(async ()=>{
  const roles = await prisma.role.findMany({ where: { deleted_at: null } });

  return roles.map((role) => ({
    value: role.name,
    label: role.name,
    id: role.name,
  }));

});

// export const updateUserRole = publicProcedure.input(userRoleSchema).query(async (opts) => {

//   const user = await prisma.user.update({
//     where: {id: opts.input.user_id},
//     data: {
//       roles: {
//         deleteMany: {},
//         create: opts.input.role_name.map(name => ({
//           : {},
//         })),
//       },
//     }
//   });

//   return user;
// });

export const updateUserRole = publicProcedure
  .input(userRoleSchema)
  .mutation(async ({ input }) => {
    const { user_id, role_name, active } = input;

    // Extract role IDs from the input
    const roleIds = role_name.map((role) => role.id);

    // Fetch existing roles for the user
    const existingRoles = await prisma.userRole.findMany({
      where: { user_id },
    });

    // Find roles to delete (existing roles not in the new list)
    const rolesToDelete = existingRoles.filter(
      (role) => !roleIds.includes(role.role_name)
    );

    // Find roles to add (new roles not in the existing list)
    const existingRoleNames = existingRoles.map((role) => role.role_name);
    const rolesToAdd = roleIds.filter((id) => !existingRoleNames.includes(id));

    // Delete roles
    if (rolesToDelete.length > 0) {
      await prisma.userRole.deleteMany({
        where: {
          user_id,
          role_name: { in: rolesToDelete.map((role) => role.role_name) },
        },
      });
    }

    // Add roles
    const newRoleEntries = rolesToAdd.map((roleName) => ({
      user_id,
      role_name: roleName,
      active,
    }));

    if (newRoleEntries.length > 0) {
      await prisma.userRole.createMany({
        data: newRoleEntries,
      });
    }

    // Return updated user with roles
    const updatedUser = await prisma.user.findUnique({
      where: { id: user_id },
      include: {
        roles: true, // Adjust to match your Prisma schema
      },
    });

    return updatedUser;
  });


