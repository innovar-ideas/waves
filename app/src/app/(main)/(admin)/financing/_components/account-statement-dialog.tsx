"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { trpc } from "@/app/_providers/trpc-provider";
import { toast } from "@/components/ui/use-toast";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "@radix-ui/react-icons";
import { Calendar } from "@/components/ui/calendar";

interface StatementItem {
  Date: string
  Description: string
  Amount: number
  PaidBy: string
  Balance: number
}

interface StatementData {
  accountName: string
  accountType: string
  items: StatementItem[]
}

interface AccountStatementDialogProps {
  accountId: string
  accountName: string
  sessions: { id: string; name: string }[]
}

const FormSchema = z.object({
  session: z.string({
    required_error: "Please select a session.",
  }),
  dateRange: z.object({
    from: z.date({
      required_error: "A start date is required.",
    }),
    to: z.date({
      required_error: "An end date is required.",
    }),
  }),
});

export function AccountStatementDialog({ accountId, accountName, sessions }: AccountStatementDialogProps) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  const { mutate: downloadStatement, isPending } = trpc.downloadAccountStatement.useMutation({
    onSuccess: (data: StatementData) => {
      const csvContent = convertToCSV(data.items);
      downloadCSV(csvContent, `${data.accountName}_statement_${format(new Date(), "yyyy-MM-dd")}.csv`);
      toast({
        title: "Statement generated successfully",
        description: "The statement has been downloaded to your device.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    downloadStatement({
      accountId,
      startDate: data.dateRange.from,
      endDate: data.dateRange.to,
    });
  };

  return (
    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
      <Dialog>
        <DialogTrigger asChild>
          <div className="flex items-center px-2 py-1.5 text-sm">
            <FileText className="h-4 w-4 mr-2" />
            Generate Statement
          </div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Generate {accountName} Statement</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="session"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Session</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select session" />
                      </SelectTrigger>
                      <SelectContent>
                        {sessions.map((session) => (
                          <SelectItem key={session.id} value={session.id}>
                            {session.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dateRange"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date Range</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value?.from ? (
                              field.value.to ? (
                                <>
                                  {format(field.value.from, "LLL dd, y")} -{" "}
                                  {format(field.value.to, "LLL dd, y")}
                                </>
                              ) : (
                                format(field.value.from, "LLL dd, y")
                              )
                            ) : (
                              <span>Pick a date range</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent 
                        className="w-auto p-0" 
                        align="start"
                       
                      >
                       
                          <Calendar
                            mode="range"
                            defaultMonth={field.value?.from}
                            selected={field.value}
                            onSelect={field.onChange}
                            numberOfMonths={2}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                          />
            
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit"
                className="w-full" 
                disabled={isPending}
              >
                {isPending ? "Generating..." : "Generate Statement"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </DropdownMenuItem>
  );
}

function convertToCSV(data: StatementItem[]): string {
  if (data.length === 0) return "";
  
  const headers = Object.keys(data[0]) as (keyof StatementItem)[];
  const rows = data.map(row => 
    headers.map(header => JSON.stringify(row[header])).join(",")
  );
  
  return [headers.join(","), ...rows].join("\n");
}

function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
