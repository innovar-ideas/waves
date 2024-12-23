import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { prisma } from "./prisma";
import { NotificationRecipients } from "@prisma/client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(input?: number | string): string {
  return Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(
    Number(input ?? 0)
  );
}

export function groupVoucherNumber(voucher: string) {
  const groups: string[] = [];
  for (let i = 0; i < voucher.length; i += 4) {
    groups.push(voucher.substring(i, i + 4));
  }

  return groups;
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    // hour: "2-digit",
    // minute: "2-digit",
    // hour12: true
  }).format(date);
}

export type NotificationRecipientId = {
  id: string;
  isAdmin?: boolean;
  is_sender?: boolean;
  sender_id?: string;
};
export type NotificationAdditionalData = {
  data: string;
};

export type NotificationPayload = {
  is_sender: boolean;
  title: string; // Notification title
  message: string; // Notification body
  recipientIds?: NotificationRecipientId[]; // Array of recipient IDs (optional)
  additionalData?: NotificationAdditionalData[]; // Additional data (optional)
  notificationType: "Loan" | "Payment" | "Other"| "Leave"; // Notification type

};

export async function sendNotification(payload: NotificationPayload) {
    const {  title, message } = payload;

  const notification = await prisma.notification.create({
    data: {
      title,
      message,
      additional_data: payload.additionalData || [],
      source_type: payload.notificationType,
      sent_at: new Date(),
    },
  });
  

  const { recipientIds } = payload;

  const notificationRecipients: NotificationRecipients[] = [];
  recipientIds?.forEach(async (recipientId) => {
    notificationRecipients.push(
      await prisma.notificationRecipients.create({
        data: {
          sender_id: recipientId.sender_id as unknown as string,
          recipient_id: recipientId.id,
          notification_id: notification.id,
          is_admin: recipientId.isAdmin || false,
          is_sender: recipientId.is_sender || false,
        },
      })
    );
  });

  return notification;
}

export function getBaseUrl() {
  if (typeof window !== "undefined")
    // browser should use relative path
    return "";
  if (process.env.VERCEL_URL)
    // reference for vercel.com
    return `https://${process.env.VERCEL_URL}`;
  if (process.env.RENDER_INTERNAL_HOSTNAME)
    // reference for render.com
    return `http://${process.env.RENDER_INTERNAL_HOSTNAME}:${process.env.PORT}`;

  // assume localhost
  return `${process.env.NEXT_PUBLIC_BROWSER_URL}`;
}