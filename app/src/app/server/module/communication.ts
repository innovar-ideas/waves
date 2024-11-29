import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { ChatRole, ChatStatus, MessageChannel, MessageStatus, MessageType, Prisma } from "@prisma/client";
import { userRoleNames } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { publicProcedure } from "../trpc";
import { auth } from "@/auth";

export const getActiveUsers = publicProcedure
  .input(z.object({
    organizationSlug: z.string(),
  }))
  .query(async ({ input }) => {
    const session = await auth();
    const users = await prisma.user.findMany({
      where: {
        active: true,
        deleted_at: null,
        id: { not: session?.user.id || "" },
        OR: [
          { organization_id: input.organizationSlug },
        ]
      },
      include: {
        staffProfile: true,
      }
    });

    return users.map(user => ({
      id: user.id,
      name: `${user.first_name} ${user.last_name}`,
      email: user.email,
      role: user.staffProfile && "employee",
    }));
  });

export const createChat = publicProcedure
  .input(z.object({
    organizationSlug: z.string(),
    type: z.enum(["DIRECT", "GROUP"]),
    name: z.string().optional(),
    memberIds: z.array(z.string()),
    createdBy: z.string()
  }))
  .mutation(async ({ input }) => {
    const organization = await prisma.organization.findFirst({
      where: { id: input.organizationSlug }
    });

    if (!organization) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Organization not found"
      });
    }

    // For direct chats, check if chat already exists
    if (input.type === "DIRECT" && input.memberIds.length === 2) {
      const existingChat = await prisma.chat.findFirst({
        where: {
          type: "DIRECT",
          members: {
            every: {
              user_id: { in: input.memberIds }
            }
          }
        },
        include: {
          members: {
            include: {
              user: true
            }
          }
        }
      });

      if (existingChat) return existingChat;
    }

    return await prisma.chat.create({
      data: {
        organization_id: organization.id,
        type: input.type,
        name: input.type === "GROUP" ? input.name : undefined,
        members: {
          create: input.memberIds.map(userId => ({
            user_id: userId,
            role: userId === input.createdBy ? "ADMIN" : "MEMBER",
            joined_at: new Date()
          }))
        }
      },
      include: {
        members: {
          include: {
            user: true
          }
        }
      }
    });
  });

export const sendMessage = publicProcedure
  .input(z.object({
    chatId: z.string(),
    content: z.any(),
    messageType: z.nativeEnum(MessageType),
    channels: z.array(z.nativeEnum(MessageChannel)).optional()
  }))
  .mutation(async ({ input }) => {
    const chat = await prisma.chat.findUnique({
      where: { id: input.chatId },
      include: { organization: true }
    });

    if (!chat) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Chat not found"
      });
    }
    const session = await auth();

    const message = await prisma.message.create({
      data: {
        content: input.content as string,
        sender_id: session?.user.id || "",
        chat_id: input.chatId,
        message_type: input.messageType,
        organization_id: chat.organization_id,
        deliveries: {
          create: (input.channels || [MessageChannel.INTERNAL]).map(channel => ({
            channel,
            status: MessageStatus.QUEUED,
            organization_id: chat.organization_id
          }))
        }
      },
      include: {
        sender: true,
        deliveries: true
      }
    });

    return message;
  });

export const getChatMessages = publicProcedure
  .input(z.object({
    chatId: z.string(),
    limit: z.number().default(50),
    cursor: z.string().optional()
  }))
  .query(async ({ input }) => {
    const chat = await prisma.chat.findUnique({
      where: { id: input.chatId },
      include: { members: { include: { user: true } } }
    });
    const messages = await prisma.message.findMany({
      where: {
        chat_id: input.chatId,
        deleted_at: null
      },
      take: input.limit + 1,
      cursor: input.cursor ? { id: input.cursor } : undefined,
      orderBy: {
        created_at: "desc"
      },
      include: {
        sender: true,
        deliveries: true
      }
    });

    let nextCursor: typeof input.cursor | undefined = undefined;
    if (messages.length > input.limit) {
      const nextItem = messages.pop();
      nextCursor = nextItem?.id;
    }

    return {
      chat,
      messages,
      nextCursor
    };
  });

