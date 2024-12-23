import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { DataTable } from "@/components/table/data-table";
import { assignPayrollTemplateSchema, AssignPayrollTemplateSchema } from "@/app/server/dtos";
import { trpc } from "@/app/_providers/trpc-provider";
import useActiveOrganizationStore from "@/app/server/store/active-organization.store";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { StaffWithContractTemplate, StaffWithPayrollTemplate } from "@/app/server/module/types";
import assignContractColumns from "./assign-staff-column";
import IndeterminateCheckbox from "@/components/class/check-box";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

export default function AssignContractTemplateToStaff() {
  const { organizationSlug } = useActiveOrganizationStore();
  const form = useForm<AssignPayrollTemplateSchema>({
    resolver: zodResolver(assignPayrollTemplateSchema),
    mode: "onChange",
  });
  const { data: staff, isLoading } = trpc.getStaffWithContractTemplate.useQuery({ slug: organizationSlug });
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = React.useState<StaffWithContractTemplate[]>([]);
  const utils = trpc.useUtils();
  const { data: payrollTemplates } =
    trpc.getAllContractTemplatesForOrganization.useQuery({
      organization_slug: organizationSlug,
    });
const admin_id = useSession().data?.user?.id;

  const staffIds = selectedRows?.map((item) => item.id);
  const isTemplateId = form.watch("templateId");

  const modifiedAssignPAyrollColumns = React.useMemo<ColumnDef<StaffWithContractTemplate>[]>(() => {
    return assignContractColumns.map((column) => {
      if (column.id === "select") {
        return {
          ...column,
          cell: ({ row }) => {
            const isPayrollTemplateExist =
              selectedTemplateId !== null &&
              row.original?.contracts[0]?.template_id === selectedTemplateId;

            const isSelected = selectedRows.some((selectedRow) => selectedRow.id === row.original.id);

            return (
              <IndeterminateCheckbox
                {...{
                  checked: isPayrollTemplateExist || isSelected,
                  disabled: isPayrollTemplateExist,
                  indeterminate: row.getIsSomeSelected(),
                  onChange: (e) => {
                    const isChecked = e.target.checked;

                    setSelectedRows((prev) => {
                      if (isChecked) {
                        return [...prev, row.original];
                      } else {
                        return prev.filter((selectedRow) => selectedRow.id !== row.original.id);
                      }
                    });
                  },
                }}
              />
            );
          },
        };
      }

      return column;
    });
  }, [selectedRows, selectedTemplateId]);

  const assignPayrollTemplate = trpc.assignStaffToContractTemplate.useMutation({
    onSuccess: () => {
      toast.success(" Contract created successfully");

      form.reset();
      utils.getStaffWithPayrollTemplate.invalidate();
    },
    onError: (error) => {
      console.error("Failed to assign staff:", error);

      toast.success(" Error creating contract");
    },
  });


  const onSubmit = (values: AssignPayrollTemplateSchema) => {
    const finalValues = {
      ...values,
      staffIds: staffIds,
      organization_id: organizationSlug,
      sender_id: admin_id as unknown as string
    };

    assignPayrollTemplate.mutate(finalValues);
  };

  const handleTemplateSelection = (value: string) => {
    setSelectedTemplateId(value);
    setSelectedRows([]);
  };

  return (
    <div>
      <div>
        <h4 className="mb-3 font-semibold">Assign Contract Template to Staff</h4>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, (error) => console.error(error))}>
            <fieldset>
              <DataTable
                data={staff ?? []}
                columns={modifiedAssignPAyrollColumns as StaffWithPayrollTemplate[]}
                isLoading={isLoading}
                onSelectionChange={setSelectedRows}
                action={
                  <div className='w-44'>
                    <FormField
                      control={form.control}
                      name='templateId'
                      render={({ field }) => (
                        <FormItem>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              handleTemplateSelection(value);
                            }}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger data-cy='template-select'>
                                <SelectValue placeholder='Select Template' />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent data-cy='dropdown-item-selector'>
                              {payrollTemplates?.map((item) => (
                                <SelectItem role='option' key={item.id} value={item.id}>
                                  {item.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                }
              />
              <div className='flex w-full items-center justify-end'>
                <Button
                  data-cy='submit'
                  type='submit'
                  className='w-fit rounded-lg bg-blue-500 px-8 py-3 text-center text-white hover:bg-blue-600'
                  disabled={form.formState.isSubmitting || !isTemplateId || staffIds.length === 0}
                  onClick={form.handleSubmit(onSubmit, (error) => console.error(error))}
                >
                  Assign
                </Button>
              </div>
            </fieldset>
          </form>
        </Form>
      </div>
    </div>
  );
}