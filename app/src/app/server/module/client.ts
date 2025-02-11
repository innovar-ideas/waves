import { prisma } from "@/lib/prisma";
import { publicProcedure } from "../trpc";
import { clientSchema } from "../dtos";
import { z } from "zod";
import { InvoiceStatus } from "@prisma/client";
export const getAllClientsByOrganizations = publicProcedure.input(z.object({
  id: z.string()
})).query(async(input)=> {
  return await prisma.client.findMany({
    where: {
      organization_id: input.input.id, deleted_at: null
    },
    include: {addresses: true}
  });
});

export const createNewClient = publicProcedure
  .input(clientSchema)
  .mutation(async ({ input }) => {
    return await prisma.$transaction(async (tx) => {
      // Get organization by slug
      const organization = await tx.organization.findUnique({
        where: { id: input.organization_slug },
      });

      if (!organization) {
        throw new Error("Organization not found");
      }

      // Create main client record
      const client = await tx.client.create({
        data: {
          first_name: input.first_name,
          last_name: input.last_name,
          email: input.email,
          phone: input.phone_number,
          organization_id: organization.id,
        },
      });

      // Handle addresses
      if (input.addresses) {
        await tx.address.createMany({
          data: input.addresses.map((address) => ({
            street: address.street,
            city: address.city,
            state: address.state,
            postal_code: address.postal_code,
            country: address.country,
            client_id: client.id,
            type: address.type as string, // Ensure your addressSchema has a type field
          })),
        });
      }

      return client;
    });
  });

  export const updateClient = publicProcedure
  .input(clientSchema)
  .mutation(async ({ input }) => {
    if (!input.id) throw new Error("Client ID is required for update");

    return await prisma.$transaction(async (tx) => {
      // Verify client exists
      const existingClient = await tx.client.findUnique({
        where: { id: input.id },
      });

      if (!existingClient) {
        throw new Error("Client not found");
      }

      // Update main client record
      const updatedClient = await tx.client.update({
        where: { id: input.id },
        data: {
          first_name: input.first_name,
          last_name: input.last_name,
          email: input.email,
          phone: input.phone_number,
        },
      });

      // Handle addresses (full replace)
      if (input.addresses) {
        await tx.address.deleteMany({ where: { client_id: input.id } });
        await tx.address.createMany({
          data: input.addresses.map((address) => ({
            street: address.street,
            city: address.city,
            state: address.state,
            postal_code: address.postal_code,
            country: address.country,
            client_id: updatedClient.id,
            type: address.type as string,
          })),
        });
      }

      return updatedClient;
    });
  });


  export const getAllClientsWithUnpaidInvoices = publicProcedure.input(z.object({
    organization_slug: z.string()
  })).query(async ({ input }) => {
    
    return await prisma.client.findMany({
      where: {
        organization_id: input.organization_slug, deleted_at: null,
        invoices: {
          some: {
            status: {
              notIn: [InvoiceStatus.PAID, InvoiceStatus.SENT]
            }

          }
        }
      },
      include: {addresses: true}


    });
  });