export const getUserChats = publicProcedure
  .input(z.object({
    organizationSlug: z.string()
  }))
  .query(async ({ input }) => {
    const session = await auth();
    const chats = await prisma.chat.findMany({
      where: {
        organization: { id: input.organizationSlug },
        type: "DIRECT",
        members: {
          some: {
            user_id: session?.user.id || ""
          }
        },
        deleted_at: null
      },
      include: {
        members: {
          include: {
            user: true
          }
        },
        messages: {
          take: 1,
          orderBy: {
            created_at: "desc"
          },
          include: {
            sender: true
          }
        }
      },
      orderBy: {
        updated_at: "desc"
      }
    });

    return chats;
  });

export const createBroadcast = publicProcedure
  .input(z.object({
    organizationSlug: z.string(),
    subject: z.string(),
    content: z.string(),
    recipients: z.array(z.object({
      id: z.string(),
      group: z.enum(["Individuals", "Staff", "Groups"]),
      isAll: z.boolean().optional()
    })),
    channels: z.object({
      email: z.boolean(),
      sms: z.boolean(),
      whatsapp: z.boolean()
    })
  }))
  .mutation(async ({ input }) => {
    const session = await auth();
    const organization = await prisma.organization.findFirst({
      where: { id: input.organizationSlug }
    });

    if (!organization) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Organization not found"
      });
    }

    const selectedChannels: MessageChannel[] = [];
    if (input.channels.email) selectedChannels.push(MessageChannel.EMAIL);
    if (input.channels.sms) selectedChannels.push(MessageChannel.SMS);
    if (input.channels.whatsapp) selectedChannels.push(MessageChannel.WHATSAPP);

    const chatPromises = input.recipients.map(async recipient => {
      let userIds: string[] = [];

      if (recipient.id === "all-parents" || recipient.id === "all-classes" || recipient.id === "all-staffs") {
        switch (recipient.group) {
          case "Staff":
            {
              const allStaff = await prisma.user.findMany({
                where: {
                  organization_id: organization.id,
                  staffProfile: { some: { organization_id: organization.id } },
                  active: true,
                  deleted_at: null
                }
              });
              userIds = allStaff.map(staff => staff.id);
              break;
            }
        }
      } else {
        switch (recipient.group) {
          case "Individuals":
          case "Staff":
            userIds = [recipient.id];
            break;
          case "Groups":
            {
              const groupMembers = await prisma.chatMember.findMany({
                where: { chat_id: recipient.id },
                select: { user_id: true }
              });
              userIds = groupMembers.map(member => member.user_id);
              break;
            }
        }
      }

      return Promise.all(userIds.map(userId => {
        return prisma.chat.create({
          data: {
            type: "BROADCAST",
            name: input.subject,
            organization_id: organization.id,
            members: {
              create: {
                user_id: userId,
                role: "MEMBER",
                joined_at: new Date()
              }
            },
            messages: {
              create: {
                content: input.content,
                message_type: MessageType.TEXT,
                organization_id: organization.id,
                sender_id: session?.user.id || "",
                deliveries: {
                  create: selectedChannels.map(channel => ({
                    channel,
                    status: MessageStatus.SENT,
                    organization_id: organization.id
                  }))
                }
              }
            }
          }
        });
      }));
    });

    await Promise.all(chatPromises);

    return { success: true };
  });

