import { Event, Prisma, TransactionType } from "@prisma/client";
import { nanoid } from "nanoid";
import { prisma } from "./prisma";

interface StoredData {
  version: number;
  state: {
    organizationSlug: string;
  };
}

interface GenerateItemCodeParams {
  accountId?: string;
}

interface GenerateBillNumberParams {
  organizationId: string;
}
export function formatAmountToNaira(amount: number | string): string {
  const numericAmount = typeof amount === "string" ? parseInt(amount, 10) : Math.floor(amount);

  if (isNaN(numericAmount)) {
    return "₦0";
  }

  const formattedAmount = numericAmount.toLocaleString("en-NG");

  return `₦ ${formattedAmount}`;
}

const DATA_VERSION = 0;

export const getActiveOrganizationSlugFromLocalStorage = (): string => {
  if (typeof window !== "undefined" && localStorage.getItem) {
    const storedData = localStorage.getItem("active-organization");

    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData) as StoredData;

        if (parsedData.version === DATA_VERSION) {
          return parsedData.state.organizationSlug;
        } else {
          console.warn("Stored data version mismatch");
        }
      } catch (error) {
        console.error("Error parsing stored data:", error);
      }
    }
  }

  return "";
};

export const setActiveOrganizationSlugInLocalStorage = (slug: string | null): void => {
  if (!slug) return;

  if (typeof window !== "undefined" && localStorage.setItem) {
    try {
      const storedData: StoredData = {
        version: DATA_VERSION,
        state: { organizationSlug: slug },
      };

      localStorage.setItem("active-organization", JSON.stringify(storedData));
    } catch (error) {
      console.error("Error storing data:", error);
    }
  }
};




// export const setActiveOrganizationSlugInLocalStorage = (slug: string | null): void => {
//   if (!slug) return;

//   if (typeof window !== "undefined" && localStorage.setItem) {
//     try {
//       const storedData: StoredData = {
//         version: DATA_VERSION,
//         state: { organizationSlug: slug },
//       };

//       localStorage.setItem("active-organization", JSON.stringify(storedData));
//     } catch (error) {
//       console.error("Error storing data:", error);
//     }
//   }
// };







export const getMostRecentPayroll = (payrolls: Array<{ month: Date }>) => {
  if (!payrolls?.length) return null;
  return payrolls.reduce((latest, current) => {
    const currentDate = new Date(current.month);
    const latestDate = new Date(latest.month);
    return currentDate > latestDate ? current : latest;
  });
};

export const formatMonth = (date: Date) => {
  return new Date(date).toLocaleDateString("en-US", { month: "long", year: "numeric" });
};

export const openInSameTab = (url: string) => {
  window.open(url, "_self", "noopener,noreferrer");
};

export function replaceVariables(content: string, variables: Record<string, string>): string {
  return content?.replace(/{{(.*?)}}/g, (_, key: string) => variables[key.trim()] || `{{${key}}}`);
}

export const groupEventsByMonth = (events: Event[]) => {
  const groupedEvents = events.reduce(
    (acc, event) => {
      const month = event.starts.toISOString().slice(0, 7);
      if (!acc[month]) {
        acc[month] = [];
      }
      acc[month].push(event);
      return acc;
    },
    {} as Record<string, Event[]>
  );

  return Object.entries(groupedEvents).map(([month, events]) => ({
    month,
    events,
  }));
};

export async function generateUniqueToken(): Promise<string> {
  let token: string;
  let isUnique = false;

  do {
    token = nanoid(32);

    const existingToken = await prisma.organization.findUnique({
      where: { token },
    });

    if (!existingToken) {
      isUnique = true;
    }
  } while (!isUnique);

  return token;
}

export async function updateInvoiceStatus(
  tx: Prisma.TransactionClient,
  invoiceId: string,
  paymentAmount: number
) {
  const invoice = await tx.invoice.findUnique({
    where: { id: invoiceId },
    include: { payments: true }
  });

  if (!invoice) return;

  const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0) + paymentAmount;
  const status = totalPaid >= invoice.amount ? "PAID" : "PARTIALLY_PAID";

  await tx.invoice.update({
    where: { id: invoiceId },
    data: { status }
  });
}

export async function updateBillStatus(
  tx: Prisma.TransactionClient,
  billId: string,
  paymentAmount: number
) {
  const bill = await tx.bill.findUnique({
    where: { id: billId },
    include: { payments: true }
  });

  if (!bill) return;

  const totalPaid = bill.payments.reduce((sum, p) => sum + p.amount, 0) + paymentAmount;
  const status = totalPaid >= bill.amount ? "PAID" : "PARTIALLY_PAID";

  await tx.bill.update({
    where: { id: billId },
    data: { status }
  });
}

export async function updateBankBalance(
  tx: Prisma.TransactionClient,
  accountId: string,
  amount: number,
  transactionType: TransactionType
) {
  const account = await tx.account.findUnique({
    where: { id: accountId }
  });

  if (!account) return;

  const balanceChange = transactionType === "INFLOW" ? amount : -amount;

  await tx.account.update({
    where: { id: accountId },
    data: {
      total_amount: {
        increment: balanceChange
      }
    }
  });
}

export async function updateAccountBalance(tx: Prisma.TransactionClient, accountId: string, amount: number, transactionType: TransactionType) {
  const account = await tx.account.findUnique({
    where: { id: accountId }
  });

  if (!account) return;

  const balanceChange = transactionType === "INFLOW" ? amount : -amount;

  await tx.account.update({
    where: { id: accountId },
    data: {
      total_amount: {
        increment: balanceChange
      }
    }
  });
}

export async function generateItemCode({ 
  accountId 
}: GenerateItemCodeParams): Promise<string> {
  // Get last item code
  const lastItem = await prisma.accountItem.findFirst({
    where: accountId ? { account_id: accountId } : undefined,
    orderBy: { item_code: "desc" }
  });

  const lastNumber = lastItem 
    ? parseInt(lastItem.item_code.substring(1)) 
    : 0;
  
  return `I${(lastNumber + 1).toString().padStart(4, "0")}`;
}

export async function generateBillNumber({ 
  organizationId 
}: GenerateBillNumberParams): Promise<string> {
  const lastBill = await prisma.bill.findFirst({
    where: {
      organization_id: organizationId,
    },
    orderBy: {
      created_at: "desc"
    }
  });

  const currentYear = new Date().getFullYear();
  const prefix = "BILL";
  
  // Get last number or start from 0
  const lastNumber = lastBill
    ? parseInt(lastBill.bill_number.split("-")[2])
    : 0;
  
  return `${prefix}-${currentYear}-${(lastNumber + 1).toString().padStart(5, "0")}`;
} 