import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { ERROR_MESSAGES } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { signInSchema } from "@/lib/dtos";
import { compare } from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      id: "credentials",
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const parseCredentials = signInSchema.safeParse(credentials);

        if (!parseCredentials.success) {
          throw new Error(ERROR_MESSAGES.INPUT_VALIDATION_FAILED);
        }

        const user = await prisma.user.findUnique({
          where: { email: parseCredentials.data.email },
          include: { roles: true },
        });

        if (
          !user ||
          !user.active ||
          !user.password ||
          !(await compare(parseCredentials.data.password, user.password))
        ) {
          return null;
        }

        return user;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.first_name = user.first_name;
        token.last_name = user.last_name;
        token.active = user.active;
        token.roles = user.roles;
        token.organization_id = user.organization_id;
      }

      return token;
    },

    session: async ({ session, token }) => ({
      ...session,
      user: {
        id: token.sub,
        email: token.email,
        first_name: token.first_name as string,
        last_name: token.last_name as string,
        active: token.active as boolean,
        roles: token.roles as [],
        organization_id: token.organization_id as string,
      },
    }),
  },
});
