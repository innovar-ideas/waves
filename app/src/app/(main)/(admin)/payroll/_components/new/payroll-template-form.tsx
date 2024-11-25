"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createPayrollTemplateSchema, TCreatePayrollTemplateSchema } from "@/lib/dtos";
import { zodResolver } from "@hookform/resolvers/zod";
import { getActiveOrganizationSlugFromLocalStorage } from "@/lib/helper-function";
import { trpc } from "@/app/_providers/trpc-provider";
import { useToast } from "@/components/ui/use-toast";
import { PayrollTemplate } from "@prisma/client";
import LineItemForm from "./line-item-form";
import LineItemsTable from "./line-items";

interface LineItem {
  name?: string;
  required?: boolean;
  description?: string;
  isDeduction: boolean;
}

interface PayrollTemplateFormProps {
  payrollTemplate?: Partial<PayrollTemplate>;
  onSuccess?: () => void;
  handleCreate?: () => void;
}

const PayrollTemplateForm: React.FC<PayrollTemplateFormProps> = ({ payrollTemplate, onSuccess, handleCreate }) => {
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const organization_slug = getActiveOrganizationSlugFromLocalStorage();
  const { toast } = useToast();
  const utils = trpc.useUtils();

  const defaultValues: Partial<TCreatePayrollTemplateSchema> = {
    name: payrollTemplate?.name || "",
    organization_id: organization_slug || "",
    data: payrollTemplate?.data || [],
  };

  const form = useForm<TCreatePayrollTemplateSchema>({
    resolver: zodResolver(createPayrollTemplateSchema),
    defaultValues,
    mode: "onChange",
  });

  useEffect(() => {
    if (payrollTemplate?.data) {
      setLineItems(payrollTemplate?.data as unknown as LineItem[]);
    }
  }, [payrollTemplate?.data]);

  const mutation = payrollTemplate
    ? trpc.updatePayrollTemplate.useMutation()
    : trpc.createPayrollTemplate.useMutation();

  const onSubmit = async (data: TCreatePayrollTemplateSchema) => {
    // New validation for template name
    if (!data.name) {
      toast({
        title: "Error",
        description: "Template name is required",
        variant: "destructive",
      });
      console.log("error: template name required");

      return; // Prevent submission if name is empty
    }

    // New validation for line items
    if (lineItems.length < 1) {
      toast({
        title: "Error",
        description: "At least one line item is required",
        variant: "destructive",
      });
      console.log("error: On lineitem required");

      return; // Prevent submission if no line items
    }

    try {
      const finalValues = {
        ...data,
        data: lineItems,
      };

      if (payrollTemplate) {
        await mutation.mutateAsync({
          ...finalValues,
          id: payrollTemplate.id as string,
        });
      } else {
        await mutation.mutateAsync(finalValues);
      }

      toast({
        title: "Success",
        description: `Payroll template ${payrollTemplate ? "updated" : "created"} successfully`,
      });

      utils.getAllPayrollTemplatesForOrganization.invalidate();

      if (onSuccess) {
        onSuccess();
        form.reset();

        return;
      }

      if (handleCreate) {
        handleCreate();
      }
    } catch (error) {
      console.log(" error:", error);

      toast({
        title: "Error",
        description: "An error occurred",
        variant: "destructive",
      });
    }
  };

  const handleAddLineItem = (item: LineItem) => {
    setLineItems((prevItems) => [...prevItems, { ...item, amount: 0.0 }]);
  };

  const handleRemoveLineItem = (index: number) => {
    setLineItems((prevItems) => prevItems.filter((_, i) => i !== index));
  };

  return (
    <>
      <div>
        <h2 className='text-md font-bold md:text-lg'>
          {payrollTemplate ? "Edit Payroll Template" : "Create Payroll Template"}
        </h2>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <fieldset>
            <div className='grid grid-cols-2 gap-3'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem className='col-span-2 grid space-y-3'>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input data-cy='payroll-name-field' placeholder='e.g. Template Name' id='name' {...field} />
                    </FormControl>
                    <FormMessage className='text-xs font-normal' />
                  </FormItem>
                )}
              />
            </div>
            <div className='mt-5'>
              <h5 className='font-bold'>Add Line Item</h5>
              <LineItemForm onAddLineItem={handleAddLineItem} />
            </div>

            <div className='mt-5'>
              <h5 className='mb-2 font-bold'>Earnings</h5>
              <LineItemsTable items={lineItems.filter((item) => !item.isDeduction)} removeItem={handleRemoveLineItem} />
            </div>

            <div className='mt-5'>
              <h5 className='mb-2 font-bold'>Deductions</h5>
              <LineItemsTable items={lineItems.filter((item) => item.isDeduction)} removeItem={handleRemoveLineItem} />
            </div>

            <div className='flex justify-between gap-2 pt-5'>
              <Button
                data-cy='close-template-button'
                disabled={form.formState.isSubmitting}
                className='border border-white bg-blue-600 px-5 outline-2 hover:bg-blue-600 active:outline'
                type='button'
                onClick={() => handleCreate?.()}
              >
                Close
              </Button>

              <Button
                type='submit'
                data-cy='submit-button'
                key='submit-button'
                disabled={form.formState.isSubmitting}
                className='border-bg-primaryTheme w-fit border bg-blue-500 outline-2 hover:bg-blue-600 active:outline'
              >
                {payrollTemplate && !form.formState.isSubmitting
                  ? "Update Payroll Template"
                  : "Create Payroll Template"}
                {form.formState.isSubmitting && "Saving..."}
              </Button>
            </div>
          </fieldset>
        </form>
      </Form>
    </>
  );
};

export default PayrollTemplateForm;