export const saveBroadcastDraft = publicProcedure
  .input(z.object({
    organizationSlug: z.string(),
    subject: z.string(),
    content: z.string(),
    recipients: z.array(z.object({
      id: z.string(),
      group: z.enum(["Individuals", "Staff", "Groups"])
    })),
    channels: z.object({
      email: z.boolean(),
      sms: z.boolean(),
      whatsapp: z.boolean()
    })
  }))
  .mutation(async ({ input }) => {
    const session = await auth();
    const organization = await prisma.organization.findFirst({
      where: { id: input.organizationSlug }
    });

    if (!organization) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Organization not found"
      });
    }


    const draftChat = await prisma.chat.create({
      data: {
        type: "BROADCAST",
        name: input.subject,
        status: "DRAFT", // Set chat status to DRAFT
        organization_id: organization.id,
        members: {
          create: {
            user_id: session?.user.id || "",
            role: "ADMIN",
            joined_at: new Date()
          }
        },
        messages: {
          create: {
            content: input.content,
            message_type: MessageType.TEXT,
            organization_id: organization.id,
            sender_id: session?.user.id || "",
            deliveries: {
              create: [] // No deliveries for drafts
            }
          }
        }
      }
    });

    return draftChat;
  });

export const getRecipients = publicProcedure
  .input(z.object({
    organizationSlug: z.string()
  }))
  .query(async ({ input }) => {
    const organization = await prisma.organization.findFirst({
      where: { id: input.organizationSlug as string }
    });

    if (!organization) {
      throw new Error("Organization not found");
    }

    const staff = await prisma.user.findMany({
      where: {
        active: true,
        deleted_at: null,
        staffProfile: { some: { organization_id: input.organizationSlug } }
      }
    });

    const groups = await prisma.chat.findMany({
      where: {
        type: "GROUP",
        organization_id: organization.id
      }
    });

    return {

      staff,
      groups
    };
  });

export const getDraftMessages = publicProcedure
  .input(z.object({
    organizationSlug: z.string()
  }))
  .query(async ({ input }) => {
    const session = await auth();
    const drafts = await prisma.chat.findMany({
      where: {
        organization: { slug: input.organizationSlug },
        type: "BROADCAST",
        status: "DRAFT",
        members: {
          some: {
            user_id: session?.user.id || ""
          }
        },
        deleted_at: null
      },
      include: {
        members: {
          include: {
            user: true
          }
        },
        messages: {
          orderBy: {
            created_at: "desc"
          },
          include: {
            sender: true
          }
        }
      }
    });

    return drafts;
  });

// New procedure to mark messages as read
export const markMessagesAsRead = publicProcedure
  .input(z.object({
    chatId: z.string(),
    userId: z.string()
  }))
  .mutation(async ({ input }) => {
    await prisma.message.updateMany({
      where: {
        chat_id: input.chatId,
        sender_id: { not: input.userId },
        read: false
      },
      data: {
        read: true
      }
    });
  });

// Query to get unread message count
export const getUnreadMessageCount = publicProcedure
  .input(z.object({
    organizationSlug: z.string()
  }))
  .query(async ({ input }) => {
    const session = await auth();
    const count = await prisma.message.count({
      where: {
        read: false,
        sender_id: { not: session?.user.id },
        chat: {
          organization: { id: input.organizationSlug },
          type: "DIRECT",
          members: {
            some: {
              user_id: session?.user.id || ""
            }
          }
        }
      }
    });

    return count;
  });

// Query to get draft count
export const getDraftCount = publicProcedure
  .input(z.object({
    organizationSlug: z.string()
  }))
  .query(async ({ input }) => {
    const session = await auth();
    const count = await prisma.chat.count({
      where: {
        organization: { id: input.organizationSlug },
        type: "BROADCAST",
        status: "DRAFT",
        deleted_at: null,
        members: {
          some: {
            user_id: session?.user.id || ""
          }
        }
      }
    });

    return count;
  });

// Query to get sent messages
export const getSentMessages = publicProcedure
  .input(z.object({
    organizationSlug: z.string()
  }))
  .query(async ({ input }) => {
    const session = await auth();
    const sentMessages = await prisma.chat.findMany({
      where: {
        organization: { id: input.organizationSlug },
        type: "BROADCAST",
        messages: {
          some: {
            sender_id: session?.user.id || "",
            deliveries: {
              some: {
                status: MessageStatus.SENT
              }
            }
          }
        },
        members: {
          some: {
            user_id: session?.user.id || ""
          }
        },
        deleted_at: null
      },
      include: {
        members: {
          include: {
            user: true
          }
        },
        messages: {
          orderBy: {
            created_at: "desc"
          },
          include: {
            sender: true
          }
        }
      }
    });

    return sentMessages;
  });

