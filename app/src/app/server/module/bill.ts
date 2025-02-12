import { prisma } from "@/lib/prisma";
import { publicProcedure } from "../trpc";
import { z } from "zod";
import { PurchaseOrderTableType } from "../types";
import { Supplier } from "@prisma/client";
import { createPurchaseOrderBillSchema, createPurchaseOrderSchema } from "@/lib/dtos";
import { generateBillNumber } from "@/lib/helper-function";



export const getAllBillByOrganization = publicProcedure.input(z.object({
  id: z.string(),
})).query(async ({ input }) => {
  const { id } = input;
  const bill = await prisma.bill.findMany({
    where: {
      organization_id: id,
    },
    orderBy: {
      created_at: "desc",
    },
    include: {
      organization: true,
      supplier: {
        select: {
          name: true,
          id: true,
          email: true,
          phone_number: true,
        },
      },
    },
  });
  return bill;
});

export const getAllPurchaseOrdersByVendorWithNoBill = publicProcedure.input(z.object({
  id: z.string(),
})).query(async ({ input }) => {
  const { id } = input;
  const purchaseOrders = await prisma.purchaseOrder.findMany({
    where: {
      vendor_id: id,

      bill_id: null,
    },
    include: {
      vendor: {
        select: {
          name: true,
          id: true,
          email: true,
          phone_number: true,
        },
      },
    },
  });
 const purchaseOrderTable: PurchaseOrderTableType[] = purchaseOrders.map(purchaseOrder => ({
   purchase_orders: purchaseOrder,
   vendor: purchaseOrder.vendor as Supplier // Type assertion to match PurchaseOrderTableType
 }));
 return purchaseOrderTable;
});

export const createPurchaseOrder = publicProcedure.input(createPurchaseOrderSchema).mutation(async ({ input }) => {
  const { purchase_order_number, type, vendor_id,  price, organization_id, created_by_id } = input;
  
  const org = await prisma.organization.findUnique({
    where: { id: organization_id }
  });
  if (!org) {
    throw new Error("Organization not found");
  }
  
  const purchaseOrder = await prisma.purchaseOrder.create({
    data: { purchase_order_number,
       type, 
       vendor_id,  
       price, 
       organization_id, 
       created_by_id }
  });
  return purchaseOrder;
});

export const createPurchaseOrderBill = publicProcedure.input(createPurchaseOrderBillSchema).mutation(async ({ input }) => {


  const {  vendor_id, amount, organization_id,  due_date, list_of_purchase_orders } = input;

  const org = await prisma.organization.findUnique({
    where: { id: organization_id }
  });

  if (!org) {
    throw new Error("Organization not found");
  }

  const bill = await prisma.bill.create({
    data: {
      bill_number: await generateBillNumber({ organizationId: organization_id, organizationSlug: org.slug }),
      due_date,
      amount,
      organization_id,
      vendor_name: vendor_id || "",
      vendor_id: vendor_id || "",
      status: "PENDING",
      created_at: new Date(),
      
    }
  });
  
  for (const purchase_order_id of list_of_purchase_orders) {
    
    await prisma.purchaseOrder.update({
      where: { id: purchase_order_id },
      data: { bill_id: bill.id }
    });
   
  }
  
  return bill;
});

