"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { SheetClose } from "@/components/ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { createWorkHistorySchema } from "@/app/server/dtos";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { trpc } from "@/app/_providers/trpc-provider";
import { toast } from "sonner";


type TFormData = z.infer<typeof createWorkHistorySchema>;

interface ExpereinceFormProps {
  staff_id: string;
}

export default function AddExperienceForm({staff_id}: ExpereinceFormProps) {
  const form = useForm<TFormData>({ resolver: zodResolver(createWorkHistorySchema) });
  const [responsibilities, setResponsibilities] = useState("");
  const utils = trpc.useUtils();

  const addWorkHistory = trpc.createWorkHistory.useMutation({
    onSuccess: async () => {
      toast.success("Work history added successfully");

      utils.getAllWorkHistory.invalidate();
    },
    onError: (error) => {
      console.error(error);

      toast.error("Error in adding work history");
    },
  });

  const onSubmit = (values: TFormData) => {

    addWorkHistory.mutate({...values, responsibilities, id: staff_id });

  };

  return (
    <div className="w-full mx-auto p-2">
      <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Experience</h2>
        <div className="space-x-2">
            <SheetClose>
                <Button variant="ghost" className="text-blue-600">
                    Cancel
                </Button>
           </SheetClose>
          <Button type="submit" className="bg-blue-600">
            Save
          </Button>
        </div>
      </div>

      <div className="space-y-6">

          <div className="py-1">
            <FormField
              control={form.control}
              name="job_title"
              render={({ field }) => (
              <FormItem>
                  <FormLabel className="text-sm text-gray-600">JOB TITLE</FormLabel>
                  <FormControl>
                  <Input
                  placeholder="Please enter job title"
                      {...field}
                  />
                  </FormControl>
                  <FormMessage />
                </FormItem>
                )}
              />
            </div>
           <div>
              <FormField
                control={form.control}
                name="company_industry"
                render={({ field }) => (
                    <FormItem className="mt-2">
                    <FormLabel className="text-sm text-gray-600">COMPANYS INDUSTRY</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl className="mt-1">
                        <SelectTrigger>
                            <SelectValue placeholder="Select Payment type" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="it">Information Technology</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
              />
            </div>
        <div className="py-1">
            <FormField
              control={form.control}
              name="company_name"
              render={({ field }) => (
              <FormItem>
                  <FormLabel className="text-sm text-gray-600">COMPANY NAME</FormLabel>
                  <FormControl>
                  <Input
                  placeholder="Please enter company name"
                      {...field}
                  />
                  </FormControl>
                  <FormMessage />
                </FormItem>
                )}
              />
            </div>

        <div className="flex flex-col gap-3">
          <div>
            <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                <FormItem>
                    <FormLabel className="text-sm text-gray-600">START DATE</FormLabel>
                    <FormControl>
                    <Input type="date" onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )} />
          </div>
          <div>
            <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                <FormItem>
                    <FormLabel className="text-sm text-gray-600">END DATE</FormLabel>
                    <FormControl>
                    <Input placeholder="Enter end date"  type="date" onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )} />
          </div>
        </div>

        {/* <div>
          <Label className="text-sm text-gray-600">PERIOD OF WORK</Label>
          <div className="flex gap-4 mt-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : "Start work"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : "End work"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div> */}

        <div>
          <Label className="text-sm text-gray-600">RESPONSIBILITIES</Label>
          <div className="mt-1 border rounded-md">
            <div className="flex gap-2 p-2 border-b">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                B
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                I
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                U
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                ≡
              </Button>
            </div>
            <textarea
              className="w-full p-3 min-h-[100px] outline-none resize-none"
              placeholder="Performed tasks related to..."
              value={responsibilities}
              onChange={(e) => setResponsibilities(e.target.value)}
            />
          </div>
        </div>
      </div>
      </form>
      </Form>
    </div>
  );
}