// Query to get trashed messages
export const getTrashedMessages = publicProcedure
  .input(z.object({
    organizationSlug: z.string()
  }))
  .query(async ({ input }) => {
    const session = await auth();
    const trashedMessages = await prisma.chat.findMany({
      where: {
        organization: { slug: input.organizationSlug },
        members: {
          some: {
            user_id: session?.user.id || ""
          }
        },
        deleted_at: { not: null }
      },
      include: {
        members: {
          include: {
            user: true
          }
        },
        messages: {
          orderBy: {
            created_at: "desc"
          },
          include: {
            sender: true
          }
        }
      }
    });

    return trashedMessages;
  });

// Query to get group chats
export const getGroupChats = publicProcedure
  .input(z.object({
    organizationSlug: z.string()
  }))
  .query(async ({ input }) => {
    const session = await auth();
    const groupChats = await prisma.chat.findMany({
      where: {
        organization: { id: input.organizationSlug },
        type: "GROUP",
        members: {
          some: {
            user_id: session?.user.id || ""
          }
        },
        deleted_at: null
      },
      include: {
        members: {
          include: {
            user: true
          }
        },
        messages: {
          orderBy: {
            created_at: "desc"
          },
          include: {
            sender: true
          }
        }
      }
    });

    return groupChats;
  });

export const getGroupChatMessages = publicProcedure
  .input(z.object({
    chatId: z.string()
  }))
  .query(async ({ input }) => {
    const session = await auth();
    const chat = await prisma.chat.findUnique({
      where: { id: input.chatId },
      include: {
        members: {
          include: {
            user: true
          }
        },
        messages: {
          orderBy: {
            created_at: "desc"
          },
          include: {
            sender: true
          }
        }
      }
    });

    if (!chat || !chat.members.some(member => member.user_id === session?.user.id)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You do not have access to this chat"
      });
    }

    return chat;
  });

export const getDraftChatById = publicProcedure
  .input(z.object({
    draftId: z.string(),
  }))
  .query(async ({ input }) => {
    const session = await auth();
    const draftChat = await prisma.chat.findUnique({
      where: {
        id: input.draftId,
        members: {
          some: {
            user_id: session?.user.id || ""
          }
        }
      },
      include: {
        members: {
          include: {
            user: true
          }
        },
        messages: {

          orderBy: {
            created_at: "desc"
          },
          include: {
            sender: true,
            deliveries: true
          },

        }
      }
    });

    if (!draftChat || draftChat.status !== "DRAFT") {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Draft not found"
      });
    }

    return draftChat;
  });

export const updateDraft = publicProcedure
  .input(z.object({
    draftId: z.string(),
    subject: z.string(),
    content: z.string(),
    recipients: z.array(z.object({
      id: z.string(),
      group: z.enum(["Parents", "Individuals", "Classes", "Staff", "Groups"])
    })),
    channels: z.object({
      email: z.boolean(),
      sms: z.boolean(),
      whatsapp: z.boolean()
    })
  }))
  .mutation(async ({ input }) => {
    const draftChat = await prisma.chat.update({
      where: { id: input.draftId },
      data: {
        name: input.subject,
        messages: {
          update: {
            where: { id: input.draftId },
            data: {
              content: input.content,
              deliveries: {
                deleteMany: {},
                create: [] // No deliveries for drafts
              }
            }
          }
        }
      }
    });

    return draftChat;
  });

