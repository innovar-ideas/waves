import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { ClientSchema2, InvoiceSchema2, SyncRequestSchema, VendorSchema2, WavesPurchaseOrderSchema } from "@/app/server/dtos";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {

  const validation = SyncRequestSchema.safeParse(await req.json());
  
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues }, { status: 400 });
    }

  try {

    const { organization_id, model, data } = validation.data;

    // Validate data based on model type
    let upsertedRecords;

switch (model) {
  case "invoice": {
    const validatedData = data.map((item) => InvoiceSchema2.parse(item));

    upsertedRecords = await Promise.all(
      validatedData.map((item) =>
        prisma.invoice.upsert({
          where: { id: item.id },
          update: { ...item },
          create: { 
            ...item, 
            organization_id, 
            created_at: new Date(item.created_at), 
            updated_at: new Date(item.updated_at), 
            due_date: new Date(item.due_date) 
          },
        })
      )
    );
    break;
  }

  case "client": {
    const validatedData = data.map((item) => ClientSchema2.parse(item));

    upsertedRecords = await Promise.all(
      validatedData.map((item) =>
        prisma.client.upsert({
          where: { id: item.id },
          update: { ...item },
          create: { ...item, organization_id },
        })
      )
    );
    break;
  }

  case "vendor": {
    const validatedData = data.map((item) => VendorSchema2.parse(item));

    upsertedRecords = await Promise.all(
      validatedData.map((item) =>
        prisma.supplier.upsert({
          where: { id: item.id },
          update: { ...item },
          create: { ...item, organization_id },
        })
      )
    );
    break;
  }

  case "purchase_order": {
    const validatedData = data.map((item) => WavesPurchaseOrderSchema.parse(item));

    upsertedRecords = await Promise.all(
      validatedData.map((item) =>
        prisma.purchaseOrder.upsert({
          where: { id: item.id },
          update: { ...item },
          create: { ...item, organization_id },
        })
      )
    );
    break;
  }

  default:
    return NextResponse.json({ message: "Invalid model type" }, { status: 400 });
}

    return NextResponse.json({ message: `${model} synced successfully`, record: upsertedRecords }, {status: 200});
  } catch (error) {
    console.error("Validation or Sync Error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Validation Error", errors: error.errors }, {status: 400});
    }

    return NextResponse.json({ message: "Internal Server Error", error }, {status: 500});
  }
}
