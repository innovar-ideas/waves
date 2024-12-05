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
};
export type NotificationAdditionalData = {
  data: string;
};

export type NotificationPayload = {
  userId: string; // Target user ID
  title: string; // Notification title
  message: string; // Notification body
  recipientIds?: NotificationRecipientId[]; // Array of recipient IDs (optional)
  additionalData?: NotificationAdditionalData[]; // Additional data (optional)
  notificationType: "Loan" | "Payment" | "Other"| "Leave"; // Notification type

};

export async function sendNotification(payload: NotificationPayload) {
  const { userId, title, message} = payload;

  // Step 1: Save notification to the database
  const notification = await prisma.notification.create({
    data: {
      user_id: userId,
      title,
      message,
      additional_data: payload.additionalData || [],
      source_type: payload.notificationType,
      sent_at: new Date(),
    },
  });
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new Error("User not found");
  }


  const { recipientIds } = payload;

  const notificationRecipients: NotificationRecipients[] = [];
  recipientIds?.forEach(async (recipientId) => {
    notificationRecipients.push(
      await prisma.notificationRecipients.create({
        data: {
          recipient_id: recipientId.id,
          notification_id: notification.id,
          is_admin: recipientId.isAdmin || false,
          sender_id: user.id,
        },
      })
    );
  });
  

  // Step 2: Send real-time notification via Firebase
  

  

  return notification;
}
