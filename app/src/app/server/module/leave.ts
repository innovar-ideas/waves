import { publicProcedure } from "../trpc";
import { changeLeaveApplicationStatusSchema, createLeaveApplicationSchema, createLeaveSettingSchema, deleteLeaveApplicationSchema, updateLeaveApplicationSchema, updateLeaveSettingSchema } from "../dtos";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { LeaveApplication, LeaveSetting, User } from "@prisma/client";
import {  formatDate, sendNotification } from "@/lib/utils";

export type LeaveApplicationWithLeaveSetting =  {
  leave_setting: LeaveSetting;
  user: User;
  leave_application: LeaveApplication;
};

export const createLeaveSetting = publicProcedure.input(createLeaveSettingSchema).mutation(async (opts)=>{
  try{
  const organization = await prisma.organization.findUnique({
    where: {
      id: opts.input.slug
    }
  });
  
  if(!organization){
    throw new Error("Organization not found");
  }
  const leaveSetting = await prisma.leaveSetting.create({
    data: {
      name: opts.input.name,
      type: opts.input.type,
      role_level: opts.input.role_level,
      duration: opts.input.duration,
      applicable_to: opts.input.applicable_to,
      organization_id: opts.input.slug
    }
  });
  return leaveSetting;
}catch(error){
  console.log(error); }
});


export const getAllLeaveSetting = publicProcedure.query(async ()=>{
  return await prisma.leaveSetting.findMany({
    where: {
      deleted_at: null
    }
  });
});

export const updateLeaveSetting = publicProcedure.input(updateLeaveSettingSchema).mutation(async (opts)=>{
 return await prisma.leaveSetting.update({
    where: {
      id: opts.input.id
    },
    data: opts.input
  });
});

export const deleteLeaveSetting = publicProcedure.input(z.object({
  id: z.string()
})).mutation(async (opts)=>{
  return await prisma.leaveSetting.update({
    where: {
      id: opts.input.id
    },
    data: {
      deleted_at: new Date()
    }
  });
});

export const createLeaveApplication = publicProcedure.input(createLeaveApplicationSchema).mutation(async (opts)=>{
  const leave_setting = await prisma.leaveSetting.findUnique({
    where: {
      id: opts.input.leave_setting_id
    }
  });
  const staff = await prisma.staffProfile.findUnique({
    where: {
      user_id: opts.input.user_id
    },
    include: {
      user: true,
      team_designation: {
        include: {
          designation: {
            select: {
              role_level: true
            }
          }
        }
      }
    }
  });
  if(!staff) throw new Error("Staff profile not found");
  if(!leave_setting) throw new Error("Leave setting not found");
  
  // Add null checks and default to 0 if undefined
  const staffRoleLevel = staff.team_designation?.designation?.role_level ?? 0;
  const leaveSettingRoleLevel = leave_setting.role_level ?? 0;
  
  if(staffRoleLevel > leaveSettingRoleLevel) {
    throw new Error("You are not authorized to apply for this leave");
  }

   const startDate = new Date(opts.input.start_date);
   const endDate = new Date(opts.input.end_date);
   
   // Calculate working days between dates (excluding weekends)
   let workingDays = 0;
   const currentDate = new Date(startDate);
   
   while (currentDate <= endDate) {
     // 0 is Sunday, 6 is Saturday
     const dayOfWeek = currentDate.getDay();
     if (dayOfWeek !== 0 && dayOfWeek !== 6) {
       workingDays++;
     }
     currentDate.setDate(currentDate.getDate() + 1);
   }
   
   if (workingDays > leave_setting.duration) {
     throw new Error(`Leave application duration (${workingDays} working days) exceeds the maximum allowed duration of ${leave_setting.duration} days`);
   }
   const admin = await prisma.user.findMany({
    where: {
      organization_id: opts.input.organization_id,
      roles: {
        some: {
          role: {
            name: "admin"
          }
        }
      }
    }
  });

  const user = await prisma.user.findUnique({where: {id: opts.input.user_id}});
  if(!user) throw new Error("User not found");

  const leaveApplication = await prisma.leaveApplication.create({
    data: {
      ...opts.input,
      status: "pending"
    }
  });

  await sendNotification({
    is_sender: false,
    title: "Leave Application",
    message: `New leave application received from ${user.first_name} ${user.last_name}. Leave type: ${leave_setting.name}, Duration: ${workingDays} working days, From: ${formatDate(new Date(leaveApplication.start_date))} To: ${formatDate(new Date(leaveApplication.end_date))}${leaveApplication.reason ? `. Reason: ${leaveApplication.reason}` : ""}. Please review and approve/reject this application.`,
    notificationType: "Leave",
    recipientIds: admin.map(admin => ({ id: admin.id, isAdmin: true, sender_id: opts.input.sender_id as unknown as string }))
  });
  
return leaveApplication;
});

