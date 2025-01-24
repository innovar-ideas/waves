"use client";
import { trpc } from "@/app/_providers/trpc-provider";
import { useParams } from "next/navigation";

const TaskPage = () => {
  const params = useParams();
  
  const { data: task, isLoading } = trpc.getTaskById.useQuery({id: params.id as string });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-800"></div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-12 bg-white rounded-xl shadow-lg max-w-xl w-full">
          <h2 className="text-2xl font-bold text-emerald-800">Task Not Found</h2>
          <p className="mt-4 text-gray-600 text-lg">The requested task could not be found. Please verify the task ID and try again.</p>
        </div>
      </div>
    );
  }

  const formatDateTime = (date: Date | undefined): string => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric", 
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Calculate task statistics
  const totalStaff = task.staff_tasks?.length || 0;
  const completedTasks = task.staff_tasks?.filter(st => st.is_completed).length || 0;
  const completionRate = totalStaff > 0 ? Math.round((completedTasks / totalStaff) * 100) : 0;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[90rem] mx-auto p-8">
        <div className="bg-white shadow-xl rounded-3xl overflow-hidden border">
          {/* Header Section */}
          <div className="bg-emerald-800 p-12">
            <h1 className="text-5xl font-bold text-white tracking-tight mb-4">{task.title}</h1>
            <p className="text-emerald-50 text-xl leading-relaxed max-w-4xl mb-8">{task.description}</p>
            
            {/* Task Statistics */}
            <div className="grid grid-cols-3 gap-6 mt-8">
              <div className="bg-white/10 rounded-xl p-6">
                <div className="text-4xl font-bold text-white mb-2">{totalStaff}</div>
                <div className="text-emerald-100">Total Staff Assigned</div>
              </div>
              <div className="bg-white/10 rounded-xl p-6">
                <div className="text-4xl font-bold text-white mb-2">{completedTasks}</div>
                <div className="text-emerald-100">Tasks Completed</div>
              </div>
              <div className="bg-white/10 rounded-xl p-6">
                <div className="text-4xl font-bold text-white mb-2">{completionRate}%</div>
                <div className="text-emerald-100">Completion Rate</div>
              </div>
            </div>
          </div>

          <div className="p-12 grid grid-cols-1 xl:grid-cols-2 gap-16">
            {/* Left Column - Task Details */}
            <div className="space-y-10">
              <h2 className="text-3xl font-bold text-emerald-800 border-b-2 border-emerald-100 pb-4">Task Details</h2>
              
              <div className="grid gap-8">
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-emerald-100">
                  <h3 className="text-lg font-bold text-emerald-800 mb-4">Task Creator</h3>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-xl font-semibold text-emerald-800">
                      {task.created_by_user?.first_name?.[0]}{task.created_by_user?.last_name?.[0]}
                    </div>
                    <div>
                      <p className="text-xl text-emerald-700">
                        {task.created_by_user ? 
                          `${task.created_by_user.first_name} ${task.created_by_user.last_name}` :
                          "Unknown Creator"}
                      </p>
                      <p className="text-emerald-600">{task.created_by_user?.email}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-lg border border-emerald-100">
                  <h3 className="text-lg font-bold text-emerald-800 mb-6">Task Schedule</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-lg">
                      <span className="text-2xl">{task.is_repeated ? "🔄" : "📅"}</span>
                      <span className="font-medium text-emerald-700">{task.is_repeated ? "Recurring Task" : "One-time Task"}</span>
                    </div>
                    
                    {task.task_repeat_time_table && (
                      <div className="mt-6 space-y-4 pl-4 border-l-4 border-emerald-200">
                        <div className="text-lg font-medium text-emerald-700">
                          {task.task_repeat_time_table.type && 
                            `${task.task_repeat_time_table.type.charAt(0).toUpperCase()}${task.task_repeat_time_table.type.slice(1)} Schedule`}
                        </div>
                        
                        {task.task_repeat_time_table?.type === "daily" && task.task_repeat_time_table.daily && (
                          <div className="text-emerald-600">
                            Daily from {task.task_repeat_time_table.daily.start_time?.toLocaleTimeString()} to {task.task_repeat_time_table.daily.end_time?.toLocaleTimeString()}
                          </div>
                        )}
                        {task.task_repeat_time_table?.type === "weekly" && task.task_repeat_time_table.weekly && (
                          <div className="text-emerald-600">
                            Weekly on: {task.task_repeat_time_table.weekly.start_day} - {task.task_repeat_time_table.weekly.end_day}
                          </div>
                        )}
                        {task.task_repeat_time_table?.type === "monthly" && task.task_repeat_time_table.monthly && (
                          <div className="text-emerald-600">
                            Monthly from {formatDateTime(task.task_repeat_time_table.monthly?.start_date)} to {formatDateTime(task.task_repeat_time_table.monthly?.end_date)}
                          </div>
                        )}
                        {task.task_repeat_time_table?.type === "yearly" && task.task_repeat_time_table.yearly && (
                          <div className="text-emerald-600">
                            Yearly from {formatDateTime(task.task_repeat_time_table.yearly?.start_date)} to {formatDateTime(task.task_repeat_time_table.yearly?.end_date)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Assigned Staff & Instructions */}
            <div className="space-y-10">
              {/* Assigned Staff Section */}
              <div>
                <h2 className="text-3xl font-bold text-emerald-800 border-b-2 border-emerald-100 pb-4 mb-8">Assigned Staff</h2>
                <div className="grid gap-6">
                  {task?.staff_tasks?.map((staffTask) => (
                    <div key={staffTask.id} className="bg-white p-6 rounded-2xl shadow-lg border border-emerald-100 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-xl font-semibold text-emerald-800">
                          {staffTask.user.first_name[0]}{staffTask.user.last_name[0]}
                        </div>
                        <div>
                          <p className="text-xl font-medium text-emerald-800">
                            {staffTask.user.first_name} {staffTask.user.last_name}
                          </p>
                          <p className="text-emerald-600 mt-1">Status: {staffTask.status}</p>
                          {staffTask.staff_feedback && (
                            <p className="text-emerald-600 mt-1">Feedback: {staffTask?.staff_feedback as string}</p>
                          )}
                        </div>
                      </div>
                      <span className={`px-6 py-3 rounded-xl text-base font-medium ${
                        staffTask.is_completed 
                          ? "bg-emerald-50 text-emerald-700" 
                          : "bg-yellow-50 text-yellow-700"
                      }`}>
                        {staffTask.is_completed ? "Completed" : "Pending"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions Section */}
              <div>
                <h2 className="text-3xl font-bold text-emerald-800 border-b-2 border-emerald-100 pb-4 mb-8">Instructions</h2>
                {task?.instructions ? (
                  task.instructions.instruction_type === "text" ? (
                    <div className="bg-white p-8 rounded-2xl shadow-lg border border-emerald-100">
                      <h3 className="text-xl font-bold text-emerald-800 mb-6">Text Instructions</h3>
                      <p className="whitespace-pre-wrap text-emerald-700 text-lg leading-relaxed">
                        {task.instructions.instruction_content || "No content provided"}
                      </p>
                    </div>
                  ) : task.instructions.instruction_type === "form" && task.instructions.form ? (
                    <div className="space-y-8">
                      {task.instructions.form.map((form, index) => (
                        <div key={index} className="bg-white p-8 rounded-2xl shadow-lg border border-emerald-100">
                          <div className="flex items-center gap-6 mb-6">
                            <span className="w-10 h-10 flex items-center justify-center bg-emerald-800 text-white rounded-full text-lg font-medium">
                              {index + 1}
                            </span>
                            <h3 className="text-xl font-bold text-emerald-800">{form.form_content}</h3>
                          </div>
                          <div className="ml-16 space-y-6">
                            <div>
                              <p className="text-base font-semibold text-emerald-700 mb-2">Input Type</p>
                              <p className="text-lg text-emerald-600 capitalize">{form.form_type}</p>
                            </div>
                            <div>
                              <p className="text-base font-semibold text-emerald-700 mb-2">Description</p>
                              <p className="text-lg text-emerald-600">{form.form_description}</p>
                            </div>
                            {(form.form_type === "dropdown" || form.form_type === "radio" || form.form_type === "checkbox" || form.form_type === "true_false") && (
                              <div>
                                <p className="text-base font-semibold text-emerald-700 mb-3">Available Options</p>
                                <div className="flex flex-wrap gap-3">
                                  {form.form_options?.map((option, optIndex) => (
                                    <span key={optIndex} className="px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100 text-base text-emerald-700">
                                      {option}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white p-8 rounded-2xl shadow-lg border border-emerald-100">
                      <p className="text-emerald-600 text-lg">No instruction format specified</p>
                    </div>
                  )
                ) : (
                  <div className="bg-white p-8 rounded-2xl shadow-lg border border-emerald-100">
                    <p className="text-emerald-600 text-lg">No instructions provided for this task</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskPage;
