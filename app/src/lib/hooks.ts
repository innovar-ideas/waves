"use client";

import { UserRole } from "@prisma/client";
import { useSession } from "next-auth/react";

export function useRoles (): [boolean, UserRole[]] {
  const { data: session, status } = useSession();

  return [status === "authenticated", [...session?.user.roles ?? []]];
}
