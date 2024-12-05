
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request): Promise<Response> {
  try {
    // Validate request body against schema
    const body = await req.json() as {
      organization_id: string;
      list_of_staff: Array<{
        name: string;
        email: string;
        password: string;
        date_of_birth: Date;
      }>;
    };
    const { organization_id, list_of_staff }: { 
      organization_id: string;
      list_of_staff: Array<{
        name: string;
        email: string;
        password: string;
        date_of_birth: Date;
      }>;
    } = body;

    // Create or update "Staff" role
    await prisma.staffRole.upsert({
      where: { description: "Staff" },
      create: { description: "Staff" },
      update: { description: "Staff" }
    });

    // Find organization by ID
    const org = await prisma.organization.findUnique({
      where: { id: organization_id }
    });

    // If organization not found, return 404
    if (!org) {
      return new Response(
        JSON.stringify({ error: "Organization not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Process each staff member
    for (const staff of list_of_staff) {
      const [firstName, lastName = ""] = staff.name.split(" ");

      // Create or update user in the database
      const staffUser = await prisma.user.upsert({
        where: { email: staff.email },
        create: {
          email: staff.email,
          password: await bcrypt.hash(staff.password, 10),
          first_name: firstName,
          last_name: lastName,
          organization_id: org.id
        },
        update: {
          first_name: firstName,
          last_name: lastName,
          organization_id: org.id
        }
      });

      // Create or update role for the user
      await prisma.role.upsert({
        where: { name: "Staff" },
        create: {
          name: "Staff",
          display_name: "Staff"
        },
        update: {
          display_name: "Staff"
        }
      });

      // Assign "Staff" role to the user
      await prisma.userRole.upsert({
        where: {
          unique_user_role: {
            role_name: "Staff",
            user_id: staffUser.id
          }
        },
        create: {
          role_name: "Staff",
          user_id: staffUser.id
        },
        update: {
          role_name: "Staff",
          user_id: staffUser.id
        }
      });

      // Create or update staff profile
      await prisma.staffProfile.upsert({
        where: { user_id: staffUser.id },
        create: {
          user_id: staffUser.id,
          date_of_birth: new Date(staff.date_of_birth),
          organization_id: org.id,
        },
        update: {
          date_of_birth: new Date(staff.date_of_birth),
          organization_id: org.id,
        }
      });
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: "Staff bulk upload successful"
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    // Handle errors
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}