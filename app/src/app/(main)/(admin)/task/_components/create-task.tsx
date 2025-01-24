"use client";

import { createTaskSchema } from "@/app/server/dtos";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useForm, ControllerRenderProps } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/app/_providers/trpc-provider";
import { toast } from "sonner";
import { X, Plus } from "lucide-react";
import { getActiveOrganizationSlugFromLocalStorage } from "@/lib/helper-function";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MultiSelector } from "@/components/ui/multi-select";
import { TaskForm, TaskInstructions } from "@/app/server/types";

export const CreateTask = () => {
  const utils = trpc.useUtils();
  const [isRepeated, setIsRepeated] = useState(false);
  const [instructionType, setInstructionType] = useState<"text" | "form">("text");
  const [instructionsFormFields, setInstructionsFormFields] = useState<TaskInstructions[]>([]);
  const [formFields, setFormFields] = useState<TaskForm[]>([{
    form_type: "text",
    form_content: "",
    form_description: "",
    form_options: []
  }]);
  const [repeatType, setRepeatType] = useState<"daily" | "weekly" | "monthly" | "yearly">("daily");
  const organization_slug = getActiveOrganizationSlugFromLocalStorage();
  const [isOpen, setIsOpen] = useState(false);
  const [newOption, setNewOption] = useState("");
  const user_id = useSession().data?.user.id;

  const { data:users } = trpc.getUsersForTaskByOrganizationId.useQuery({ id: organization_slug });
  
  const createTask = trpc.createTask.useMutation({
    onSuccess: () => {
      toast.success("Task created successfully");
      utils.getAllTasksByOrganization.invalidate().catch(console.error);
      setIsOpen(false);
    },
    onError: (error) => {
      toast.error("Error in creating task: " + (error?.message || "Unknown error"));
      console.error("Task creation error:", error);
    }
  });
  const form = useForm<z.infer<typeof createTaskSchema>>({
    resolver: zodResolver(createTaskSchema),
  });

  const onSubmit =  (data: z.infer<typeof createTaskSchema>) => {
    try {
      console.log(data," 1 <=================================");
      if (!data.title?.trim()) {
        toast.error("Task title is required");
        return;
      }

      if (!data.description?.trim()) {
        toast.error("Task description is required");
        return;
      }

      if (!data.staff_tasks || data.staff_tasks.length === 0) {
        toast.error("Please assign at least one user to the task");
        return;
      }

      if (instructionType === "form") {
        // Validate form fields
        const invalidFields = formFields.filter(field => 
          !field.form_type || !field.form_content?.trim() || !field.form_description?.trim()
        );

        if (invalidFields.length > 0) {
          toast.error("Please fill in all form fields (type, content, and description)");
          return;
        }

        // Check if dropdown/radio/checkbox fields have options
        const fieldsNeedingOptions = formFields.filter(field => 
          (field.form_type === "dropdown" || field.form_type === "radio" || field.form_type === "checkbox") &&
          (!field.form_options || field.form_options.length === 0)
        );

        if (fieldsNeedingOptions.length > 0) {
          toast.error("Please add options for all dropdown, radio, or checkbox fields");
          return;
        }

        data.instructions = {
          instruction_type: "form",
          form: formFields.map(field => ({
            form_type: field.form_type,
            form_content: field.form_content,
            form_description: field.form_description,
            form_options: field.form_type === "dropdown" || field.form_type === "radio" || field.form_type === "checkbox" 
              ? field.form_options 
              : field.form_type === "true_false"
              ? ["true", "false"]
              : undefined
          }))
        };
      } else {
        // Validate text instructions
        if (!data.instructions?.instruction_content?.trim()) {
          toast.error("Please provide task instructions");
          return;
        }
      }
      data.organization_slug = organization_slug || "";
      data.created_by_id = user_id;

       createTask.mutate(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          toast.error(`Validation error: ${err.path.join(".")} - ${err.message}`);
        });
      } else if (error instanceof Error) {
        toast.error(`Error: ${error.message}`);
      } else {
        toast.error("An unexpected error occurred");
      }
      console.error("Form submission error:", error);
    }
  };

  const handleTimeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: ControllerRenderProps<z.infer<typeof createTaskSchema>, "task_repeat_time_table.TaskDailyTimeTable.start_time" | "task_repeat_time_table.TaskDailyTimeTable.end_time">
  ) => {
    try {
      const date = new Date(`1970-01-01T${e.target.value}`);
      if (!isNaN(date.getTime())) {
        field.onChange(date);
      }
    } catch (error) {
      console.error("Time parsing error:", error);
      toast.error("Invalid time format");
    }
  };

  const handleDateChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: ControllerRenderProps<z.infer<typeof createTaskSchema>, "task_repeat_time_table.TaskMonthlyTimeTable.start_date" | "task_repeat_time_table.TaskMonthlyTimeTable.end_date" | "task_repeat_time_table.TaskYearlyTimeTable.start_date" | "task_repeat_time_table.TaskYearlyTimeTable.end_date">
  ) => {
    try {
      // Parse the date string from the input
      const dateValue = e.target.value;
      const date = new Date(dateValue);

      // Validate the date is valid before updating
      if (!isNaN(date.getTime())) {
        field.onChange(date);
      } else {
        toast.error("Please enter a valid date");
      }
    } catch (error) {
      console.error("Error parsing date:", error);
      toast.error("Invalid date format. Please use YYYY-MM-DD");
    }
  };

  const handleMonthlyTimeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: ControllerRenderProps<z.infer<typeof createTaskSchema>, "task_repeat_time_table.TaskMonthlyTimeTable.start_date" | "task_repeat_time_table.TaskMonthlyTimeTable.end_date">
  ) => {
    try {
      const date = new Date(`1970-01-01T${e.target.value}`);
      if (!isNaN(date.getTime())) {
        field.onChange(date);
      }
    } catch (error) {
      console.error("Time parsing error:", error);
      toast.error("Invalid time format");
    }
  };

  const addFormField = () => {
    const newId = Math.max(...instructionsFormFields.map(f => f?.form?.length ?? 0), 0) + 1;
    console.log(newId);
    setFormFields([...formFields, {
      form_type: "text",
      form_content: "",
      form_description: "",
      form_options: []
    }]);
  };

  const removeFormField = (id: number) => {
    setInstructionsFormFields(instructionsFormFields.filter(field => field.form?.length !== id));
  };

  const addOption = (fieldId: number, option: string) => {
    setFormFields(formFields.map((field, index) => {
      if (index === fieldId) {
        return {
          ...field,
          form_options: [...(field.form_options || []), option.trim()]
        };
      }
      return field;
    }));
  };

  const removeOption = (fieldId: number, optionToRemove: string) => {
    setFormFields(formFields.map((field, index) => {
      if (index === fieldId) {
        return {
          ...field,
          form_options: field.form_options?.filter(opt => opt !== optionToRemove) || []
        };
      }
      return field;
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg shadow-md transition duration-200 ease-in-out transform hover:scale-105">
          Create New Task
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto bg-white rounded-xl shadow-2xl">
        <DialogHeader className="border-b pb-4 bg-gradient-to-r from-green-50 to-white">
          <DialogTitle className="text-2xl font-bold text-green-800 px-6 py-4">Create New Task</DialogTitle>
        </DialogHeader>
        <div className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-gray-800 font-semibold text-lg">Title</FormLabel>
                      <FormControl>
                        <Input 
                          // className="min-h-[120px] rounded-lg border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200" 
                          placeholder="Enter task title"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-sm" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-gray-800 font-semibold text-lg">Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          className="min-h-[120px] rounded-lg border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200" 
                          placeholder="Provide detailed task description"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-sm" />
                    </FormItem>
                  )}
                />
              </div>
              <div className="bg-gray-50 p-6 rounded-xl shadow-inner space-y-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Assign Users</h3>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  {users && (
                  <FormField
                    control={form.control}
                    name="staff_tasks"
                    render={({ field }) => (
                      <FormItem>
                      <FormLabel>General Staffs</FormLabel>
                      <FormControl>
                        <MultiSelector
                          data-cy='classes-multi-selector'
                          values={field.value ?? []}
                          onValuesChange={(values) => {
                            field.onBlur();
                            field.onChange(values);
                          }}
                          loop={false}
                          options={
                            users?.map((user) => ({
                              label: user.first_name + " " + user.last_name + " - " + user.roles.map(role => role.role_name).join(", "),
                              value: user.id,
                              "data-cy": `class-option-${user.id}`,
                            })) ?? []
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                    )}
                  />
                  )}
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl shadow-inner space-y-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Task Configuration</h3>
                
                <FormField
                  control={form.control}
                  name="is_repeated"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
                      <FormControl>
                        <Checkbox 
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            setIsRepeated(!!checked);
                          }}
                          className="w-5 h-5 border-2 border-green-500 text-green-600 rounded"
                        />
                      </FormControl>
                      <FormLabel className="text-gray-700 font-medium text-lg cursor-pointer">Make this a recurring task</FormLabel>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />

                {isRepeated && (
                  <div className="mt-6 space-y-6 border-t border-gray-200 pt-6">
                    <FormField
                      control={form.control}
                      name="task_repeat_time_table.type"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-gray-800 font-semibold">Repeat Schedule</FormLabel>
                          <Select onValueChange={(value) => {
                            setRepeatType(value as "daily" | "weekly" | "monthly" | "yearly");
                            field.onChange(value);
                          }}>
                            <SelectTrigger className="h-12 rounded-lg border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200">
                              <SelectValue placeholder="Choose repeat frequency" />
                            </SelectTrigger>
                            <SelectContent className="bg-white rounded-lg shadow-xl">
                              <SelectItem value="daily" className="py-3 hover:bg-green-50">Daily</SelectItem>
                              <SelectItem value="weekly" className="py-3 hover:bg-green-50">Weekly</SelectItem>
                              <SelectItem value="monthly" className="py-3 hover:bg-green-50">Monthly</SelectItem>
                              <SelectItem value="yearly" className="py-3 hover:bg-green-50">Yearly</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />

                    {repeatType === "daily" && (
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="task_repeat_time_table.TaskDailyTimeTable.start_time"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Start Time</FormLabel>
                              <FormControl>
                                <Input
                                  type="time"
                                  onChange={(e) => handleTimeChange(e, field)}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="task_repeat_time_table.TaskDailyTimeTable.end_time"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>End Time</FormLabel>
                              <FormControl>
                                <Input
                                  type="time"
                                  onChange={(e) => handleTimeChange(e, field)}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {repeatType === "weekly" && (
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="task_repeat_time_table.TaskWeeklyTimeTable.start_day"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Start Day</FormLabel>
                              <FormControl>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <SelectTrigger className="h-12 rounded-lg border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200">
                                    <SelectValue placeholder="Select start day" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="monday">Monday</SelectItem>
                                    <SelectItem value="tuesday">Tuesday</SelectItem>
                                    <SelectItem value="wednesday">Wednesday</SelectItem>
                                    <SelectItem value="thursday">Thursday</SelectItem>
                                    <SelectItem value="friday">Friday</SelectItem>
                                    <SelectItem value="saturday">Saturday</SelectItem>
                                    <SelectItem value="sunday">Sunday</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="task_repeat_time_table.TaskWeeklyTimeTable.end_day"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>End Day</FormLabel>
                              <FormControl>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <SelectTrigger className="h-12 rounded-lg border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200">
                                    <SelectValue placeholder="Select end day" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="monday">Monday</SelectItem>
                                    <SelectItem value="tuesday">Tuesday</SelectItem>
                                    <SelectItem value="wednesday">Wednesday</SelectItem>
                                    <SelectItem value="thursday">Thursday</SelectItem>
                                    <SelectItem value="friday">Friday</SelectItem>
                                    <SelectItem value="saturday">Saturday</SelectItem>
                                    <SelectItem value="sunday">Sunday</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {repeatType === "monthly" && (
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="task_repeat_time_table.TaskMonthlyTimeTable.start_date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Start Day</FormLabel>
                              <FormControl>
                                <Input
                                  type="date"
                                  onChange={(e) => handleDateChange(e, field)}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="task_repeat_time_table.TaskMonthlyTimeTable.end_date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>End Date</FormLabel>
                              <FormControl>
                                <Input
                                  type="date"
                                  onChange={(e) => handleDateChange(e, field)}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="task_repeat_time_table.TaskMonthlyTimeTable.start_date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Start Time</FormLabel>
                              <FormControl>
                                <Input
                                  type="time"
                                  onChange={(e) => handleMonthlyTimeChange(e, field)}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="task_repeat_time_table.TaskMonthlyTimeTable.end_date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>End Time</FormLabel>
                              <FormControl>
                                <Input
                                  type="time"
                                  onChange={(e) => handleMonthlyTimeChange(e, field)}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {repeatType === "yearly" && (
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="task_repeat_time_table.TaskYearlyTimeTable.start_date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Start Date</FormLabel>
                              <FormControl>
                                <Input
                                  type="date"
                                  onChange={(e) => handleDateChange(e, field)}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="task_repeat_time_table.TaskYearlyTimeTable.end_date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>End Date</FormLabel>
                              <FormControl>
                                <Input
                                  type="date"
                                  onChange={(e) => handleDateChange(e, field)}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="task_repeat_time_table.TaskYearlyTimeTable.start_date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Start Date</FormLabel>
                              <FormControl>
                                <Input
                                  type="date"
                                  onChange={(e) => handleDateChange(e, field)}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="task_repeat_time_table.TaskYearlyTimeTable.end_date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>End Date</FormLabel>
                              <FormControl>
                                <Input
                                  type="date"
                                  onChange={(e) => handleDateChange(e, field)}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-gray-50 p-6 rounded-xl shadow-inner space-y-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Task Instructions</h3>
                
                <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
                  <Select 
                    onValueChange={(value) => setInstructionType(value as "text" | "form")}
                    defaultValue={instructionType}
                  >
                    <SelectTrigger className="h-12 rounded-lg border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200">
                      <SelectValue placeholder="Select instruction format" />
                    </SelectTrigger>
                    <SelectContent className="bg-white rounded-lg shadow-xl">
                      <SelectItem value="text" className="py-3 hover:bg-green-50">Text Instructions</SelectItem>
                      <SelectItem value="form" className="py-3 hover:bg-green-50">Form Response</SelectItem>
                    </SelectContent>
                  </Select>

                  {instructionType === "text" && (
                    <FormField
                      control={form.control}
                      name="instructions.instruction_content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Instructions</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter task instructions..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  )}
                  
                  {instructionType === "form" && (
                    <div className="space-y-6">
                      {formFields.map((field, index) => (
                        <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="font-semibold">Form Field {index + 1}</h4>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFormField(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="space-y-4">
                            <Select
                              value={field.form_type}
                              onValueChange={(value) => {
                                const updatedFields = [...formFields];
                                updatedFields[index] = {
                                  ...field,
                                  form_type: value as TaskForm["form_type"],
                                  form_options: value === "true_false" ? ["true", "false"] : []
                                };
                                setFormFields(updatedFields);
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select field type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="text">Text Input</SelectItem>
                                <SelectItem value="number">Number Input</SelectItem>
                                <SelectItem value="date">Date Input</SelectItem>
                                <SelectItem value="checkbox">Checkbox</SelectItem>
                                <SelectItem value="radio">Radio Buttons</SelectItem>
                                <SelectItem value="dropdown">Dropdown</SelectItem>
                                <SelectItem value="true_false">True/False</SelectItem>
                              </SelectContent>
                            </Select>

                            <Input
                              placeholder="Field content"
                              value={field.form_content || ""}
                              onChange={(e) => {
                                const updatedFields = [...formFields];
                                updatedFields[index] = {
                                  ...field,
                                  form_content: e.target.value
                                };
                                setFormFields(updatedFields);
                              }}
                            />

                            <Input
                              placeholder="Field description"
                              value={field.form_description || ""}
                              onChange={(e) => {
                                const updatedFields = [...formFields];
                                updatedFields[index] = {
                                  ...field,
                                  form_description: e.target.value
                                };
                                setFormFields(updatedFields);
                              }}
                            />

                            {(field.form_type === "dropdown" || field.form_type === "radio" || field.form_type === "checkbox") && (
                              <div className="space-y-2">
                                <div className="flex gap-2">
                                  <Input
                                    placeholder="Add option"
                                    value={newOption}
                                    onChange={(e) => setNewOption(e.target.value)}
                                  />
                                  <Button
                                    type="button"
                                    onClick={() => {
                                      if (newOption.trim()) {
                                        addOption(index, newOption);
                                        setNewOption("");
                                      }
                                    }}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {field.form_options?.map((option, optionIndex) => (
                                    <div key={optionIndex} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                                      <span>{option}</span>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeOption(index, option)}
                                        className="h-4 w-4 p-0"
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {field.form_type === "true_false" && (
                              <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-2 bg-gray-100 rounded">
                                  <span>True</span>
                                </div>
                                <div className="text-center p-2 bg-gray-100 rounded">
                                  <span>False</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      <Button
                        type="button"
                        onClick={addFormField}
                        className="w-full"
                      >
                        Add Form Field
                      </Button>
                    </div>
                  )}
                 
                </div>
              </div>

              <div className="flex justify-end pt-8 border-t border-gray-200">
                <Button 
                  type="submit" 
                  disabled={createTask.isPending}
                  className="bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-3 rounded-lg shadow-lg transition duration-200 ease-in-out transform hover:scale-105 hover:shadow-xl min-w-[180px]"
                  onClick={(e) => {
                    e.preventDefault();
                    form.handleSubmit(onSubmit)();
                  }}
                >
                  {createTask.isPending ? (
                    <span className="flex items-center justify-center gap-3">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Creating Task...
                    </span>
                  ) : "Create Task"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};