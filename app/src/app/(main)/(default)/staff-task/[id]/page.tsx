"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { TaskForm, TaskTable, TaskInstructions, StaffTaskResponseType, StaffTaskRepeatTimeTable } from "@/app/server/types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { trpc } from "@/app/_providers/trpc-provider";
import { CalendarIcon, CheckCircleIcon, ClockIcon, UserIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { useSession } from "next-auth/react";

export default function StaffTaskPage() {
  const params = useParams();
  const [task, setTask] = useState<TaskTable | null>(null);
  const [formData, setFormData] = useState<TaskForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [textResponse, setTextResponse] = useState("");
  const router = useRouter();

  const { data: taskData } = trpc.staffGetTaskById.useQuery({ 
    id: params.id as string 
  });
  const user_id = useSession().data?.user?.id;

  const { mutate: submitTask } = trpc.staffSubmitTask.useMutation({
    onSuccess: () => {
      toast.success("Task submitted successfully");
      router.push("/staff-task");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to submit task");
    }
  });

  useEffect(() => {
    if (taskData) {
      setTask(taskData);
      const instructions = taskData.task.instructions as TaskInstructions;
      if (instructions?.instruction_type === "form") {
        const initialFormData = (instructions.form as unknown as TaskForm[]).map(field => ({
          ...field,
          form_value: ""
        }));
        setFormData(initialFormData);
      }
      setLoading(false);
    }
  }, [taskData]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const instructions = task?.task.instructions as TaskInstructions;

    const staffTaskRepeatTimeTable: StaffTaskRepeatTimeTable = {
      type: task?.task_repeat_time_table?.type ?? "",
      daily: task?.task_repeat_time_table?.daily ?? {},
      weekly: task?.task_repeat_time_table?.weekly ?? {},
      monthly: task?.task_repeat_time_table?.monthly ?? {},
      yearly: task?.task_repeat_time_table?.yearly ?? {}
    };
    const staffFormData: TaskForm[] = formData.map(field => ({
      ...field,
      form_value: field.form_value || ""
    }));
    
    const staffTaskResponse: StaffTaskResponseType = {
      response_type: instructions?.instruction_type ?? "",
      instructions_text_response: textResponse ?? "",
      form_data: formData,
      staff_task_repeat_time_table: staffTaskRepeatTimeTable
    };

    try {
      submitTask({
        task_id: task?.id as string,
        staff_id: user_id as string,
        organization_id: task?.task.organization_id as string,
        status: "completed",
        response_type: staffTaskResponse.response_type ?? "",
        instructions_text_response: staffTaskResponse.instructions_text_response ?? "",
        form_data: staffFormData ?? [],
        staff_task_repeat_time_table: staffTaskRepeatTimeTable
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit task feedback");
    }
  };

  const renderFormField = (field: TaskForm, index: number) => {
    const baseFieldClasses = "p-6 bg-white rounded-lg border-2 border-gray-100 shadow-sm hover:border-green-200 transition-all duration-200";
    
    const fieldWrapper = (children: React.ReactNode) => (
      <div className={baseFieldClasses}>
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600 text-sm font-medium mt-1">
              {index + 1}
            </span>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 mb-1">{field.form_description}</h3>
              {field.form_content && (
                <div className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                  <InformationCircleIcon className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                  <p>{field.form_content}</p>
                </div>
              )}
            </div>
          </div>
          <div className="ml-9">
            {children}
          </div>
        </div>
      </div>
    );

    switch (field.form_type) {
      case "text":
        return fieldWrapper(
          <div className="space-y-2">
            <Input
              id={field.form_content}
              value={field.form_value || ""}
              onChange={(e) =>
                setFormData(formData.map(f =>
                  f === field ? {...f, form_value: e.target.value} : f
                ))
              }
              placeholder="Type your answer here..."
              className="h-12 border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200"
            />
          </div>
        );

      case "checkbox":
        return fieldWrapper(
          <div className="space-y-3">
            {field.form_options?.map((option) => (
              <div key={option} className="flex items-center space-x-3">
                <Checkbox
                  id={option}
                  checked={field.form_value === option}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setFormData(formData.map(f => 
                        f === field ? {...f, form_value: option} : f
                      ));
                    }
                  }}
                  className="border-2 border-gray-300 text-green-600"
                />
                <Label htmlFor={option} className="text-gray-700">{option}</Label>
              </div>
            ))}
          </div>
        );

      case "true_false":
        return fieldWrapper(
          <RadioGroup
            value={field.form_value}
            onValueChange={(value) =>
              setFormData(formData.map(f => 
                f === field ? {...f, form_value: value} : f
              ))
            }
            className="flex flex-col gap-3"
          >
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id={`${field.form_content}-true`} className="border-2 border-gray-300 text-green-600" />
                <Label htmlFor={`${field.form_content}-true`} className="text-gray-700">True</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id={`${field.form_content}-false`} className="border-2 border-gray-300 text-green-600" />
                <Label htmlFor={`${field.form_content}-false`} className="text-gray-700">False</Label>
              </div>
            </div>
          </RadioGroup>
        );

      case "radio":
        return fieldWrapper(
          <RadioGroup
            value={field.form_value}
            onValueChange={(value) =>
              setFormData(formData.map(f => 
                f === field ? {...f, form_value: value} : f
              ))
            }
            className="flex flex-col gap-3"
          >
            {field.form_options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} className="border-2 border-gray-300 text-green-600" />
                <Label>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case "dropdown":
        return fieldWrapper(
          <Select
            value={field.form_value}
            onValueChange={(value) =>
              setFormData(formData.map(f =>
                f === field ? {...f, form_value: value} : f
              ))
            }
          >
            <SelectTrigger className="w-full h-12 border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {field.form_options?.map((option) => (
                <SelectItem key={option} value={option} className="py-3 hover:bg-green-50">
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "date":
        return fieldWrapper(
          <div>
            <Input
              id={field.form_content}
              type="date"
              value={field.form_value || ""}
              onChange={(e) =>
                setFormData(formData.map(f =>
                  f === field ? {...f, form_value: e.target.value} : f
                ))
              }
              className="h-12 border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200"
            />
          </div>
        );

      case "number":
        return fieldWrapper(
          <div>
            <Input
              id={field.form_content}
              type="number"
              value={field.form_value || ""}
              onChange={(e) =>
                setFormData(formData.map(f =>
                  f === field ? {...f, form_value: e.target.value} : f
                ))
              }
              placeholder="Enter a number..."
              className="h-12 border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200"
            />
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-xl font-medium text-gray-700">Task not found</div>
        <Button variant="outline" onClick={() => window.history.back()}>Go Back</Button>
      </div>
    );
  }

  const instructions = task.task.instructions as TaskInstructions;

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="bg-white shadow-lg border-0">
        <CardHeader className="bg-green-50 border-b border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-gray-900">{task.task.title}</CardTitle>
              <CardDescription className="mt-2 text-gray-600">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="flex items-center gap-1">
                    <UserIcon className="w-4 h-4" />
                    Assigned by: {task.created_by_user?.first_name} {task.created_by_user?.last_name}
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarIcon className="w-4 h-4" />
                    Due: {task.task.end_date ? format(new Date(task.task.end_date), "MMM dd, yyyy") : "No due date"}
                  </span>
                  <span className="flex items-center gap-1">
                    <ClockIcon className="w-4 h-4" />
                    Status: <span className="text-green-600 font-medium">New Task</span>
                  </span>
                  {task.task.is_repeated && (
  <>
    <span className="flex items-center gap-1">
      <ClockIcon className="w-4 h-4" />
      Repeats: <span className="text-blue-600 font-medium capitalize">{task.task_repeat_time_table?.type}</span>
    </span>
    <div className="w-full mt-2 bg-blue-50 p-2 rounded-md">
      {task.task_repeat_time_table?.type === "daily" && (
        <span className="text-sm text-blue-700">
          Repeats daily from{" "}
          {task.task_repeat_time_table.daily?.start_time && 
            format(new Date(task.task_repeat_time_table.daily.start_time), "h:mm a")}{" "}
          to{" "}
          {task.task_repeat_time_table.daily?.end_time && 
            format(new Date(task.task_repeat_time_table.daily.end_time), "h:mm a")}
        </span>
      )}
      {task.task_repeat_time_table?.type === "weekly" && (
        <span className="text-sm text-blue-700">
          Repeats weekly from{" "}
          {task.task_repeat_time_table.weekly?.start_day && 
            task.task_repeat_time_table.weekly.start_day}{" "}
          to{" "}
          {task.task_repeat_time_table.weekly?.end_day && 
            task.task_repeat_time_table.weekly.end_day}
        </span>
      )}
      {task.task_repeat_time_table?.type === "monthly" && (
        <span className="text-sm text-blue-700">
          Repeats monthly from{" "}
          {task.task_repeat_time_table.monthly?.start_date && 
            format(new Date(task.task_repeat_time_table.monthly.start_date), "MMM dd, yyyy")}{" "}
          to{" "}
          {task.task_repeat_time_table.monthly?.end_date && 
            format(new Date(task.task_repeat_time_table.monthly.end_date), "MMM dd, yyyy")}
        </span>
      )}
      {task.task_repeat_time_table?.type === "yearly" && (
        <span className="text-sm text-blue-700">
          Repeats every year from{" "}
          {task.task_repeat_time_table.yearly?.start_date &&
            format(new Date(task.task_repeat_time_table.yearly.start_date), "MMM dd, yyyy")}{" "}
          to{" "}
          {task.task_repeat_time_table.yearly?.end_date &&
            format(new Date(task.task_repeat_time_table.yearly.end_date), "MMM dd, yyyy")}
        </span>
      )}
    </div>
  </>
)}

                </div>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-8">
          <div className="space-y-8">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
              <h3 className="text-lg font-medium mb-3">Task Description</h3>
              <p className="text-gray-700 leading-relaxed">{task.task.description}</p>
            </div>

            {instructions?.instruction_type === "form" && (
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="bg-green-50 p-4 rounded-lg mb-6 flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                  <p className="text-green-700">Please fill out all required fields below</p>
                </div>
                
                {formData.map((field, index) => (
                  <div key={index}>
                    {renderFormField(field, index)}
                  </div>
                ))}
                
                <div className="flex justify-end gap-4 pt-6">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/staff-task")}
                    className="px-8 py-3 rounded-lg font-medium border-gray-300 hover:bg-gray-50"
                  >
                    Fill Later
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium"
                  >
                    Submit Task Response
                  </Button>
                </div>
              </form>
            )}

            {instructions?.instruction_type === "text" && (
              <div className="space-y-6">
                <div className="bg-green-50 p-6 rounded-lg border border-green-100">
                  <h3 className="text-lg font-medium mb-3">Instructions</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{instructions.instruction_content}</p>
                </div>
                
                <form onSubmit={handleFormSubmit} className="bg-white p-6 rounded-lg border-2 border-gray-100">
                  <Label htmlFor="textResponse" className="text-lg font-medium text-gray-900">Your Response</Label>
                  <Textarea
                    id="textResponse"
                    value={textResponse}
                    onChange={(e) => setTextResponse(e.target.value)}
                    placeholder="Type your response here..."
                    className="mt-3 min-h-[200px] border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                    required
                  />
                  <div className="flex justify-end gap-4 mt-6">
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/staff-task")}
                      className="px-8 py-3 rounded-lg font-medium border-gray-300 hover:bg-gray-50"
                    >
                      Fill Later
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium"
                    >
                      Submit Response
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
