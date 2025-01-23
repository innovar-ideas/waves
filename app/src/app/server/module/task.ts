import { prisma } from "@/lib/prisma";
import { createTaskSchema, findByIdSchema } from "../dtos";
import { publicProcedure } from "../trpc";
import { TaskDailyTimeTable, TaskWeeklyTimeTable, TaskTimeTable, TaskYearlyTimeTable, TaskMonthlyTimeTable, TaskTable, TaskInstructions, TaskForm } from "../types";
import { StaffTask, User } from "@prisma/client";

export const createTask = publicProcedure.input(createTaskSchema).mutation(async ({ input}) => {
  console.log(input," 1 <=================================");
    const {organization_slug, created_by_id, title, description, is_repeated, start_date, end_date, instructions, task_repeat_time_table, staff_tasks} = input;
    console.log(input," 2 <=================================");
    let taskTimeTable: TaskTimeTable | null = null;
    let dailyTimeTable: TaskDailyTimeTable | null = null;
    let weeklyTimeTable: TaskWeeklyTimeTable | null = null;
    let monthlyTimeTable: TaskMonthlyTimeTable | null = null;
    let yearlyTimeTable: TaskYearlyTimeTable | null = null;
    console.log(input," 3 <=================================");
    if(task_repeat_time_table && is_repeated) {
        console.log(input," 4 <=================================");
        if(task_repeat_time_table.type === "daily") {
          console.log(input," 5 <=================================");
            dailyTimeTable = task_repeat_time_table.TaskDailyTimeTable || null;
        }
        if(task_repeat_time_table.type === "weekly") {
          console.log(input," 6 <=================================");
            weeklyTimeTable = task_repeat_time_table.TaskWeeklyTimeTable || null;
        }
        if(task_repeat_time_table.type === "monthly") {
          console.log(input," 7 <=================================");
            monthlyTimeTable = task_repeat_time_table.TaskMonthlyTimeTable || null;
        }
        if(task_repeat_time_table.type === "yearly") {
          console.log(input," 8 <=================================");
            yearlyTimeTable = task_repeat_time_table.TaskYearlyTimeTable || null;
        }
        taskTimeTable = {
            type: task_repeat_time_table.type,
            daily: dailyTimeTable || undefined,
            weekly: weeklyTimeTable || undefined,
            monthly: monthlyTimeTable || undefined,
            yearly: yearlyTimeTable || undefined,
        };
        console.log(input," 9 <=================================");
    }

    let instructions_info: TaskInstructions | null = null;
    console.log(input," 10 <=================================");
    if(instructions) {
      console.log(input," 11 <=================================");
      if(instructions.instruction_type === "text") {
        console.log(input," 12 <=================================");
        instructions_info = {
          instruction_type: "text",
          instruction_content: instructions.instruction_content,
        };
        console.log(input," 13 <=================================");
      }
      if(instructions.instruction_type === "form") {
        console.log(input," 14 <=================================");
        const form: TaskForm = {
          form_type: instructions.form?.form_type || "text",
          form_content: instructions.form?.form_content,
          form_options: instructions.form?.form_options,
          form_value: instructions.form?.form_value,
          form_description: instructions.form?.form_description,
        };
        console.log(input," 15 <=================================");
        instructions_info = {
          instruction_type: "form",
          form: form,
        };
        console.log(input," 16 <=================================");
      }
    }



   

    const task = await prisma.task.create({
        data: {
            title,
            description,
            organization_id: organization_slug,
            created_by_id: created_by_id,
            is_repeated,
            start_date,
            end_date,
            instructions: instructions_info as unknown as TaskInstructions,
            task_repeat_time_table: taskTimeTable as unknown as TaskTimeTable,
            created_at: new Date(),
        }
    });
    console.log(task," 17 <=================================");
let staffTasks;
    if(staff_tasks) {
        console.log(input," 18 <=================================");
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
    console.log(staffTasks," 19 <=================================");
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

    const task = await prisma.task.findUnique({where: {id}});

    return task;
});
