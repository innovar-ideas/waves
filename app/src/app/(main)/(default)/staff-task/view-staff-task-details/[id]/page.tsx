"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { CheckCircle2, Clock, User, FileText, RotateCw, MessageSquare, ArrowLeft, AlertCircle } from "lucide-react";
import { StaffTaskColumnTable, TaskForm } from "@/app/server/types";
import { trpc } from "@/app/_providers/trpc-provider";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function StaffTaskDetailsPage({ params }: { params: { id: string } }) {
  const [staffTask, setStaffTask] = useState<StaffTaskColumnTable | null>(null);
  const router = useRouter();

  const {data: task, isLoading, error} = trpc.getStaffTaskById.useQuery({
    id: params.id
  });

  useEffect(() => {
    if (task) {
      setStaffTask(task);
    }
  }, [task]);

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="bg-white shadow-lg border-0">
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center text-red-600 gap-2">
              <AlertCircle className="h-8 w-8" />
              <p className="text-center">Error loading task details. Please try again later.</p>
              <Button
                variant="outline"
                onClick={() => router.push("/staff-task")}
                className="mt-4 flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Tasks
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="bg-white shadow-lg border-0">
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
              <p className="text-gray-600">Loading task details...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!staffTask) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="bg-white shadow-lg border-0">
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center gap-2">
              <AlertCircle className="h-8 w-8 text-yellow-600" />
              <p className="text-center text-gray-600">Task not found</p>
              <Button
                variant="outline"
                onClick={() => router.push("/staff-task")}
                className="mt-4 flex items-center gap-2 text-green-800 border-green-300 hover:bg-green-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Tasks
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-4 flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => router.push("/staff-task")}
          className="flex items-center gap-2 text-green-800 border-green-300 hover:bg-green-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Tasks
        </Button>

        { staffTask.status === "pending" && (
         <a
                    href={`/staff-task/${staffTask?.task?.id}`}
                    className="inline-block mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                  >
                    Fill Form Task
                  </a>
        )}
      </div>

      <Card className="bg-white shadow-lg border-0">
        <CardHeader className="bg-green-100 border-b border-green-200">
          <CardTitle className="text-2xl text-gray-900">Task Details</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          
         
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-green-800 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Task Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
              <div>
                <p className="text-sm text-gray-500">Title</p>
                <p className="text-base font-medium text-gray-900">{staffTask.task?.title}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p className="text-base text-gray-900">{staffTask.task?.description}</p>
              </div>
            </div>
          </div>

          <Separator className="bg-green-200" />

        
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-green-800 flex items-center gap-2">
              {staffTask.is_completed ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <Clock className="h-5 w-5" />
              )}
              Status Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium
                  ${staffTask.is_completed 
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                  }`}>
                  {staffTask.status}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Created At</p>
                <p className="text-base text-gray-900">
                  {staffTask.created_at ? format(new Date(staffTask.created_at), "PPP") : "N/A"}
                </p>
              </div>
            </div>
          </div>

          <Separator className="bg-green-200" />

         
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-green-800 flex items-center gap-2">
              <User className="h-5 w-5" />
              Assignment Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
              <div>
                <p className="text-sm text-gray-500">Assigned To</p>
                <p className="text-base font-medium text-gray-900">
                  {staffTask.user?.first_name} {staffTask.user?.last_name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Created By</p>
                <p className="text-base font-medium text-gray-900">
                  {staffTask.created_by_user?.first_name} {staffTask.created_by_user?.last_name}
                </p>
              </div>
            </div>
          </div>
          {staffTask.task_repeat_time_table && (
            <>
              <Separator className="bg-green-200" />
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-green-800 flex items-center gap-2">
                  <RotateCw className="h-5 w-5" />
                  Repeat Schedule
                </h3>

                <div className="pl-7 space-y-6">
                  {/* Schedule Type */}
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="text-sm font-medium text-gray-600">Schedule Type</p>
                    <p className="text-lg text-green-800 capitalize mt-1">
                      {staffTask.task_repeat_time_table.type}
                    </p>
                  </div>

                  {/* Daily Schedule */}
                  {staffTask.task_repeat_time_table.type === "daily" && (
                    <div className="bg-white p-6 rounded-lg border border-green-200 shadow-sm">
                      <h4 className="text-lg font-medium text-green-700 mb-4">Daily Time Window</h4>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="bg-green-50 p-4 rounded-lg">
                          <p className="text-sm font-medium text-gray-600">Start Time</p>
                          <p className="text-lg text-green-800 mt-1">
                            {staffTask.task_repeat_time_table.daily?.start_time ? 
                              format(new Date(staffTask.task_repeat_time_table.daily.start_time), "hh:mm a") : 
                              "Not set"}
                          </p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <p className="text-sm font-medium text-gray-600">End Time</p>
                          <p className="text-lg text-green-800 mt-1">
                            {staffTask.task_repeat_time_table.daily?.end_time ? 
                              format(new Date(staffTask.task_repeat_time_table.daily.end_time), "hh:mm a") : 
                              "Not set"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Weekly Schedule */}
                  {staffTask.task_repeat_time_table.type === "weekly" && (
                    <div className="bg-white p-6 rounded-lg border border-green-200 shadow-sm">
                      <h4 className="text-lg font-medium text-green-700 mb-4">Weekly Schedule</h4>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="bg-green-50 p-4 rounded-lg">
                          <p className="text-sm font-medium text-gray-600">Start Day</p>
                          <p className="text-lg text-green-800 capitalize mt-1">
                            {staffTask.task_repeat_time_table.weekly?.start_day}
                          </p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <p className="text-sm font-medium text-gray-600">End Day</p>
                          <p className="text-lg text-green-800 capitalize mt-1">
                            {staffTask.task_repeat_time_table.weekly?.end_day}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Monthly Schedule */}
                  {staffTask.task_repeat_time_table.type === "monthly" && (
                    <div className="bg-white p-6 rounded-lg border border-green-200 shadow-sm">
                      <h4 className="text-lg font-medium text-green-700 mb-4">Monthly Schedule</h4>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="bg-green-50 p-4 rounded-lg">
                          <p className="text-sm font-medium text-gray-600">Start Date</p>
                          <p className="text-lg text-green-800 mt-1">
                            {staffTask.task_repeat_time_table.monthly?.start_date ? 
                              format(new Date(staffTask.task_repeat_time_table.monthly.start_date), "do") : 
                              "Not set"}
                          </p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <p className="text-sm font-medium text-gray-600">End Date</p>
                          <p className="text-lg text-green-800 mt-1">
                            {staffTask.task_repeat_time_table.monthly?.end_date ? 
                              format(new Date(staffTask.task_repeat_time_table.monthly.end_date), "do") : 
                              "Not set"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Yearly Schedule */}
                  {staffTask.task_repeat_time_table.type === "yearly" && (
                    <div className="bg-white p-6 rounded-lg border border-green-200 shadow-sm">
                      <h4 className="text-lg font-medium text-green-700 mb-4">Yearly Schedule</h4>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="bg-green-50 p-4 rounded-lg">
                          <p className="text-sm font-medium text-gray-600">Start Date</p>
                          <p className="text-lg text-green-800 mt-1">
                            {staffTask.task_repeat_time_table.yearly?.start_date ? 
                              format(new Date(staffTask.task_repeat_time_table.yearly.start_date), "MMMM do") : 
                              "Not set"}
                          </p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <p className="text-sm font-medium text-gray-600">End Date</p>
                          <p className="text-lg text-green-800 mt-1">
                            {staffTask.task_repeat_time_table.yearly?.end_date ? 
                              format(new Date(staffTask.task_repeat_time_table.yearly.end_date), "MMMM do") : 
                              "Not set"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {staffTask.instructions?.instruction_type && (
            <>
              <Separator className="bg-green-200" />
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-green-800 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Response
                </h3>
                <div className="pl-7">
                  <p className="text-sm text-gray-500">Response Type</p>
                  <p className="text-base text-gray-900 capitalize">{staffTask.instructions?.instruction_type}</p>
                  {staffTask.instructions?.instruction_type === "form" && (
                    <div className="mt-4 space-y-6">
                      {staffTask?.instructions?.form?.map((field: TaskForm, index: number) => (
                        <div key={index} className="bg-green-100 p-6 rounded-lg border border-green-200 shadow-sm">
                          <div className="space-y-2">
                            <h4 className="font-semibold text-green-800 text-lg">{field.form_content}</h4>
                            {field.form_description && (
                              <p className="text-sm text-gray-600 italic">{field.form_description}</p>
                            )}
                          </div>

                          <div className="mt-4 bg-white p-4 rounded-md border border-green-200">
                            {field.form_type === "dropdown" && (
                              <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-700">Selected Option:</p>
                                <p className="text-base text-gray-900">{field.form_value}</p>
                                <div className="mt-2 pt-2 border-t border-gray-100">
                                  <p className="text-xs text-gray-500">Available Options: {field.form_options ? field.form_options.join(" • ") : "N/A"}</p>
                                </div>
                              </div>
                            )}

                            {field.form_type === "checkbox" && (
                              <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-700">Response:</p>
                                <p className="text-base text-gray-900">{field.form_value ?? "No response"}</p>
                              </div>
                            )}

                            {field.form_type === "true_false" && (
                              <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-700">Answer:</p>
                                <p className="text-base text-gray-900">
                                  {field.form_value === "true" ? 
                                    <span className="text-green-600">True</span> : 
                                    <span className="text-red-600">False</span>
                                  }
                                </p>
                              </div>
                            )}

                            {field.form_type === "radio" && (
                              <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-700">Selected Option:</p>
                                <p className="text-base text-gray-900">{field.form_value}</p>
                                <div className="mt-2 pt-2 border-t border-gray-100">
                                  <p className="text-xs text-gray-500">Available Options: {field.form_options ? field.form_options.join(" • ") : "N/A"}</p>
                                </div>
                              </div>
                            )}

                            {field.form_type === "text" && (
                              <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-700">Text Response:</p>
                                <p className="text-base text-gray-900 whitespace-pre-wrap">{field.form_value || "No response provided"}</p>
                              </div>
                            )}

                            {field.form_type === "number" && (
                              <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-700">Numeric Value:</p>
                                <p className="text-base text-gray-900">{field.form_value || "No value provided"}</p>
                              </div>
                            )}

                            {field.form_type === "date" && (
                              <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-700">Date:</p>
                                <p className="text-base text-gray-900">
                                  {field.form_value ? 
                                    new Date(field.form_value).toLocaleDateString("en-US", {
                                      weekday: "long",
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    }) : 
                                    "No date provided"
                                  }
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {staffTask.instructions?.instruction_type === "text" && staffTask.instructions?.instruction_content && (
                    <div className="mt-4 bg-green-100 p-4 rounded-lg">
                      <p className="text-gray-800">{staffTask.instructions?.instruction_content}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
