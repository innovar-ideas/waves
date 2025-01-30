"use server";

import { auth } from "@/auth";
import { ERROR_MESSAGES } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export async function getUserTransactions() {
  const session = await auth();

  if (!session) throw new Error(ERROR_MESSAGES.AUTH_ERROR);

  const userAccounts = await prisma.account.findMany({
    where: { user_id: session.user.id },
    select: { id: true },
  });
  return await prisma.transaction.findMany({
    where: {
      account_id: { in: userAccounts.map(({ id }) => id) },
    },
  });
}

export async function fetchTransactons() {
  const session = await auth();

  if (!session) throw new Error(ERROR_MESSAGES.AUTH_ERROR);

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { roles: true },
  });

  if (!user?.roles.find(({ role_name, active }) => active && role_name == "admin")) {
    throw new Error(ERROR_MESSAGES.AUTHORIZATION_ERROR);
  }

  return await prisma.transaction.findMany({
    orderBy: [{ created_at: "desc" }, { id: "desc" }],
    take: 30,
  });
}