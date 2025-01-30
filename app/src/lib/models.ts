import { Payment, Prisma } from "@prisma/client";

interface OrganizationPreference {
  name: string;
  value: Prisma.JsonValue;
  id: string;
  status: string;
  organization_id: string | null;
  created_at: Date;
  updated_at: Date;
  user_id: string | null;
}

export interface PaymentReceiptProps {
  payment: Payment & {
    invoice?: { invoice_number: string; customer_name: string } | null;
    bill?: { bill_number: string; vendor_name: string } | null;
    account?: { account_name: string } | null;
    organization: {
      name: string;
      contact_email?: string | null;
      contact_phone_number?: string | null;
      preferences: OrganizationPreference[];
    };
  };
}