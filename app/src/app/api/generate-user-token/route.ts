import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { userGenerateTokenSchema } from "@/app/server/dtos";

export async function POST(req: NextRequest) {
  const validation = userGenerateTokenSchema.safeParse(await req.json());

  if (!validation.success) {
    return NextResponse.json({ error: validation.error.issues }, { status: 400 });
  }

  try {
    // Extract the AUTH_SECRET from the environment variables
    const AUTH_SECRET = process.env.AUTH_SECRET as string;
    if (!AUTH_SECRET) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Parse the request body
    const { userId } = validation.data;

    // Validate the input
    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { error: "Invalid input: 'userId' is required and must be a string" },
        { status: 400 }
      );
    }

    // Fetch the user from the database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { roles: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate the token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        roles: user.roles.map((role) => role.role_name),
      },
      AUTH_SECRET,
      { expiresIn: "1h" }
    );

    // Construct the redirect URL
    const redirectUrl = `/user-auth?token=${encodeURIComponent(token)}`;

    // Return the redirect URL
    return NextResponse.json({ redirectUrl });
  } catch (error) {
    console.error("Error generating user token:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
