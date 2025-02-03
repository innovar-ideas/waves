import { prisma } from "@/lib/prisma";
import { createTaskSchema, findByIdSchema, staffTaskResponseSchema} from "../dtos";
import { publicProcedure } from "../trpc";
import { TaskDailyTimeTable, TaskWeeklyTimeTable, TaskTimeTable, TaskYearlyTimeTable, TaskMonthlyTimeTable, TaskTable, TaskInstructions, TaskForm, StaffTaskRepeatTimeTable, StaffTaskColumnTable } from "../types";
import { StaffTask, User } from "@prisma/client";
import { sendNotification } from "@/lib/utils";
import { z } from "zod";

export const createTask = publicProcedure.input(createTaskSchema).mutation(async ({ input}) => {
    const {organization_slug, created_by_id, title, description, is_repeated, start_date, end_date, instructions, task_repeat_time_table, staff_tasks} = input;
    let taskTimeTable: TaskTimeTable | null = null;
    let dailyTimeTable: TaskDailyTimeTable | null = null;
    let weeklyTimeTable: TaskWeeklyTimeTable | null = null;
    let monthlyTimeTable: TaskMonthlyTimeTable | null = null;
    let yearlyTimeTable: TaskYearlyTimeTable | null = null;
    if(task_repeat_time_table && is_repeated) {
        if(task_repeat_time_table.type === "daily") {
            dailyTimeTable = task_repeat_time_table.TaskDailyTimeTable || null;
        }
        if(task_repeat_time_table.type === "weekly") {
            weeklyTimeTable = task_repeat_time_table.TaskWeeklyTimeTable || null;
        }
        if(task_repeat_time_table.type === "monthly") {
         
          monthlyTimeTable = task_repeat_time_table.TaskMonthlyTimeTable || null;
        }
        if(task_repeat_time_table.type === "yearly") {
         
            yearlyTimeTable = task_repeat_time_table.TaskYearlyTimeTable || null;
        }
        taskTimeTable = {
            type: task_repeat_time_table.type || "",
            daily: dailyTimeTable || undefined,
            weekly: weeklyTimeTable || undefined,
            monthly: monthlyTimeTable || undefined,
            yearly: yearlyTimeTable || undefined,
        };
      
    }

    let instructions_info: TaskInstructions | null = null;
    
    if(instructions) {
   
      if(instructions.instruction_type === "text") {
        
        instructions_info = {
          instruction_type: instructions.instruction_type || "",
          instruction_content: instructions.instruction_content,
        };
       
      }
      if(instructions.instruction_type === "form") {
       
        const forms: TaskForm[] = instructions.form || [];
        
        instructions_info = {
          instruction_type: instructions.instruction_type || "",
          form: forms,
        };
        
      }
    }



   

    const task = await prisma.task.create({
        data: {
            title: title || "",
            description: description || "",
            organization_id: organization_slug || "",
            created_by_id: created_by_id || "",
            is_repeated,
            start_date,
            end_date,
            instructions: instructions_info as unknown as TaskInstructions,
            task_repeat_time_table: taskTimeTable as unknown as TaskTimeTable,
            created_at: new Date(),
        }
    });
  
let staffTasks;
    if(staff_tasks) {
       
        staffTasks = await prisma.staffTask.createMany({
            data: staff_tasks.map((staff_task) => ({
            task_id: task.id,
            instructions: instructions_info as unknown as TaskInstructions,
             task_repeat_time_table: taskTimeTable as unknown as TaskTimeTable,
            status: "pending",
            user_id: staff_task,
            is_completed: false,
            created_at: new Date(),
            staff_feedback: "",
        })),
    });
  
}
if (staff_tasks?.length) {
  const creator = await prisma.user.findUnique({
    where: { id: created_by_id },
    select: { first_name: true, last_name: true }
  });

  const taskSchedule = is_repeated 
    ? `This is a recurring task with schedule defined in ${taskTimeTable?.type} intervals.`
    : `This task runs from ${start_date?.toLocaleDateString()} to ${end_date?.toLocaleDateString()}.`;

  const notificationMessage = `You have been assigned a new task: "${title}".

Task Details:
- Description: ${description}
- ${taskSchedule}
- Status: Pending
- Task ID: ${task.id}
Please visit the task management portal at <a href="/staff-task/${task.id}">here</a> to view complete details and submit your work.

Note: This task was assigned by ${creator?.first_name} ${creator?.last_name}. Please ensure timely completion.`;

  for (const staffTask of staff_tasks) {
    await sendNotification({
      is_sender: false,
      title: "Task Assignment",
      message: notificationMessage,
      notificationType: "Task",
      recipientIds: [{
        id: staffTask as unknown as string,
        isAdmin: false,
        is_sender: false,
        sender_id: created_by_id as unknown as string
      }]
    });
  }
}


return {
    task,
    staffTasks,
};


});


export const getAllTasksByOrganization = publicProcedure.input(findByIdSchema).query(async ({input}) => {
    const {id} = input;

    const tasks = await prisma.task.findMany({
      where: { organization_id: id },
      include: {
        staff_tasks: {
          include: {
            user: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
              }
            }
          },
          orderBy: {
            created_at: "desc",
          },
        },
        created_by_user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
          }
        }
      },
      orderBy: {
        created_at: "desc"
      }
    });

    const taskTables: TaskTable[] = tasks.map(task => ({
      id: task.id,
      task: task,
      task_repeat_time_table: task.task_repeat_time_table as unknown as TaskTimeTable | undefined,
      created_by_user: task.created_by_user as unknown as User | undefined,
      staff_tasks: task.staff_tasks as unknown as StaffTask[] | undefined
    }));

    return taskTables;
});

