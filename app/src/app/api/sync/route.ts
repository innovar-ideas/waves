
import { prisma } from "@/lib/prisma";
import { syncSchema } from "@/app/server/dtos";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
      const validation = syncSchema.safeParse(await req.json());
    
      if (!validation.success) {
        return NextResponse.json({ error: validation.error.issues }, { status: 400 });
      }

      const { organization_id, type } = validation.data;

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

    if(type === "invoice"){
      
    }

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