import { publicProcedure } from "../trpc";
import { prisma } from "@/lib/prisma";
import { findByIdSchemaSchema } from "../dtos";

export const getAllNotificationByUserId = publicProcedure.input(findByIdSchemaSchema).query(async ({input}) => {
  
  const notification = await prisma.notification.findMany({
    where: {
     
      recipients: {
        some: {
          recipient_id: input.id,
        }
      },
      deleted_at: null
    },
    orderBy: {
      created_at: "desc"
    },
    select: {
      id: true,
      notification_type: true,
      title: true,
      message: true,
      deleted_at: true,
      created_at: true,
      status: true,
      is_read: true,
      priority: true,
      source_type: true,
      action_url: true,
      expires_at: true,
      additional_data: true,
      sent_at: true,
      recipients: {
        select: {
          recipient_id: true,
          is_admin: true,
          is_sender: true,
          recipient: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            }
          }
        }
      }
    }
  });
  return notification;
}); 

export const deleteNotification = publicProcedure.input(findByIdSchemaSchema).mutation(async ({input}) => {
  const notification = await prisma.notification.update({where: {id: input.id}, data: {deleted_at: new Date()}});
  return notification;
});

export const markNotificationAsRead = publicProcedure.input(findByIdSchemaSchema).mutation(async ({input}) => {
  const notification = await prisma.notification.update({where: {id: input.id}, data: {is_read: true, status: "READ"}});
  return notification;
});

export const getNotificationById = publicProcedure.input(findByIdSchemaSchema).query(async ({input}) => {
  const notification = await prisma.notification.findUnique({
    where: {id: input.id},
    select: {
      id: true,
      notification_type: true,
      title: true,
      message: true,
      recipients: {
        include: {
          recipient: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
          sender: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          }
        }
      }
    }
  });
  return notification;
});

export const getUnreadNotificationCount = publicProcedure.input(findByIdSchemaSchema).query(async ({input}) => {
  const notification = await prisma.notification.findMany({where: {recipients: {some: {recipient_id: input.id}}, is_read: false},orderBy: {created_at: "desc"},take: 5});
  return notification;
});
