"use client";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import useActiveOrganizationStore from "../../../../server/store/active-organization.store";
import { useToast } from "@/components/ui/use-toast";
import { CreatePerformanceReviewTemplateSchema } from "../../../../server/dtos";
import { createPerformanceReviewTemplateSchema } from "../../../../server/dtos";
import { trpc } from "../../../../_providers/trpc-provider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormField, FormLabel, FormMessage, FormControl, FormItem } from "@/components/ui/form";
import { Plus, X } from "lucide-react";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useSession } from "next-auth/react";

interface CreatePerformanceReviewTemplateFormProps {
  onSuccess?: () => void;
}

export default function CreatePerformanceReviewTemplateForm({ onSuccess }: CreatePerformanceReviewTemplateFormProps) {
  const { toast } = useToast();
  const utils = trpc.useUtils();
  const [open, setOpen] = useState(false);
  const { organizationSlug } = useActiveOrganizationStore();
  const { data: session } = useSession();
  const form = useForm<CreatePerformanceReviewTemplateSchema>({
    resolver: zodResolver(createPerformanceReviewTemplateSchema),
    defaultValues: {
      organization_id: organizationSlug,
      name: "",
      type: "annual",
      metrics: [],
      created_by_id: session?.user.id,
      role_level: 1,
    },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "metrics"
  });

  const createPerformanceReviewTemplate = trpc.createPerformanceReviewTemplate.useMutation({
    onSuccess: async () => {
      toast({
        title: "Success",
        variant: "default",
        description: "Performance Review Template Created Successfully",
      });

      utils.getAllPerformanceReviewTemplateByOrganizationSlug.invalidate().then(() => {
        setOpen(false);
      });

      form.reset();
      onSuccess?.();
    },
    onError: async (error) => {
      toast({
        title: "Error",
        variant: "destructive",
        description: error.message || "Failed to create performance review template",
      });
    },
  });

  const onSubmit = (values: CreatePerformanceReviewTemplateSchema) => {
    const submissionData: CreatePerformanceReviewTemplateSchema = {
      ...values,
      organization_id: organizationSlug,
    };

    createPerformanceReviewTemplate.mutate(submissionData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg transition-all duration-200" data-cy="create-leave-setting">
          <Plus className="mr-2 h-4 w-4" />
          <span>Add Performance Review Template</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-white rounded-lg shadow-xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="bg-emerald-50 p-4 rounded-t-lg border-b border-emerald-100">
          <DialogTitle className="text-emerald-800 text-lg font-semibold">Add Performance Review Template</DialogTitle>
        </DialogHeader>
         <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
            <fieldset disabled={createPerformanceReviewTemplate.isPending} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Performance Review Template Name</FormLabel>
                    <FormControl>
                      <Input 
                        data-cy="name" 
                        placeholder="e.g. Annual Performance Review, Quarterly Performance Review" 
                        className="w-full border-gray-200 focus:ring-emerald-500 focus:border-emerald-500"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-sm text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Performance Review Template Type</FormLabel>
                    <FormControl>
                      <select
                        className="w-full border border-gray-200 rounded-md p-2 text-sm focus:ring-emerald-500 focus:border-emerald-500"
                        onChange={field.onChange}
                        value={field.value}
                        data-cy="type"
                      >
                        <option value="annual">Annual</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="bi-annual">Bi-Annual</option>
                      </select>
                    </FormControl>
                    <FormMessage className="text-sm text-red-500" />
                  </FormItem>
                )}
              />
             <div>
                  <FormField
                    control={form.control}
                    name="role_level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role Level</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                           
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              <div>
                <FormLabel className="text-sm font-medium text-gray-700">Metrics</FormLabel>
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <FormField
                          control={form.control}
                          name={`metrics.${index}.column_name`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input
                                  placeholder="Metric name"
                                  className="w-full border-gray-200 focus:ring-emerald-500 focus:border-emerald-500"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage className="text-sm text-red-500" />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => remove(index)}
                          className="h-10 w-10"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <FormField
                        control={form.control}
                        name={`metrics.${index}.column_description`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input
                                placeholder="Metric description"
                                className="w-full border-gray-200 focus:ring-emerald-500 focus:border-emerald-500"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-sm text-red-500" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`metrics.${index}.column_type`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <select
                                className="w-full border border-gray-200 rounded-md p-2 text-sm focus:ring-emerald-500 focus:border-emerald-500"
                                onChange={field.onChange}
                                value={field.value}
                              >
                                <option value="">Select data type</option>
                                <option value="text">Text</option>
                                <option value="number">Number</option>
                                <option value="date">Date</option>
                                <option value="link">Link</option>
                              </select>
                            </FormControl>
                            <FormMessage className="text-sm text-red-500" />
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ column_name: "", column_description: "", column_type: undefined })}
                  className="mt-2"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Metric
                </Button>
              </div>

              <Button
                data-cy="submit"
                type="submit"
                className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2 px-4 rounded-md shadow transition-colors duration-200"
                disabled={createPerformanceReviewTemplate.isPending}
              >
                {createPerformanceReviewTemplate.isPending ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </span>
                ) : (
                  "Create Performance Review Template"
                )}
              </Button>
            </fieldset>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}