"use server";

import { z } from "zod";
import { registrationSchema } from "../lib/dtos";
import { ERROR_MESSAGES, userRoleNames } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { v7 } from "uuid";
import { hash } from "bcryptjs";
import { auth, signIn } from "@/auth";

export async function register(input: z.infer<typeof registrationSchema>) {
  const validation = registrationSchema.safeParse(input);

  if (!validation.success) {
    return {
      error: ERROR_MESSAGES.INPUT_VALIDATION_FAILED,
      errors: validation.error.flatten(),
    };
  }

  try {
    const user = await prisma.user.create({
      data: {
        id: v7(),
        first_name: input.firstName,
        last_name: input.lastName,
        email: input.emailAddress,
        phone_number: input.phoneNumber,
        password: await hash(input.password, 10),
      },
    });

    await prisma.userRole.create({
      data: {
        id: v7(),
        user_id: user.id,
        role_name: userRoleNames.default,
      },
    });

    // await prisma.account.create({
    //   data: {
    //     id: v7(),
    //     user_id: user.id,
    //     name: PRIMARY_WALLET_NAME,
    //   },
    // });

    await signIn("credentials", {
      email: validation.data.emailAddress,
      password: validation.data.password,
      redirect: false,
    });

    // TODO: Send OTP email
  } catch (error) {
    console.error("failed to register agent", error);
    return {
      error: ERROR_MESSAGES.UKNOWN_ERROR,
    };
  }
}

// export async function getPrimaryWallet() {
//   const session = await auth();

//   if (!session) throw new Error(ERROR_MESSAGES.AUTH_ERROR);

//   return await prisma.account.findFirst({
//     where: {
//       user_id: session.user.id,
//       name: PRIMARY_WALLET_NAME,
//     },
//   });
// }

export async function fetchUsers() {
  const session = await auth();

  if (!session) throw new Error(ERROR_MESSAGES.AUTH_ERROR);

  if (
    !(session.user.roles?.find(({ role_name }) => role_name === userRoleNames.admin))
  ) {
    throw new Error(ERROR_MESSAGES.AUTHORIZATION_ERROR);
  }

  return (
    await prisma.userRole.findMany({
      where: {
        active: true,
        role_name: userRoleNames.default,
      },
      include: { user: true },
    })
  ).map((row) => ({ ...row.user }));
}
