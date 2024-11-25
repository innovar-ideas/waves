import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Form, FormLabel, FormControl, FormMessage, FormItem, FormField, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

interface LineItemFormProps {
  onAddLineItem: (item: LineItem) => void;
}

interface LineItem {
  name?: string;
  required?: boolean;
  description?: string;
  isDeduction: boolean;
}

const LineItemForm: React.FC<LineItemFormProps> = ({ onAddLineItem }) => {
  const itemForm = useForm<LineItem>({
    defaultValues: { required: false, name: "", description: "", isDeduction: false },
    mode: "onChange",
  });

  const onSubmit: SubmitHandler<LineItem> = (item) => {
    onAddLineItem(item);
    itemForm.reset();
  };

  const handleFormSubmit = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    itemForm.handleSubmit(onSubmit)(e);
  };

  const handleSwitchChange = (field: "required" | "isDeduction", value: boolean) => {
    if (value) {
      // If the current switch is being turned on, turn off the other switch
      itemForm.setValue(field, true);
      itemForm.setValue(field === "required" ? "isDeduction" : "required", false);
    } else {
      // If the current switch is being turned off, just update its value
      itemForm.setValue(field, false);
    }
  };

  return (
    <Form {...itemForm}>
      <form>
        <div className='grid grid-cols-2 gap-3'>
          <FormField
            name='name'
            control={itemForm.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder='e.g. Base fee' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name='description'
            control={itemForm.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input placeholder='Description' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className='col-span-3 mt-2 flex flex-col'>
            <div className='my-0 flex flex-row gap-2'>
              <FormField
                name='required'
                control={itemForm.control}
                render={({ field }) => (
                  <FormItem className='mt-1 flex w-[50%] flex-col space-y-3'>
                    <div className='space-y-0.5'>
                      <FormLabel className='text-base'>Earning</FormLabel>
                      <FormDescription>Is this an earning?</FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={(value) => handleSwitchChange("required", value)}
                        data-cy='fee-required'
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                name='isDeduction'
                control={itemForm.control}
                render={({ field }) => (
                  <FormItem className='mt-1 flex w-[50%] flex-col space-y-3'>
                    <div className='space-y-0.5'>
                      <FormLabel className='text-base'>Deduction</FormLabel>
                      <FormDescription>Is this a deduction?</FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={(value) => handleSwitchChange("isDeduction", value)}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>
        <div className='flex justify-end gap-2 pt-5'>
          <Button
            type='submit'
            className='bg-blue-500 hover:bg-blue-600'
            onClick={(e) => handleFormSubmit(e)}
          >
            Add Line Item
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default LineItemForm;