"use client";

import { trpc } from "@/app/_providers/trpc-provider";
import React, { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { ColumnDef } from "@tanstack/react-table";
import IndeterminateCheckbox from "@/components/class/check-box";
import { Plus } from "lucide-react";
import useActiveOrganizationStore from "@/app/server/store/active-organization.store";
import { GroupedPayrollResponse, PayrollTemplateWithStaff, StaffWithPayrollTemplate } from "@/app/server/module/types";
import { assignPayrollTemplateSchema, AssignPayrollTemplateSchema } from "@/app/server/dtos";
import assignPayrollColumns from "./assign-staff-column";
import CreatePayrollModal from "./new/create-payrollModal";
import { viewPayrollColumns } from "./owner-payroll-column";
import PayrollTemplateForm from "./new/payroll-template-form";
import { DataTable } from "@/components/table/data-table";
import { ViewPayrollDataTable } from "./viewpayroll-data-table";
import { viewPayrollTempColumns } from "./viewpayroll-columns";
import Link from "next/link";

export default function OwnerPage() {
  const { toast } = useToast();
  const [viewPayroll, setViewPayroll] = useState(true);
  const [assignPayroll, setAssignPayroll] = useState(false);
  const [viewGeneratedPayroll, setViewGeneratedPayroll] = useState(false);
  const [createPayroll, setCreatePayroll] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedRows, setSelectedRows] = React.useState<StaffWithPayrollTemplate[]>([]);
  const { organizationSlug } = useActiveOrganizationStore();
  const { data: payrollTemplates, isLoading: isPayrollTemplateLoading } =
    trpc.getAllPayrollTemplatesForOrganization.useQuery({
      organization_slug: organizationSlug,
    });

  const { data: payrollGrouped, isLoading: isPayrollGroupedLoading } = trpc.getAllPayrollsGroupedByMonth.useQuery({
    organization_slug: organizationSlug,
  });

  const { data: staff, isLoading } = trpc.getStaffWithPayrollTemplate.useQuery({ slug: organizationSlug });
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const form = useForm<AssignPayrollTemplateSchema>({
    resolver: zodResolver(assignPayrollTemplateSchema),
    mode: "onChange",
  });

  const staffIds = selectedRows?.map((item) => item.id);
  const isTemplateId = form.watch("templateId");

  const handleCreate = () => {
    setCreatePayroll((prevState) => !prevState);
  };

  const utils = trpc.useUtils();

  const assignPayrollTemplate = trpc.assignStaffToPayrollTemplate.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        variant: "default",
        description: "Staff assigned to payroll template successfully.",
      });
      form.reset();
      utils.getStaffWithPayrollTemplate.invalidate();
    },
    onError: (error) => {
      console.error("Failed to assign staff:", error);

      toast({
        title: "Error",
        description: "Failed to assign staff",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: AssignPayrollTemplateSchema) => {
    const finalValues = {
      ...values,
      staffIds: staffIds,
    };
    
    assignPayrollTemplate.mutate(finalValues);
  };

  const modifiedAssignPAyrollColumns = React.useMemo<ColumnDef<StaffWithPayrollTemplate>[]>(() => {
    return assignPayrollColumns.map((column) => {
      if (column.id === "select") {
        return {
          ...column,
          cell: ({ row }) => {
            const isPayrollTemplateExist =
              selectedTemplateId !== null &&
              row.original?.payroll_template?.id === selectedTemplateId;

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

  React.useEffect(() => {
    if (selectedTemplateId && staff) {
      const initialSelectedRows = staff?.filter((staffMember) =>
        staffMember?.payroll_template?.id === selectedTemplateId
      );

      setSelectedRows(initialSelectedRows);
    }
  }, [selectedTemplateId, staff]);

  const handleTemplateSelection = (value: string) => {
    setSelectedTemplateId(value);
    setSelectedRows([]);
  };

  return (
    <div className='min-h-screen bg-primaryTheme-50'>
      <div className={`flex flex-wrap items-center gap-4 ${viewGeneratedPayroll ? "justify-between" : "justify-end"}`}>
        {viewGeneratedPayroll && (
          <div className='flex justify-start font-semibold'>
            <h4>Generated Payroll</h4>
          </div>
        )}
        <div className='flex flex-wrap items-center gap-4 md:justify-end'>
          <Button
            onClick={() => {
              setAssignPayroll(false);

              setViewGeneratedPayroll(false);
              setViewPayroll(true);
            }}
            className={`w-fit ${viewPayroll ? "" : "bg-blue-500 hover:bg-blue-600"}`}
            variant={viewPayroll ? "outline" : "default"}
          >
            View Payroll Template
          </Button>

          <Link href={"/payroll/staff"}>
            <Button
              className={`w-fit ${"bg-blue-500 hover:bg-blue-600"}`}
            >
              Staff Payroll Review
            </Button>
          </Link>

          <Button
            onClick={() => {
              setIsModalOpen(true);
            }}
            className='w-fit bg-blue-500 hover:bg-blue-600'
            data-cy='generate-template'
          >
            Generate
          </Button>
          <CreatePayrollModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} isSingleStaff={false} staffId={undefined} templateId={undefined} />

          <Button
            onClick={() => {
              setViewGeneratedPayroll(false);
              setViewPayroll(false);
              setAssignPayroll(true);
            }}
            className={`w-fit ${assignPayroll ? "" : "bg-blue-500 hover:bg-blue-600"}`}
            data-cy='assign-to-class'
            variant={assignPayroll ? "outline" : "default"}
          >
            Assign to Staff
          </Button>

          <Button
            className={`w-fit ${viewGeneratedPayroll ? "" : "bg-blue-500 hover:bg-blue-600"}`}
            data-cy='assign-fee-to-student'
            onClick={() => {
              setViewPayroll(false);
              setAssignPayroll(false);
              setViewGeneratedPayroll(true);
            }}
            variant={viewGeneratedPayroll ? "outline" : "default"}
          >
            View Generated Payroll
          </Button>
        </div>
      </div>

      <div className='mt-16'>
        {viewGeneratedPayroll ? (
          <div>
            <DataTable
              data={(payrollGrouped as unknown as GroupedPayrollResponse[]) ?? []}
              columns={viewPayrollColumns}
              isLoading={isPayrollGroupedLoading}
            />
          </div>
        ) : (
          <>
            {viewPayroll && !createPayroll && (
              <div>
                <ViewPayrollDataTable
                  data={(payrollTemplates as PayrollTemplateWithStaff[]) ?? []}
                  columns={viewPayrollTempColumns}
                  isLoading={isPayrollTemplateLoading}
                />
                <div className='m-t-3 flex w-full items-center justify-end'>
                  <Button
                    data-cy='create-bill-template'
                    onClick={handleCreate}
                    className='w-fit rounded-lg bg-blue-500 text-center text-white hover:bg-blue-600'
                  >
                    <Plus className='mr-2' />
                    <span>Create New Payroll Template</span>
                  </Button>
                </div>
              </div>
            )}
            {viewPayroll && createPayroll && (
              <div>
                <PayrollTemplateForm handleCreate={handleCreate} />
              </div>
            )}
            {assignPayroll && (
              <div>
                <h4 className="mb-3 font-semibold">Assign Payroll Template to Staff</h4>
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
                          Update
                        </Button>
                      </div>
                    </fieldset>
                  </form>
                </Form>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
