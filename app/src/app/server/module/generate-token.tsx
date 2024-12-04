import { z } from "zod";
import { publicProcedure } from "../trpc";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";


export const generateUserToken = publicProcedure.input(
  z.object({ userId: z.string() })
).mutation(async ({ input }) => {
  const AUTH_SECRET = process.env.AUTH_SECRET as string;

  const user = await prisma.user.findUnique({ where: { id: input.userId }, include: { roles: true } });

  if (!user) {
    throw new Error("User not found");
  }

  const token = jwt.sign({ id: user.id, email: user.email, roles: user.roles.map(role => role.role_name) }, AUTH_SECRET, {
    expiresIn: "1h",
  });

  // Construct redirect URL
  const redirectUrl = `/user-auth?token=${encodeURIComponent(token)}`;

  return { redirectUrl };
});

export const verifyToken = publicProcedure
  .input(
    z.object({
      token: z.string(), // The token to be validated
    })
  )
  .mutation(async ({ input }) => {
    if (!input.token) {
      throw new Error("Token is required");
    }
    const AUTH_SECRET = process.env.AUTH_SECRET || "";


    try {
      // Verify the token
      const decoded = jwt.verify(input.token, AUTH_SECRET);

      // Optionally check token details (e.g., user exists, roles, etc.)
      return {
        message: "Token verified successfully",
        user: decoded, // Include the decoded token payload in the response
      };
    } catch (error) {
      throw new Error("Invalid or expired token", error as ErrorOptions);
    }
  });