import { prisma } from "@/lib/prisma";
import { publicProcedure } from "../trpc";
import { z } from "zod";
import { PurchaseOrderTableType } from "../types";
import { Supplier } from "@prisma/client";
import { createPurchaseOrderBillSchema, createPurchaseOrderSchema } from "@/lib/dtos";



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


  const {  vendor_id, amount, organization_id, bill_number, due_date, list_of_purchase_orders } = input;
  console.log(input,"1<<<<<<<<<<<<<<<<<<<<<<<<<input");
  const org = await prisma.organization.findUnique({
    where: { id: organization_id }
  });
  console.log(org,"2<<<<<<<<<<<<<<<<<<<<<<<<<org");
  if (!org) {
    throw new Error("Organization not found");
  }
  console.log(org,"3<<<<<<<<<<<<<<<<<<<<<<<<<org");

  const bill = await prisma.bill.create({
    data: {
      bill_number,
      due_date,
      amount,
      organization_id,
      vendor_name: vendor_id || "",
      vendor_id: vendor_id || "",
      status: "PENDING",
      created_at: new Date(),
      
    }
  });
  console.log(bill,"4<<<<<<<<<<<<<<<<<<<<<<<<<bill");
  for (const purchase_order_id of list_of_purchase_orders) {
    console.log(purchase_order_id,"5<<<<<<<<<<<<<<<<<<<<<<<<<purchase_order_id");
    await prisma.purchaseOrder.update({
      where: { id: purchase_order_id },
      data: { bill_id: bill.id }
    });
    console.log("6<<<<<<<<<<<<<<<<<<<<<<<<<purchase_order_id");
  }
  console.log("7<<<<<<<<<<<<<<<<<<<<<<<<<purchase_order_id");
  return bill;
});