export const sendDraft = publicProcedure
  .input(z.object({
    draftId: z.string(),
    subject: z.string(),
    content: z.string(),
    organizationSlug: z.string(),
    recipients: z.array(z.object({
      id: z.string(),
      group: z.enum(["Parents", "Individuals", "Classes", "Staff", "Groups"])
    })),
    channels: z.object({
      email: z.boolean(),
      sms: z.boolean(),
      whatsapp: z.boolean()
    })
  }))
  .mutation(async ({ input }) => {
    const session = await auth();
    const selectedChannels: MessageChannel[] = [];
    if (input.channels.email) selectedChannels.push(MessageChannel.EMAIL);
    if (input.channels.sms) selectedChannels.push(MessageChannel.SMS);
    if (input.channels.whatsapp) selectedChannels.push(MessageChannel.WHATSAPP);

    const organization = await prisma.organization.findFirst({
      where: { id: input.organizationSlug }
    });
    if (!organization) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Organization not found"
      });
    }



    // Then update the chat and create new message
    const draftChat = await prisma.chat.update({
      where: { id: input.draftId },
      data: {
        status: "ACTIVE",
        messages: {
          create: {
            content: input.content,
            message_type: MessageType.TEXT,
            organization_id: organization.id,
            sender_id: session?.user.id || "",
            deliveries: {
              create: selectedChannels.map(channel => ({
                channel,
                status: MessageStatus.QUEUED,
                organization_id: organization.id
              }))
            }
          }
        }
      }
    });

    return draftChat;
  });

export const getComplaintChats = publicProcedure
  .input(z.object({
    slug: z.string(),
    page: z.number().default(0),
    limit: z.number().default(10)
  }))
  .query(async ({ input }) => {
    const session = await auth();
    if (!session?.user?.id) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in to view complaint chats"
      });
    }

    // Get user with their claims
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        roles: {
          include: {
            role: true,
          }
        },
      }
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found"
      });
    }


    const isOwner = user.roles.some(claim =>
      claim.role?.name === userRoleNames.admin
    );
    const canManageComplaints = user.roles.some(claim =>
      claim.role?.name === userRoleNames.employee
    );


    const whereClause: Prisma.ChatWhereInput = {
      type: "COMPLAINT",
      organization: { id: input.slug },
      deleted_at: null,
      ...((!isOwner && !canManageComplaints) && {
        members: {
          some: {
            user_id: session.user.id
          }
        }
      })
    };

    const complaints = await prisma.chat.findMany({
      where: whereClause,
      include: {
        members: {
          include: {
            user: true
          }
        },
        messages: {
          orderBy: {
            created_at: "desc"
          },
          include: {
            sender: true
          }
        }
      },
      orderBy: {
        updated_at: "desc"
      },
      skip: input.page * input.limit,
      take: input.limit
    });

    return complaints.map(chat => ({
      id: chat.id,
      name: chat.name,
      description: chat.messages[0]?.content || "",
      status: chat.status,
      timestamp: chat.updated_at.toISOString(),
      isOwner: isOwner || canManageComplaints
    }));
  });

export const getFeedbackChats = publicProcedure
  .input(z.object({
    slug: z.string(),
    page: z.number().default(0),
    limit: z.number().default(10)
  }))
  .query(async ({ input }) => {
    // Check if user exists in session
    const session = await auth();
    if (!session?.user?.id) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in to view feedback chats"
      });
    }

    // Get user with their claims
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        roles: true,
      }
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found"
      });
    }

    // Check if user is owner or has MANAGE_FEEDBACK permission
    const isOwner = user.roles.some(claim =>
      claim.role_name === userRoleNames.admin
    );
    const canManageFeedback = user.roles.some(claim =>
      claim.role_name === (userRoleNames.supervisor || userRoleNames.finance)
    );

    // Build the where clause based on user role
    const whereClause: Prisma.ChatWhereInput = {
      type: "FEEDBACK",
      organization: { id: input.slug },
      deleted_at: null,
      ...({
        members: {
          some: {
            user_id: session.user.id
          }
        }
      })
    };

    const feedback = await prisma.chat.findMany({
      where: whereClause,
      include: {
        members: {
          include: {
            user: true
          }
        },
        messages: {
          orderBy: {
            created_at: "desc"
          },
          include: {
            sender: true,
          }
        }
      },
      orderBy: {
        updated_at: "desc"
      },
      skip: input.page * input.limit,
      take: input.limit
    });

    return feedback.map(chat => ({
      id: chat.id,
      name: chat.name,
      description: chat.members?.[0]?.user.first_name + " " + chat.members?.[0]?.user.last_name + " " + chat.messages?.[0]?.content || "",
      status: chat.status,
      timestamp: chat.updated_at.toISOString(),
      isOwner: isOwner || canManageFeedback
    }));
  });

