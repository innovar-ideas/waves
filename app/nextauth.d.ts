import { DefaultSession } from "next-auth";
import { User as DbUser, UserRole } from "@prisma/client";

declare module "next-auth" {
  interface User extends DbUser {
    id: string;
    email: string;
    active: boolean;
    roles: UserRole[];
  }

  interface Session extends DefaultSession {
    user: Partial<User>;
  }
}
