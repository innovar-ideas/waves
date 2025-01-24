import { prisma } from "@/lib/prisma";
import { createTaskSchema, findByIdSchema } from "../dtos";
import { publicProcedure } from "../trpc";
import { TaskDailyTimeTable, TaskWeeklyTimeTable, TaskTimeTable, TaskYearlyTimeTable, TaskMonthlyTimeTable, TaskTable, TaskInstructions, TaskForm } from "../types";
import { StaffTask, User } from "@prisma/client";
import { sendNotification } from "@/lib/utils";

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
  const taskSchedule = is_repeated 
    ? `This is a recurring task with schedule defined in ${taskTimeTable?.type} intervals.`
    : `This task runs from ${start_date?.toLocaleDateString()} to ${end_date?.toLocaleDateString()}.`;

  const notificationMessage = `You have been assigned a new task: "${title}".

Task Details:
- Description: ${description}
- ${taskSchedule}
- Status: Pending
- Task ID: ${task.id}

Please visit the task management portal at /task/${task.id} to view complete details and submit your work.

Note: This task was assigned by ${created_by_id}. Please ensure timely completion.`;

  for (const staffTask of staff_tasks) {
    await sendNotification({
      is_sender: false,
      title: "Leave Application Status Update",
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
        created_by_user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            roles: true,
            phone_number: true,
            active: true,
            password: true,
            created_at: true,
            updated_at: true,
            deleted_at: true,
            organization_id: true,
            fcmToken: true
          }
        }
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