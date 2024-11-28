import { Event } from "@prisma/client";

interface StoredData {
  version: number;
  state: {
    organizationSlug: string;
  };
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