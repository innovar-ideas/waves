import { userRoleNames } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { faker } from "@faker-js/faker";
import { hash } from "bcryptjs";
import { v7 } from "uuid";
const roles = [
  {
    name: userRoleNames.admin,
    display_name: "Admin",
    description: "Admin user role",
  },
  {
    name: userRoleNames.default,
    display_name: "Default",
    description: "Default user role",
  },
];

async function seedRoles() {
  console.info("Seeding roles...");

  await prisma.role.createMany({
    data: roles.map(({ name, display_name, description }) => ({
      id: v7(),
      name,
      display_name,
      description,
    })),
    skipDuplicates: true,
  });

  console.info("Roles seeded successfully ✅");
}

async function seedUsers() {
  console.info("Seeding users...");

  try {
    const users = [
      {
        name: "Admin",
        email: "admin@example.com",
        roles: ["admin"],
      },
      {
        name: "Default",
        email: "default@example.com",
        roles: ["default"],
      },
    ];

    for (let i = 0; i < users.length; i++) {
      const seedUser = users[i];

      const user = await prisma.user.create({
        data: {
          id: v7(),
          first_name: faker.person.firstName(),
          last_name: faker.person.lastName(),
          email: seedUser.email,
          password: await hash("secret", 10),
        },
      });

      for (let i = 0; i < seedUser.roles.length; i++) {
        const roleName = seedUser.roles[i];
        await prisma.userRole.create({
          data: {
            id: v7(),
            user_id: user.id,
            role_name: roleName,
          },
        });
      }
    }

    console.info("Users seeded successfully ✅");
  } catch (error) {
    console.error(error);
  }
}

async function main() {
  await seedRoles();
  await seedUsers();
}

main();