export const updateLeaveApplication = publicProcedure.input(updateLeaveApplicationSchema).mutation(async (opts)=>{
  const leaveApplicationIn = await prisma.leaveApplication.findUnique({
    where: {
      id: opts.input.id
    }
  });
  if(!leaveApplicationIn) throw new Error("Leave application not found");
  if(leaveApplicationIn.status === "approved" || leaveApplicationIn.status === "rejected" || leaveApplicationIn.status !== "pending") throw new Error("Leave application already approved or rejected, you cannot update it");
  const leaveApplication = await prisma.leaveApplication.update({
    where: {
      id: opts.input.id
    },
    data: opts.input
  });

  

  await sendNotification({
    is_sender: false,
    title: "Leave Application",
    message: `Your leave application has been ${opts.input.status}`,
    notificationType: "Leave",
    recipientIds: [{ id: leaveApplication.user_id, isAdmin: false, is_sender: false, sender_id: opts.input.sender_id as unknown as string }]
  });

  return leaveApplication;
});

export const deleteLeaveApplication = publicProcedure.input(deleteLeaveApplicationSchema).mutation(async (opts)=>{
  return await prisma.leaveApplication.update({
    where: {
      id: opts.input.id
    },
    data: {
      deleted_at: new Date()
    }
  });
});
export const getAllLeaveApplication = publicProcedure.input(z.object({
  user_id: z.string()
})).query(async (opts)=>{
  return await prisma.leaveApplication.findMany({
    where: {
      deleted_at: null,
      user_id: opts.input.user_id
    },
    include: {
      leave_setting: true,
      user: true
    },
    orderBy: {
      created_at: "desc"
    }
  });
});

export const getAllLeaveApplicationByOrganization = publicProcedure.input(z.object({
  organization_id: z.string()
})).query(async (opts)=>{
  const applications = await prisma.leaveApplication.findMany({
    where: {
      deleted_at: null,
      organization_id: opts.input.organization_id
    },
    include: {
      leave_setting: true,
      user: true,
    },
    orderBy: {
      created_at: "desc"
    }
  });

  return applications.map(application => ({
    leave_setting: application.leave_setting,
    user: application.user,
    leave_application: {
      id: application.id,
      user_id: application.user_id,
      leave_setting_id: application.leave_setting_id,
      organization_id: application.organization_id,
      start_date: application.start_date,
      end_date: application.end_date,
      reason: application.reason,
      status: application.status,
      created_at: application.created_at,
      updated_at: application.updated_at,
      deleted_at: application.deleted_at
    }
  })) as LeaveApplicationWithLeaveSetting[];
});

export const getAllPendingLeaveApplicationByOrganization = publicProcedure.input(z.object({
  organization_id: z.string()
})).query(async (opts)=>{
  const applications = await prisma.leaveApplication.findMany({
    where: {
      deleted_at: null,
      organization_id: opts.input.organization_id,
      status: "pending"
    },
    include: {
      leave_setting: true,
      user: true
    },
    orderBy: {
      created_at: "desc"
    }
  });

  return applications.map(application => ({
    leave_setting: application.leave_setting,
    user: application.user,
    leave_application: {
      id: application.id,
      user_id: application.user_id,
      leave_setting_id: application.leave_setting_id,
      organization_id: application.organization_id,
      start_date: application.start_date,
      end_date: application.end_date,
      reason: application.reason,
      status: application.status,
      created_at: application.created_at,
      updated_at: application.updated_at,
      deleted_at: application.deleted_at
    }
  })) as LeaveApplicationWithLeaveSetting[];
});