export const getTaskById = publicProcedure.input(findByIdSchema).query(async ({input}) => {
    const {id} = input;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        staff_tasks: {
          include: {
            user: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
                roles: true,
                phone_number: true
              }
            }
          },
          orderBy: {
            created_at: "desc"
          }
        },
        created_by_user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            roles: true,
            phone_number: true
          }
        }
      }
    });

    return {
      ...task,
      task_repeat_time_table: task?.task_repeat_time_table as unknown as TaskTimeTable | undefined,
      instructions: task?.instructions as unknown as TaskInstructions | undefined
    };
});



export const staffGetTaskById = publicProcedure.input(findByIdSchema).query(async ({input}): Promise<TaskTable> => {
    const {id} = input;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        staff_tasks: {
          include: {
            user: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
                roles: true,
                phone_number: true
              }
            }
          },
          orderBy: {
            created_at: "desc"
          }
        },
        created_by_user: true
      }
    });

    if (!task) {
      throw new Error("Task not found");
    }

    const taskTable: TaskTable = {
      id,
      task: task,
      task_repeat_time_table: task.task_repeat_time_table as unknown as TaskTimeTable | undefined,
      created_by_user: task.created_by_user,
      staff_tasks: task.staff_tasks
    };

    return taskTable;
});

export const staffSubmitTask = publicProcedure.input(staffTaskResponseSchema).mutation(async ({input}) => {


  const {task_id, staff_id, status, response_type, instructions_text_response, form_data, staff_task_repeat_time_table} = input;
  
  const task = await prisma.task.findUnique({
    where: { id: task_id },
    include: {
      created_by_user: true,
      staff_tasks: true
    }
  });
  if(!task) {
    throw new Error("Task not found");
  }
   const staffTaskRepeatTimeTable: StaffTaskRepeatTimeTable = {
    type: staff_task_repeat_time_table?.type ?? "",
    daily: staff_task_repeat_time_table?.daily ?? {},
    weekly: staff_task_repeat_time_table?.weekly ?? {},
    monthly: staff_task_repeat_time_table?.monthly ?? {},
    yearly: staff_task_repeat_time_table?.yearly ?? {}
  };
  const instructions: TaskInstructions = {
    instruction_type: response_type ?? "",
    instruction_content: instructions_text_response ?? "",
    form: form_data ?? []
  };
  
  const staffTask = await prisma.staffTask.update({
    where: { id: task.staff_tasks.find(staffTask => staffTask.user_id === staff_id)?.id },
    data: {
      task_id, 
      user_id: staff_id,
       status: status === "completed" ? "completed" : "pending", 
       instructions, 
       staff_feedback: form_data,
       task_repeat_time_table: staffTaskRepeatTimeTable,
       created_at: new Date(),
       is_completed: true,
      }
  });

  return staffTask;
});
export const getStaffTaskById = publicProcedure.input(findByIdSchema).query(async ({input}) => {
  const {id} = input;
  const staffTask = await prisma.staffTask.findUnique({
    where: {id},
    include: {
      task: {
        include: {
          created_by_user: true
        }
      },
      user: true
    }
  });

  if (!staffTask) {
    throw new Error("Staff task not found");
  }

  const staffTaskColumn: StaffTaskColumnTable = {
    task: staffTask.task,
    status: staffTask.status,
    staff_task: staffTask,
    created_by_user: staffTask.task?.created_by_user,
    created_at: staffTask.created_at,
    is_completed: staffTask.is_completed,
    instructions: staffTask.instructions as TaskInstructions,
    task_repeat_time_table: staffTask.task_repeat_time_table as StaffTaskRepeatTimeTable,
    user: staffTask.user
  };

  return staffTaskColumn;
});

export const getStaffTasksByUser = publicProcedure.input(z.object({
  user_id: z.string()
})).query(async ({input}) => {
  const {user_id} = input;
  
  const staffTasks = await prisma.staffTask.findMany({
    where: {
      user_id,
      deleted_at: null
    },
    include: {
      task: {
        include: {
          created_by_user: true
        }
      },
      user: true
    },
    orderBy: {
      created_at: "desc"
    }
  });

  const staffTaskColumns: StaffTaskColumnTable[] = staffTasks.map(staffTask => ({
    task: staffTask.task,
    status: staffTask.status,
    staff_task: staffTask,
    created_by_user: staffTask.task?.created_by_user,
    created_at: staffTask.created_at,
    is_completed: staffTask.is_completed,
    instructions: staffTask.instructions as TaskInstructions,
    task_repeat_time_table: staffTask.task_repeat_time_table as StaffTaskRepeatTimeTable,
    user: staffTask.user
  }));

  return staffTaskColumns;
});

export const getAllTeamsByOrg = publicProcedure.input(findByIdSchema).query(async({input}) => {
  return await prisma.teamDesignation.findMany({
    where: {
      organization_id: input.id
    },
    include: {
      team: {
        select: {
          id: true,
          name: true,
          description: true,
          created_at: true,
          updated_at: true,
          deleted_at: true
        }
      },
      staffs: {
        select: {
          user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
              phone_number: true,
              roles: true
            }
          }
        }
      }
    }
  });
});