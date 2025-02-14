import { prisma } from "@/lib/prisma";
import { publicProcedure } from "../trpc";
import { vendorSchema } from "../dtos";
import { z } from "zod";
import { AccountTypeEnum, BillStatus } from "@prisma/client";
import { generateAccountCode } from "@/lib/helper-function";

export const getAllVendorsByOrganizations = publicProcedure.input(z.object({
  id: z.string()
})).query(async(input)=> {
  return await prisma.supplier.findMany({
    where: {
      organization_id: input.input.id, deleted_at: null
    },
    include: {addresses: true, organization: true, accounts: true}
  });
});

export const createVendor = publicProcedure.input(vendorSchema).mutation(async (opts) => {
  return await prisma.$transaction(async (tx) => {
    // Verify organization exists first
    const organization = await tx.organization.findUnique({
      where: { id: opts.input.organization_id },
    });

    if (!organization) {
      throw new Error("Organization not found");
    }

    // Create main vendor record
    const vendor = await tx.supplier.create({
      data: {
        name: opts.input.name ?? "",
        organization_id: opts.input.organization_id,
        email: opts.input.email,
        phone_number: opts.input.phone_number,
      },
    });

    // Process bank accounts if provided
    if (opts.input.accounts) {
      await Promise.all(
        opts.input.accounts.map(async (bank) => {
          const accountCode = await generateAccountCode({
            organizationId: organization.id,
            organizationSlug: organization.slug || "",
            accountType: AccountTypeEnum.EXPENSE,
            accountTypeName: bank.account_name,
          });

          return tx.accounts.create({
            data: {
              account_name: bank.account_name,
              account_type_enum: AccountTypeEnum.EXPENSE,
              supplier_id: vendor.id,
              account_code: accountCode,
              account_number: bank.account_number,
              organization_id: organization.id,
              total_amount: 0,
              bank_branch: bank.bank_branch,
              bank_name: bank.bank_name,
              description: bank.description,
              swift_code: bank.swift_code
            },
          });
        })
      );
    }

    // Process addresses if provided
    if (opts.input.addresses) {
      await tx.address.createMany({
        data: opts.input.addresses.map((address) => ({
          street: address.street,
          city: address.city,
          state: address.state,
          postal_code: address.postal_code,
          supplier_id: vendor.id,
          type: address.type as string,
          country: address.country,
        })),
      });
    }

    return vendor;
  });
});

export const updateVendor = publicProcedure.input(vendorSchema).mutation(async (opts) => {
  const { input } = opts;

  if (!input.id) {
    throw new Error("Vendor ID is required for update");
  }

  return await prisma.$transaction(async (prisma) => {
    // Check if vendor exists
    const existingVendor = await prisma.supplier.findUnique({
      where: { id: input.id },
    });
    if (!existingVendor) {
      throw new Error("Vendor not found");
    }

    // Validate organization
    const organization = await prisma.organization.findUnique({
      where: { id: input.organization_id },
    });
    if (!organization) {
      throw new Error("Organization not found");
    }

    // Update vendor details
    const updatedVendor = await prisma.supplier.update({
      where: { id: input.id },
      data: {
        name: input.name,
        email: input.email,
        phone_number: input.phone_number,
        organization_id: input.organization_id,
        // other_fields: input.other_fields,
      },
    });

    // Handle accounts (replace all if provided)
    if (input.accounts) {
      await prisma.accounts.deleteMany({ where: { supplier_id: input.id } });

      for (const bank of input.accounts) {
        const accountCode = await generateAccountCode({
          organizationId: organization.id,
          organizationSlug: organization.slug || "",
          accountType: AccountTypeEnum.EXPENSE,
          accountTypeName: bank.account_name,
        });

        await prisma.accounts.create({
          data: {
            account_name: bank.account_name,
            account_type_enum: AccountTypeEnum.EXPENSE,
            supplier_id: updatedVendor.id,
            account_code: accountCode,
            account_number: bank.account_number,
            organization_id: organization.id,
            total_amount: 0,
            bank_branch: bank.bank_branch,
            description: bank.description,
            bank_name: bank.bank_name,
            swift_code: bank.swift_code
          },
        });
      }
    }

    // Handle addresses (replace all if provided)
    if (input.addresses) {
      await prisma.address.deleteMany({ where: { supplier_id: input.id } });

      for (const address of input.addresses) {
        await prisma.address.create({
          data: {
            street: address.street,
            city: address.city,
            state: address.state,
            postal_code: address.postal_code,
            supplier_id: updatedVendor.id,
            type: address.type as string,
            country: address.country,
          },
        });
      }
    }

    return updatedVendor;
  });
});

export const getAllVendorsWithBillsNotPaid = publicProcedure.input(z.object({
  id: z.string()
})).query(async(input)=> {
  return await prisma.supplier.findMany({
    where: {
      organization_id: input.input.id,
      bills: {
        some: {
          status: {
            in: [BillStatus.DRAFT, BillStatus.RECEIVED, BillStatus.PARTIALLY_PAID, BillStatus.OVERDUE, BillStatus.PENDING]
          }
        }
      },
      deleted_at: null
    }
  });
});