export const getAllApprovedLeaveApplicationByOrganization = publicProcedure.input(z.object({
  organization_id: z.string(),
  status: z.string()
})).query(async (opts)=>{
  const applications = await prisma.leaveApplication.findMany({
    where: {
      deleted_at: null,
      organization_id: opts.input.organization_id,
      status: "approved"
    },
    include: {
      leave_setting: true,
      user: true
    },
    orderBy: {
      created_at: "desc"
    }
  });

  return applications.map(application => ({
    leave_setting: application.leave_setting,
    user: application.user,
    leave_application: {
      id: application.id,
      user_id: application.user_id,
      leave_setting_id: application.leave_setting_id,
      organization_id: application.organization_id,
      start_date: application.start_date,
      end_date: application.end_date,
      reason: application.reason,
      status: application.status,
      created_at: application.created_at,
      updated_at: application.updated_at,
      deleted_at: application.deleted_at
    }
  })) as LeaveApplicationWithLeaveSetting[];
});

export const getAllRejectedLeaveApplicationByOrganization = publicProcedure.input(z.object({
  organization_id: z.string()
})).query(async (opts)=>{
  const applications = await prisma.leaveApplication.findMany({
    where: {
      deleted_at: null,
      organization_id: opts.input.organization_id,
      status: "rejected"
    },
    include: {
      leave_setting: true,
      user: true
    },
    orderBy: {
      created_at: "desc"
    }
  });
  return applications.map(application => ({
    leave_setting: application.leave_setting,
    user: application.user,
    leave_application: {
      id: application.id,
      user_id: application.user_id,
      leave_setting_id: application.leave_setting_id,
      organization_id: application.organization_id,
      start_date: application.start_date,
      end_date: application.end_date,
      reason: application.reason,
      status: application.status,
      created_at: application.created_at,
      updated_at: application.updated_at,
      deleted_at: application.deleted_at
    }
  })) as LeaveApplicationWithLeaveSetting[];
}); 

export const changeLeaveApplicationStatus = publicProcedure.input(changeLeaveApplicationStatusSchema).mutation(async (opts)=>{
  const leaveApplication = await prisma.leaveApplication.update({
    where: {
      id: opts.input.id
    },
    data: opts.input
  });

 

  await sendNotification({
    is_sender: false,
    title: "Leave Application",
    message: `Your leave application has been ${opts.input.status}`,
    notificationType: "Leave",
    recipientIds: [{ id: leaveApplication.user_id, isAdmin: false, is_sender: false, sender_id: opts.input.sender_id as unknown as string }]
  });
  
});

export const getLeaveApplicationById = publicProcedure.input(z.object({
  id: z.string()
})).query(async (opts)=>{
  const application = await prisma.leaveApplication.findUnique({
    where: { id: opts.input.id },
    include: {
      leave_setting: true,
      user: true
    }
  });

  if (!application) {
    return null;
  }

  return {
    leave_setting: application.leave_setting,
    user: application.user,
    leave_application: {
      id: application.id,
      user_id: application.user_id,
      leave_setting_id: application.leave_setting_id,
      organization_id: application.organization_id,
      start_date: application.start_date,
      end_date: application.end_date,
      reason: application.reason,
      status: application.status,
      created_at: application.created_at,
      updated_at: application.updated_at,
      deleted_at: application.deleted_at
    }
  } as LeaveApplicationWithLeaveSetting;
});

export const getLeaveSettingByOrganizationId = publicProcedure.input(z.object({
  organization_id: z.string()
})).query(async (opts)=>{
  return await prisma.leaveSetting.findMany({
    where: {
      organization_id: opts.input.organization_id
    },
    orderBy: {
      created_at: "desc"
    }
  });
});