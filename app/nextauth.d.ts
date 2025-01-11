import { DefaultSession } from "next-auth";
import { User as DbUser, Organization, UserRole } from "@prisma/client";

declare module "next-auth" {
  interface User extends DbUser {
    id: string;
    email: string;
    active: boolean;
    roles: UserRole[];
    organization: Organization | null;
  }

  interface Session extends DefaultSession {
    user: Partial<User>;
  }
}
