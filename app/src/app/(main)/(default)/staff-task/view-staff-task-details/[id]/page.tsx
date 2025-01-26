"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { CheckCircle2, Clock, User, FileText, RotateCw, MessageSquare, ArrowLeft } from "lucide-react";
import { StaffTaskColumnTable, TaskForm } from "@/app/server/types";
import { trpc } from "@/app/_providers/trpc-provider";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function StaffTaskDetailsPage({ params }: { params: { id: string } }) {
  const [staffTask, setStaffTask] = useState<StaffTaskColumnTable | null>(null);
  const router = useRouter();

  const {data: task, isLoading} = trpc.getStaffTaskById.useQuery({
    id: params.id
  });

  useEffect(() => {
    if (task) {
      setStaffTask(task);
    }
  }, [task]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!staffTask) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="bg-white shadow-lg border-0">
          <CardContent className="p-6">
            <p className="text-center text-gray-600">Task not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-4">
        <Button
          variant="outline"
          onClick={() => router.push("/staff-task")}
          className="flex items-center gap-2 text-green-700 border-green-200 hover:bg-green-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Tasks
        </Button>
      </div>

      <Card className="bg-white shadow-lg border-0">
        <CardHeader className="bg-green-50 border-b border-green-100">
          <CardTitle className="text-2xl text-gray-900">Task Details</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          
          {/* Task Information */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-green-700 flex items-center gap-2">
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

          <Separator className="bg-green-100" />

          {/* Status Information */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-green-700 flex items-center gap-2">
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

          <Separator className="bg-green-100" />

          {/* Assignment Information */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-green-700 flex items-center gap-2">
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
                  {staffTask.user?.first_name} {staffTask.user?.last_name}
                </p>
              </div>
            </div>
          </div>

          {staffTask.task_repeat_time_table && (
            <>
              <Separator className="bg-green-100" />
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-green-700 flex items-center gap-2">
                  <RotateCw className="h-5 w-5" />
                  Repeat Schedule
                </h3>
                <div className="pl-7">
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="text-base text-gray-900 capitalize">
                    {staffTask.task_repeat_time_table.type}
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Response Section */}
          {staffTask.instructions?.instruction_type && (
            <>
              <Separator className="bg-green-100" />
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-green-700 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Response
                </h3>
                <div className="pl-7">
                  <p className="text-sm text-gray-500">Response Type</p>
                  <p className="text-base text-gray-900 capitalize">{staffTask.instructions?.instruction_type}</p>
                  
                  {staffTask.instructions?.instruction_type === "form" && (
                    <div className="mt-4 space-y-4">
                      {staffTask?.instructions?.form?.map((field: TaskForm, index: number) => (
                        <div key={index} className="bg-green-50 p-4 rounded-lg">
                          <p className="font-medium text-green-800">{field.form_content}</p>
                          {field.form_type === "dropdown" && (
                            <div className="mt-2">
                              <p className="text-sm text-gray-600">Selected: {field.form_value}</p>
                              <p className="text-sm text-gray-500">Options: {field.form_options ? field.form_options.join(", ") : "N/A"}</p>
                            </div>
                          )}
                          {field.form_type === "checkbox" && (
                            <p className="mt-2 text-sm text-gray-600">
                              {field.form_value ? "✓ Checked" : "✗ Unchecked"}
                            </p>
                          )}
                          {(field.form_type === "text" || field.form_type === "textarea") && (
                            <p className="mt-2 text-sm text-gray-600">{field.form_value}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {staffTask.instructions?.instruction_type === "text" && staffTask.instructions?.instruction_content && (
                    <div className="mt-4 bg-green-50 p-4 rounded-lg">
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
