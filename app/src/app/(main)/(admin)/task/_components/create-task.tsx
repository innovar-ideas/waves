import { createTaskSchema } from "@/app/server/dtos";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/app/_providers/trpc-provider";
import { toast } from "sonner";

export const CreateTask = () => {
  const utils = trpc.useUtils();
  const [isRepeated, setIsRepeated] = useState(false);
  const [instructionType, setInstructionType] = useState<"text" | "form">("text");
  const [formType, setFormType] = useState<"text" | "number" | "date" | "checkbox" | "radio" | "dropdown" | "true_false">("text");
  const [repeatType, setRepeatType] = useState<"daily" | "weekly" | "monthly" | "yearly">("daily");
  
  const createTask = trpc.createTask.useMutation({
    onSuccess: () => {
      toast.success("Task created successfully");
      utils.getAllTasksByOrganization.invalidate().catch(console.error);
    },
    onError: (error) => {
      toast.error("Error in creating task: " + (error?.message || "Unknown error"));
      console.error("Task creation error:", error);
    }
  });

  const form = useForm<z.infer<typeof createTaskSchema>>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      is_repeated: false,
      instructions: {
        instruction_type: "text",
        instruction_content: "",
      },
    }
  });

  const onSubmit = async (data: z.infer<typeof createTaskSchema>) => {
    try {
      await createTask.mutateAsync(data);
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Failed to submit form. Please try again.");
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>, field: any) => {
    try {
      const date = new Date(`1970-01-01T${e.target.value}`);
      if (!isNaN(date.getTime())) {
        field.onChange(date);
      }
    } catch (error) {
      console.error("Time parsing error:", error);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, field: any) => {
    try {
      const date = new Date(e.target.value);
      if (!isNaN(date.getTime())) {
        field.onChange(date);
      }
    } catch (error) {
      console.error("Date parsing error:", error);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter task title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter task description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_repeated"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2">
              <FormControl>
                <Checkbox 
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);
                    setIsRepeated(!!checked);
                  }}
                />
              </FormControl>
              <FormLabel>Is this a repeated task?</FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />

        {isRepeated && (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="task_repeat_time_table.type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Repeat Type</FormLabel>
                  <Select onValueChange={(value) => {
                    setRepeatType(value as "daily" | "weekly" | "monthly" | "yearly");
                    field.onChange(value);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select repeat type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {repeatType === "daily" && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="task_repeat_time_table.TaskDailyTimeTable.day"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Day</FormLabel>
                      <Select onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select day" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monday">Monday</SelectItem>
                          <SelectItem value="tuesday">Tuesday</SelectItem>
                          <SelectItem value="wednesday">Wednesday</SelectItem>
                          <SelectItem value="thursday">Thursday</SelectItem>
                          <SelectItem value="friday">Friday</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="task_repeat_time_table.TaskDailyTimeTable.start_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input 
                          type="time" 
                          {...field} 
                          value={field.value instanceof Date ? field.value.toTimeString().slice(0,5) : ""}
                          onChange={(e) => handleTimeChange(e, field)}
                        />
                      </FormControl>
                      <FormMessage />
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
                          {...field} 
                          value={field.value instanceof Date ? field.value.toTimeString().slice(0,5) : ""}
                          onChange={(e) => handleTimeChange(e, field)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {repeatType === "weekly" && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="task_repeat_time_table.TaskWeeklyTimeTable.start_day"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Day</FormLabel>
                      <Select onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select start day" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monday">Monday</SelectItem>
                          <SelectItem value="tuesday">Tuesday</SelectItem>
                          <SelectItem value="wednesday">Wednesday</SelectItem>
                          <SelectItem value="thursday">Thursday</SelectItem>
                          <SelectItem value="friday">Friday</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="task_repeat_time_table.TaskWeeklyTimeTable.end_day"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Day</FormLabel>
                      <Select onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select end day" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monday">Monday</SelectItem>
                          <SelectItem value="tuesday">Tuesday</SelectItem>
                          <SelectItem value="wednesday">Wednesday</SelectItem>
                          <SelectItem value="thursday">Thursday</SelectItem>
                          <SelectItem value="friday">Friday</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {(repeatType === "monthly" || repeatType === "yearly") && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name={`task_repeat_time_table.Task${repeatType === "monthly" ? "Monthly" : "Yearly"}TimeTable.month`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Month</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          max="12" 
                          {...field}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (!isNaN(value) && value >= 1 && value <= 12) {
                              field.onChange(value);
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`task_repeat_time_table.Task${repeatType === "monthly" ? "Monthly" : "Yearly"}TimeTable.start_date`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          value={field.value instanceof Date ? field.value.toISOString().split("T")[0] : ""}
                          onChange={(e) => handleDateChange(e, field)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`task_repeat_time_table.Task${repeatType === "monthly" ? "Monthly" : "Yearly"}TimeTable.end_date`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          value={field.value instanceof Date ? field.value.toISOString().split("T")[0] : ""}
                          onChange={(e) => handleDateChange(e, field)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>
        )}

        <div className="space-y-4">
          <Select 
            onValueChange={(value) => setInstructionType(value as "text" | "form")}
            defaultValue={instructionType}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select instruction type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="form">Form</SelectItem>
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
                    <Textarea placeholder="Enter instructions" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {instructionType === "form" && (
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="instructions.form.form_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Response Type</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        const validType = value as "text" | "number" | "date" | "checkbox" | "radio" | "dropdown" | "true_false";
                        setFormType(validType);
                        field.onChange(value);
                      }}
                      defaultValue={formType}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select response type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Short Answer</SelectItem>
                        <SelectItem value="number">Number Input</SelectItem>
                        <SelectItem value="date">Date Input</SelectItem>
                        <SelectItem value="checkbox">Multiple Choice (Multiple Answers)</SelectItem>
                        <SelectItem value="radio">Multiple Choice (Single Answer)</SelectItem>
                        <SelectItem value="dropdown">Dropdown Selection</SelectItem>
                        <SelectItem value="true_false">Yes/No Question</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="instructions.form.form_content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your question" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="instructions.form.form_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Help Text (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter additional instructions or help text for this question" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {(formType === "radio" || formType === "dropdown" || formType === "checkbox") && (
                <FormField
                  control={form.control}
                  name="instructions.form.form_options"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Answer Options (one per line)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter options, one per line"
                          {...field}
                          onChange={(e) => {
                            const options = e.target.value.split("\n").filter(option => option.trim() !== "");
                            field.onChange(options);
                          }}
                          value={Array.isArray(field.value) ? field.value.join("\n") : ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          )}
        </div>

        <Button 
          type="submit" 
          disabled={createTask.isPending}
          onClick={(e) => {
            e.preventDefault();
            form.handleSubmit(onSubmit)();
          }}
        >
          {createTask.isPending ? "Creating..." : "Create Task"}
        </Button>
      </form>
    </div>
  );
};