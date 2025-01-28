import { prisma } from "@/lib/prisma";
import { publicProcedure } from "../trpc";
import { expectedDocumentSchema, findByIdSchema, homeAppLinkSchema, logoSchema } from "../dtos";
// import { auth } from "@/auth";

export type DocumentPreference = {
  documents: {
    type: string;
    expires: boolean;
  }[];
};

export type homeLinkPreference = {
  button_name: string;
  link: string;
};

export type logoPreference = {
  logo: string;
};

export const getAllBanks = publicProcedure.query(async () => {
  return await prisma.bank.findMany({ where: { deleted_at: null}, include: { organization: true } });
});

export const documentsPreference = publicProcedure
  .input(expectedDocumentSchema)
  .mutation(async (opts) => {
    const { documents, organization_id, id, user_id } = opts.input;

    const organization = await prisma.organization.findUnique({
      where: { id: organization_id },
    });

    if (!organization) {
      throw new Error("Organization not found");
    }

    if (!id) {
      const newPreference = await prisma.preference.create({
        data: {
          organization_id: organization.id,
          user_id: user_id,
          name: "expected_documents",
          value: { documents } as DocumentPreference,
        },
      });

      return newPreference;
    }

    // Update an existing preference
    const updatedPreference = await prisma.preference.update({
      where: { id },
      data: {
        value: { documents } as DocumentPreference,
      },
    });

    return updatedPreference;
  });

  export const findDocumentPreferenceByOrganizationSlug = publicProcedure
  .input(findByIdSchema)
  .query(async (opts) => {
    const organization = await prisma.organization.findUnique({ where: { id: opts.input.id } });

    if (!organization) {
      throw new Error("Organization not found");
    }

    return await prisma.preference.findFirst({
      where: { organization_id: organization.id, name: "expected_documents" },
    });
  });

  export const findHomeLinkPreferenceByOrganizationSlug = publicProcedure
  .input(findByIdSchema)
  .query(async (opts) => {
    const organization = await prisma.organization.findUnique({ where: { id: opts.input.id } });

    if (!organization) {
      throw new Error("Organization not found");
    }

    return await prisma.preference.findFirst({
      where: { organization_id: organization.id, name: "home_app_link" },
    });
  });

  export const homeLinkPreference = publicProcedure
  .input(homeAppLinkSchema)
  .mutation(async (opts) => {
    const { button_name, link, organization_id, id, user_id } = opts.input;

    const organization = await prisma.organization.findUnique({
      where: { id: organization_id },
    });

    if (!organization) {
      throw new Error("Organization not found");
    }

    if (!id) {
      const newPreference = await prisma.preference.create({
        data: {
          organization_id: organization.id,
          user_id,
          name: "home_app_link",
          value: { button_name, link } as homeLinkPreference,
        },
      });

      return newPreference;
    }

    // Update an existing preference
    const updatedPreference = await prisma.preference.update({
      where: { id },
      data: {
        value: { button_name, link } as homeLinkPreference,
      },
    });

    return updatedPreference;
  });

  export const organizationLogoPreference = publicProcedure
  .input(logoSchema)
  .mutation(async (opts) => {
    const { link, organization_id, id, user_id } = opts.input;

    const organization = await prisma.organization.findUnique({
      where: { id: organization_id },
    });

    if (!organization) {
      throw new Error("Organization not found");
    }

    if (!id) {
      const newPreference = await prisma.preference.create({
        data: {
          organization_id: organization.id,
          user_id: user_id,
          name: "logo",
          value: { logo: link } as logoPreference,
        },
      });

      return newPreference;
    }

    // Update an existing preference
    const updatedPreference = await prisma.preference.update({
      where: { id },
      data: {
        value: { logo: link } as logoPreference,
      },
    });

    return updatedPreference;
  });

    export const findOrganizationLogoPreferenceByOrganizationSlug = publicProcedure
  .input(findByIdSchema)
  .query(async (opts) => {
    const organization = await prisma.organization.findUnique({ where: { id: opts.input.id } });

    if (!organization) {
      throw new Error("Organization not found");
    }

    return await prisma.preference.findFirst({
      where: { organization_id: organization.id, name: "logo" },
    });
  });