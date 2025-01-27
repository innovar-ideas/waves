"use client";
import { trpc } from "@/app/_providers/trpc-provider";
import { useParams } from "next/navigation";

const TaskPage = () => {
  const params = useParams();
  
  const { data: task, isLoading, error } = trpc.getTaskById.useQuery({id: params?.id as string ?? ""});

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-12 bg-white rounded-xl shadow-lg max-w-xl w-full">
          <h2 className="text-2xl font-bold text-red-600">Error Loading Task</h2>
          <p className="mt-4 text-gray-600 text-lg">There was an error loading the task details. Please try again later.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-600"></div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-12 bg-white rounded-xl shadow-lg max-w-xl w-full">
          <h2 className="text-2xl font-bold text-emerald-600">Task Not Found</h2>
          <p className="mt-4 text-gray-600 text-lg">The requested task could not be found. Please verify the task ID and try again.</p>
        </div>
      </div>
    );
  }

  const formatDateTime = (date: Date | string | undefined): string => {
    if (!date) return "Not specified";
    try {
      return new Date(date).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric", 
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (error) {
      console.error(error);
      return "Invalid date";
    }
  };

  const totalStaff = task?.staff_tasks?.length ?? 0;
  const completedTasks = task?.staff_tasks?.filter(st => st?.is_completed)?.length ?? 0;
  const completionRate = totalStaff > 0 ? Math.round((completedTasks / totalStaff) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[90rem] mx-auto p-6 space-y-8">
     
        <div className="bg-white shadow-lg rounded-2xl overflow-hidden border">
          <div className="bg-emerald-600 p-8">
            <div className="flex justify-between items-start flex-wrap gap-8">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white tracking-tight mb-3">{task?.title || "Untitled Task"}</h1>
                <p className="text-emerald-50 text-base leading-relaxed max-w-2xl">{task?.description || "No description provided"}</p>
              </div>
              
              <div className="flex gap-4">
                <div className="bg-white/10 rounded-lg px-6 py-4 text-center min-w-[120px]">
                  <div className="text-3xl font-bold text-white mb-1">{totalStaff}</div>
                  <div className="text-emerald-100 text-sm font-medium">Assigned</div>
                </div>
                <div className="bg-white/10 rounded-lg px-6 py-4 text-center min-w-[120px]">
                  <div className="text-3xl font-bold text-white mb-1">{completedTasks}</div>
                  <div className="text-emerald-100 text-sm font-medium">Completed</div>
                </div>
                <div className="bg-white/10 rounded-lg px-6 py-4 text-center min-w-[120px]">
                  <div className="text-3xl font-bold text-white mb-1">{completionRate}%</div>
                  <div className="text-emerald-100 text-sm font-medium">Complete</div>
                </div>
              </div>
            </div>
          </div>

         
          <div className="grid md:grid-cols-2 gap-8 p-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Task Creator</h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-xl font-semibold text-emerald-600">
                  {(task?.created_by_user?.first_name?.[0] || "?")}{(task?.created_by_user?.last_name?.[0] || "?")}
                </div>
                <div>
                  <p className="text-xl text-gray-800 font-medium">
                    {task?.created_by_user ? 
                      `${task.created_by_user.first_name || ""} ${task.created_by_user.last_name || ""}`.trim() || "Unknown Name" :                   "Unknown Creator"}
                  </p>
                  <p className="text-gray-500">{task?.created_by_user?.email || "No email provided"}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Task Schedule</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{task?.is_repeated ? "🔄" : "📅"}</span>
                  <span className="font-medium text-gray-700">{task?.is_repeated ? "Recurring Task" : "One-time Task"}</span>
                </div>
                
                {task?.task_repeat_time_table ? (
                  <div className="mt-4 space-y-3 pl-4 border-l-4 border-emerald-200">
                    <div className="font-medium text-gray-700">
                      {task.task_repeat_time_table.type ? 
                        `${task.task_repeat_time_table.type.charAt(0).toUpperCase()}${task.task_repeat_time_table.type.slice(1)} Schedule` :
                        "Schedule Type Not Specified"}
                    </div>
                    
                    {task.task_repeat_time_table?.type === "daily" && task.task_repeat_time_table.daily && (
                      <div className="text-gray-600">
                        Daily from {task.task_repeat_time_table.daily.start_time?.toLocaleTimeString() || "Not set"} to {task.task_repeat_time_table.daily.end_time?.toLocaleTimeString() || "Not set"}
                      </div>
                    )}
                    {task.task_repeat_time_table?.type === "weekly" && task.task_repeat_time_table.weekly && (
                      <div className="text-gray-600">
                        Weekly on: {task.task_repeat_time_table.weekly.start_day || "Not set"} - {task.task_repeat_time_table.weekly.end_day || "Not set"}
                      </div>
                    )}
                    {task.task_repeat_time_table?.type === "monthly" && task.task_repeat_time_table.monthly && (
                      <div className="text-gray-600">
                        Monthly from {formatDateTime(task.task_repeat_time_table.monthly?.start_date)} to {formatDateTime(task.task_repeat_time_table.monthly?.end_date)}
                      </div>
                    )}
                    {task.task_repeat_time_table?.type === "yearly" && task.task_repeat_time_table.yearly && (
                      <div className="text-gray-600">
                        Yearly from {formatDateTime(task.task_repeat_time_table.yearly?.start_date)} to {formatDateTime(task.task_repeat_time_table.yearly?.end_date)}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-500">No schedule information available</div>
                )}
              </div>
            </div>
          </div>
        </div>

       
        <div className="bg-white shadow-lg rounded-2xl overflow-hidden border">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800">Staff Assignments</h2>
          </div>
          <div className="overflow-x-auto">
            {task?.staff_tasks && task.staff_tasks.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Staff Member</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Feedback</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Completion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {task.staff_tasks.map((staffTask) => (
                    <tr key={staffTask?.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-sm font-semibold text-emerald-600">
                          {staffTask?.user?.first_name?.[0] || "?"}{staffTask?.user?.last_name?.[0] || "?"}
                          </div>
                          <span className="font-medium text-gray-900">
                            {staffTask?.user ? 
                              `${staffTask.user.first_name || ""} ${staffTask.user.last_name || ""}`.trim() || "Unknown Name" :
                              "Unknown User"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{staffTask?.user?.email || "No email"}</td>
                      <td className="px-6 py-4 text-gray-500">{staffTask?.status || "Not set"}</td>
                      <td className="px-6 py-4 text-gray-500">
                        {typeof staffTask?.staff_feedback === "string" ? staffTask.staff_feedback : "-"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          staffTask?.is_completed 
                            ? "bg-green-100 text-green-800" 
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {staffTask?.is_completed ? "Completed" : "Pending"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-6 text-center text-gray-500">
                No staff assignments found
              </div>
            )}
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-2xl overflow-hidden border">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800">Task Instructions</h2>
          </div>
          <div className="p-6">
            {task?.instructions ? (
              task.instructions.instruction_type === "text" ? (
                <div className="prose max-w-none">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Text Instructions</h3>
                  <p className="whitespace-pre-wrap text-gray-600 text-lg leading-relaxed">
                    {task.instructions.instruction_content || "No content provided"}
                  </p>
                </div>
              ) : task.instructions.instruction_type === "form" && Array.isArray(task.instructions.form) ? (
                <div className="space-y-8">
               
                  <div className="overflow-x-auto">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Form Fields</h3>
                    {task.instructions.form.some(form => !["dropdown", "radio", "checkbox", "true_false"].includes(form.form_type as string)) ? (
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Step</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Content</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Type</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Description</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {task.instructions.form
                            .filter(form => !["dropdown", "radio", "checkbox", "true_false"].includes(form.form_type as string))
                            .map((form, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                  <span className="w-8 h-8 flex items-center justify-center bg-emerald-100 text-emerald-600 rounded-full text-sm font-medium">
                                    {index + 1}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <p className="text-gray-900 font-medium">{form?.form_content || "No content"}</p>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 capitalize">
                                    {form?.form_type || "Unknown type"}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-gray-500">{form?.form_description || "No description"}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="text-gray-500 text-center py-4">No regular form fields found</div>
                    )}
                  </div>

                  <div className="overflow-x-auto">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Multiple Choice Fields</h3>
                    {task.instructions.form.some(form => ["dropdown", "radio", "checkbox", "true_false"].includes(form.form_type as string)) ? (
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Step</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Content</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Type</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Description</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Options</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {task.instructions.form
                            .filter(form => ["dropdown", "radio", "checkbox", "true_false"].includes(form.form_type as string))
                            .map((form, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                  <span className="w-8 h-8 flex items-center justify-center bg-emerald-100 text-emerald-600 rounded-full text-sm font-medium">
                                    {index + 1}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <p className="text-gray-900 font-medium">{form?.form_content || "No content"}</p>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 capitalize">
                                    {form?.form_type || "Unknown type"}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-gray-500">{form?.form_description || "No description"}</td>
                                <td className="px-6 py-4">
                                  <div className="flex flex-wrap gap-2">
                                    {Array.isArray(form?.form_options) && form.form_options.length > 0 ? (
                                      form.form_options.map((option, optIndex) => (
                                        <span key={optIndex} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                          {String(option)}
                                        </span>
                                      ))
                                    ) : (
                                      <span className="text-gray-500">No options available</span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="text-gray-500 text-center py-4">No multiple choice fields found</div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-lg">No instruction format specified</div>
              )
            ) : (
              <div className="text-gray-500 text-lg">No instructions provided for this task</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskPage;