// export const getParentChats = publicProcedure
//   .input(z.object({
//     organizationSlug: z.string(),
//     page: z.number().default(0),
//     limit: z.number().default(10)
//   }))
//   .query(async ({ input }) => {
//     const parentChats = await prisma.chat.findMany({
//       where: {
//         type: "DIRECT",
//         members: {
//           some: {
//             user: {
//               guardian: {
//                 organization: { slug: input.organizationSlug }
//               }
//             }
//           }
//         },
//         deleted_at: null
//       },
//       include: {
//         members: {
//           include: {
//             user: true
//           }
//         },
//         messages: {
//           take: 1,
//           orderBy: {
//             created_at: "desc"
//           },
//           include: {
//             sender: true
//           }
//         }
//       },
//       skip: input.page * input.limit,
//       take: input.limit
//     });

//     return parentChats.map(chat => ({
//       id: chat.id,
//       name: chat.name,
//       lastMessage: chat.messages[0]?.content || "No messages yet",
//       timestamp: chat.updated_at.toISOString(),
//       members: chat.members.map(member => ({
//         id: member.user.id,
//         name: `${member.user.first_name} ${member.user.surname}`
//       }))
//     }));
//   });

// export const getTeacherChats = publicProcedure
//   .input(z.object({
//     organizationSlug: z.string(),
//     page: z.number().default(0),
//     limit: z.number().default(10)
//   }))
//   .query(async ({ input }) => {
//     const teacherChats = await prisma.chat.findMany({
//       where: {
//         type: "DIRECT",
//         members: {
//           some: {
//             user: {
//               Staff: {
//                 organization: { slug: input.organizationSlug }
//               }
//             }
//           }
//         },
//         deleted_at: null
//       },
//       include: {
//         members: {
//           include: {
//             user: true
//           }
//         },
//         messages: {
//           take: 1,
//           orderBy: {
//             created_at: "desc"
//           },
//           include: {
//             sender: true
//           }
//         }
//       },
//       skip: input.page * input.limit,
//       take: input.limit
//     });

//     return teacherChats.map(chat => ({
//       id: chat.id,
//       name: chat.name,
//       lastMessage: chat.messages[0]?.content || "No messages yet",
//       timestamp: chat.updated_at.toISOString(),
//       members: chat.members.map(member => ({
//         id: member.user.id,
//         name: `${member.user.first_name} ${member.user.surname}`
//       }))
//     }));
//   });

export const createComplaint = publicProcedure
  .input(z.object({
    subject: z.string(),
    message: z.string(),
    organizationSlug: z.string()
  }))
  .mutation(async ({ input }) => {
    const session = await auth();
    const organization = await prisma.organization.findFirst({
      where: { id: input.organizationSlug }
    });

    if (!organization) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Organization not found"
      });
    }

    const schoolOwner = await prisma.user.findFirst({
      where: {
        organization_id: organization.slug,
        roles: { some: { role_name: userRoleNames.admin } }

      }
    });

    const managers = await prisma.user.findMany({
      where: {
        staffProfile: {
          some: { organization_id: organization.slug, user: { roles: { some: { role_name: userRoleNames.admin } } } },
        }
      }
    });

    const chat = await prisma.chat.create({
      data: {
        type: "COMPLAINT",
        name: input.subject,
        organization_id: organization.id,
        members: {
          create: [
            { user_id: session?.user.id || "", role: ChatRole.MEMBER, joined_at: new Date() },
            { user_id: schoolOwner?.id || "", role: ChatRole.ADMIN, joined_at: new Date() },
            ...managers.map(manager => ({
              user_id: manager.id,
              role: ChatRole.MEMBER,
              joined_at: new Date()
            }))
          ]
        },
        messages: {
          create: {
            content: input.message,
            message_type: MessageType.TEXT,
            organization_id: organization.id,
            sender_id: session?.user.id || "",
          }
        }
      }
    });

    return chat;
  });

