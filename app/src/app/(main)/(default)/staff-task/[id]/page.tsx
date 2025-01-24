"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { TaskForm, TaskTable, TaskInstructions } from "@/app/server/types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { trpc } from "@/app/_providers/trpc-provider";

export default function StaffTaskPage() {
  const params = useParams();
  const [task, setTask] = useState<TaskTable | null>(null);
  const [formData, setFormData] = useState<TaskForm[]>([]);
  const [loading, setLoading] = useState(true);

  const { data: taskData } = trpc.staffGetTaskById.useQuery({ 
    id: params.id as string 
  });

  useEffect(() => {
    if (taskData) {
      setTask(taskData);
      const instructions = taskData.task.instructions as TaskInstructions;
      if (instructions?.instruction_type === "form") {
        setFormData(instructions.form as unknown as TaskForm[]);
      }
      setLoading(false);
    }
  }, [taskData]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Add API call to submit form data
      toast.success("Task feedback submitted successfully");
    } catch (error) {
        console.log(error);
      toast.error("Failed to submit task feedback");
    }
  };

  const renderFormField = (field: TaskForm) => {
    switch (field.form_type) {
      case "checkbox":
        return (
          <div className="space-y-2">
            <Label>{field.form_description}</Label>
            <div className="flex flex-col space-y-2">
              {field.form_options?.map((option) => (
                <div key={option} className="flex items-center space-x-2">
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
                  />
                  <Label htmlFor={option}>{option}</Label>
                </div>
              ))}
            </div>
          </div>
        );

      case "boolean":
        return (
          <div className="space-y-2">
            <Label>{field.form_description}</Label>
            <RadioGroup
              value={field.form_value}
              onValueChange={(value) =>
                setFormData(formData.map(f => 
                  f === field ? {...f, form_value: value} : f
                ))
              }
            >
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id={`${field.form_content}-true`} />
                  <Label htmlFor={`${field.form_content}-true`}>True</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id={`${field.form_content}-false`} />
                  <Label htmlFor={`${field.form_content}-false`}>False</Label>
                </div>
              </div>
            </RadioGroup>
          </div>
        );

      case "dropdown":
        return (
          <div className="space-y-2">
            <Label>{field.form_description}</Label>
            <Select
              value={field.form_value}
              onValueChange={(value) =>
                setFormData(formData.map(f =>
                  f === field ? {...f, form_value: value} : f
                ))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {field.form_options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case "text":
        return (
          <div className="space-y-2">
            <Label htmlFor={field.form_content}>{field.form_description}</Label>
            <Textarea
              id={field.form_content}
              value={field.form_value || ""}
              onChange={(e) =>
                setFormData(formData.map(f =>
                  f === field ? {...f, form_value: e.target.value} : f
                ))
              }
              placeholder="Enter your response..."
              className="min-h-[100px]"
            />
          </div>
        );

      case "date":
        return (
          <div className="space-y-2">
            <Label htmlFor={field.form_content}>{field.form_description}</Label>
            <Input
              id={field.form_content}
              type="date"
              value={field.form_value || ""}
              onChange={(e) =>
                setFormData(formData.map(f =>
                  f === field ? {...f, form_value: e.target.value} : f
                ))
              }
            />
          </div>
        );

      case "number":
        return (
          <div className="space-y-2">
            <Label htmlFor={field.form_content}>{field.form_description}</Label>
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
            />
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!task) {
    return <div className="flex items-center justify-center min-h-screen">Task not found</div>;
  }

  const instructions = task.task.instructions as TaskInstructions;

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>{task.task.title ?? ""}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Description</h3>
              <p className="text-gray-600">{task.task.description ?? ""}</p>
            </div>

            {instructions?.instruction_type === "form" && (
              <form onSubmit={handleFormSubmit} className="space-y-6">
                {formData.map((field, index) => (
                  <div key={index} className="space-y-4">
                    {renderFormField(field)}
                  </div>
                ))}
                <Button type="submit">Submit Task</Button>
              </form>
            )}

            {instructions?.instruction_type === "text" && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Instructions</h3>
                <p className="text-gray-600">{instructions.instruction_content}</p>
                <form onSubmit={handleFormSubmit}>
                  <div className="space-y-4">
                    <Label htmlFor="feedback">Your Response</Label>
                    <Textarea
                      id="feedback"
                      value={formData[0]?.form_value || ""}
                      onChange={(e) =>
                        setFormData([{ form_value: e.target.value }])
                      }
                      required
                    />
                  </div>
                  <Button type="submit" className="mt-4">Submit Response</Button>
                </form>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
