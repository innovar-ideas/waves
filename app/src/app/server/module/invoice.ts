import { z } from "zod";
import { publicProcedure } from "../trpc";
import { prisma } from "@/lib/prisma";
import { InvoiceStatus } from "@prisma/client";
export const getAllNotPaidInvoicesByClientId = publicProcedure.input(z.object({
    client_id: z.string()
})).query(async ({ input }) => {
    return await prisma.invoice.findMany({

        where: {
            client_id: input.client_id,
            status: {
                in: [InvoiceStatus.DRAFT,   InvoiceStatus.OVERDUE, InvoiceStatus.PARTIALLY_PAID]


            }

        },

    });
});