export const getParentComplaintAndFeedbackMessages = publicProcedure
  .input(z.object({
    chatId: z.string()
  }))
  .query(async ({ input }) => {
    const session = await auth();
    const chat = await prisma.chat.findUnique({
      where: { id: input.chatId },
      include: {
        members: {
          include: {
            user: true
          }
        },
        messages: {
          orderBy: {
            created_at: "desc"
          },
          include: {
            sender: true
          }
        }
      }
    });

    if (!chat || !chat.members.some(member => member.user_id === session?.user.id)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You do not have access to this chat"
      });
    }

    return chat;
  });

export const markComplaintAsClosed = publicProcedure
  .input(z.object({
    chatId: z.string()
  }))
  .mutation(async ({ input }) => {
    const session = await auth();
    const chat = await prisma.chat.findUnique({
      where: { id: input.chatId },
      include: {
        members: {
          include: {
            user: {
              include: {
                roles: {
                  include: {
                    role: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!chat) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Chat not found"
      });
    }

    const userHasPermission = chat.members.some(member =>
      member.user_id === session?.user.id &&
      member.user.roles.some(claim =>
        claim.role?.name === userRoleNames.admin || claim.role?.name === "OWNER"
      )
    );

    if (!userHasPermission) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You do not have permission to close this complaint"
      });
    }

    await prisma.chat.update({
      where: { id: input.chatId },
      data: { status: ChatStatus.RESOLVED }
    });
  });

export const createFeedback = publicProcedure
  .input(z.object({
    subject: z.string(),
    message: z.string(),
    organizationSlug: z.string()
  }))
  .mutation(async ({ input }) => {
    const session = await auth();
    const organization = await prisma.organization.findFirst({
      where: { id: input.organizationSlug }
    });

    if (!organization) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Organization not found"
      });
    }

    const schoolOwner = await prisma.user.findFirst({
      where: {
        organization_id: organization.slug,
        roles: { some: { role_name: userRoleNames.admin } }

      }
    });

    const managers = await prisma.user.findMany({
      where: {
        staffProfile: {
          some: { organization_id: organization.slug, user: { roles: { some: { role_name: userRoleNames.admin } } } },
        }
      }
    });

    const chat = await prisma.chat.create({
      data: {
        type: "FEEDBACK",
        name: input.subject,
        organization_id: organization.id,
        members: {
          create: [
            { user_id: session?.user.id || "", role: ChatRole.MEMBER, joined_at: new Date() },
            { user_id: schoolOwner?.id || "", role: ChatRole.ADMIN, joined_at: new Date() },
            ...managers.map(manager => ({
              user_id: manager.id,
              role: ChatRole.MEMBER,
              joined_at: new Date()
            }))
          ]
        },
        messages: {
          create: {
            content: input.message,
            message_type: MessageType.TEXT,
            organization_id: organization.id,
            sender_id: session?.user.id || "",
          }
        }
      }
    });

    return chat;
  });

export const markFeedbackAsResolved = publicProcedure
  .input(z.object({
    chatId: z.string()
  }))
  .mutation(async ({ input }) => {
    const session = await auth();
    const chat = await prisma.chat.findUnique({
      where: { id: input.chatId },
      include: {
        members: {
          include: {
            user: {
              include: {
                roles: {
                  include: {
                    role: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!chat) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Chat not found"
      });
    }

    const userHasPermission = chat.members.some(member =>
      member.user_id === session?.user.id &&
      member.user.roles.some(claim =>
        claim.role?.name === userRoleNames.admin || claim.role?.name === userRoleNames.employee
      )
    );

    if (!userHasPermission) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You do not have permission to close this complaint"
      });
    }

    await prisma.chat.update({
      where: { id: input.chatId },
      data: { status: ChatStatus.RESOLVED }
    });
  });

