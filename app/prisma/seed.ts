
import { userRoleNames } from "@/lib/constants";
import { generateUniqueToken } from "@/lib/helper-function";
import { prisma } from "@/lib/prisma";
import { faker } from "@faker-js/faker";
import { hash } from "bcryptjs";
import { v7 } from "uuid";

async function seedOrganizations() {
  const token = await generateUniqueToken();
  const organization = {
    name: "Okoh Intl",
    slug: "okoh",
    token
  };

  await prisma.organization.upsert({
    where: { slug: organization.slug },
    update: {
      name: organization.name,
    },
    create: organization,
  });

  console.log("Organization seeding complete");
}

const roles = [
  {
    name: userRoleNames.super_admin,
    display_name: "Super Admin",
    description: "Super Admin user role",
  },
  {
    name: userRoleNames.admin,
    display_name: "Admin",
    description: "Admin user role",
  },
  {
    name: userRoleNames.employee,
    display_name: "Employee",
    description: "Employee user role",
  },
  {
    name: userRoleNames.finance,
    display_name: "Finance",
    description: "Finance user role",
  },
  {
    name: userRoleNames.supervisor,
    display_name: "Supervisor",
    description: "Supervisor user role",
  },
  {
    name: userRoleNames.default,
    display_name: "Default",
    description: "Default user role",
  },
];

async function seedRoles() {
  console.info("Seeding roles...");

  for (const role of roles) {
    const { name, display_name, description } = role;

    await prisma.role.upsert({
      where: { name }, // Assuming `name` is a unique identifier for the role
      update: { display_name, description },
      create: {
        id: v7(),
        name,
        display_name,
        description,
      },
    });
  }

  console.info("Roles seeded successfully ✅");
}

async function seedUsers() {
  console.info("Seeding users...");

  try {
    const users = [
      {
        name: "Super Admin",
        email: "super-admin@example.com",
        roles: ["super_admin", "admin"],
      },
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

      const org = await prisma.organization.findUnique({
        where: { slug: "okoh" },
      });

      const user = await prisma.user.upsert({
        where: { email: seedUser.email }, // Unique field to check for existence
        update: {
          first_name: faker.person.firstName(),
          last_name: faker.person.lastName(),
          organization_id: org?.id,
          password: await hash("secret", 10),
        },
        create: {
          id: v7(),
          first_name: faker.person.firstName(),
          last_name: faker.person.lastName(),
          organization_id: org?.id,
          email: seedUser.email,
          password: await hash("secret", 10),
        },
      });

      for (let i = 0; i < seedUser.roles.length; i++) {
        const roleName = seedUser.roles[i];

        await prisma.userRole.upsert({
          where: {
            unique_user_role: {
              user_id: user.id,
              role_name: roleName,
            },
          },
          update: {},
          create: {
            user_id: user.id,
            role_name: roleName,
            active: true,
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
  await seedOrganizations();
  await seedRoles();
  await seedUsers();
}

main();
