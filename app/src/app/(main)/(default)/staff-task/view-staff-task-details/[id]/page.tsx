"use client";

import { useEffect, useState } from "react";
import { api } from "@/app/server/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { CheckCircle2, Clock, User, FileText, Calendar, RotateCw, MessageSquare } from "lucide-react";

export default function StaffTaskDetailsPage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(true);
  const [staffTask, setStaffTask] = useState<any>(null);

  useEffect(() => {
    const fetchStaffTask = async () => {
      try {
        const task = await api.task.getStaffTaskById.query({
          id: params.id
        });
        setStaffTask(task);
      } catch (error) {
        console.error("Error fetching staff task:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStaffTask();
  }, [params.id]);

  if (loading) {
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
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                  }`}>
                  {staffTask.status}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Created At</p>
                <p className="text-base text-gray-900">
                  {format(new Date(staffTask.created_at), 'PPP')}
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
                  {staffTask.task?.created_by_user?.first_name} {staffTask.task?.created_by_user?.last_name}
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
          {staffTask.response_type && (
            <>
              <Separator className="bg-green-100" />
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-green-700 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Response
                </h3>
                <div className="pl-7">
                  <p className="text-sm text-gray-500">Response Type</p>
                  <p className="text-base text-gray-900 capitalize">{staffTask.response_type}</p>
                  
                  {staffTask.response_type === 'form' && staffTask.form_fields && (
                    <div className="mt-4 space-y-4">
                      {staffTask.form_fields.map((field: any, index: number) => (
                        <div key={index} className="bg-green-50 p-4 rounded-lg">
                          <p className="font-medium text-green-800">{field.label}</p>
                          {field.type === 'select' && (
                            <div className="mt-2">
                              <p className="text-sm text-gray-600">Selected: {field.value}</p>
                              <p className="text-sm text-gray-500">Options: {field.options.join(', ')}</p>
                            </div>
                          )}
                          {field.type === 'checkbox' && (
                            <p className="mt-2 text-sm text-gray-600">
                              {field.value ? '✓ Checked' : '✗ Unchecked'}
                            </p>
                          )}
                          {(field.type === 'text' || field.type === 'textarea') && (
                            <p className="mt-2 text-sm text-gray-600">{field.value}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {staffTask.response_type === 'text' && staffTask.text_response && (
                    <div className="mt-4 bg-green-50 p-4 rounded-lg">
                      <p className="text-gray-800">{staffTask.text_response}</p>
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
