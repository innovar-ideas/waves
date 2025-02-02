"use client";

import { trpc } from "@/app/_providers/trpc-provider";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { formatAmountToNaira } from "@/lib/helper-function";
import useActiveOrganizationStore from "@/app/server/store/active-organization.store";
import { FormValues, PayrollItem } from "@/app/server/types";
import { Payroll, StaffProfile, User } from "@prisma/client";

interface Props {
  setOpenSingleView: Dispatch<SetStateAction<boolean>>;
  setOpenView: Dispatch<SetStateAction<boolean>>;
  setModalAction: Dispatch<SetStateAction<"approve" | "disapprove" | "generate">>,
  payrolls: (Payroll & { staff: StaffProfile & { user: User } })[] | null;
  refetch: () => void
  selectedPayroll: Payroll & { staff: StaffProfile & { user: User } } | null;
  setSelectedPayroll: Dispatch<SetStateAction<Payroll & { staff: StaffProfile & { user: User } } | null>>;
  setSelectedPayrollId: Dispatch<SetStateAction<string | null>>;
  selectedPayrollId: string | null;
}

export default function ViewApprovedPayrolls({ setModalAction, setOpenSingleView, setOpenView, payrolls, refetch, selectedPayroll, setSelectedPayroll, selectedPayrollId, setSelectedPayrollId }: Props) {
  const { organizationSlug } = useActiveOrganizationStore();
  const { register, handleSubmit, watch, reset } = useForm<FormValues>();
  const [earnings, setEarnings] = useState<PayrollItem[]>([]);
  const [deductions, setDeductions] = useState<PayrollItem[]>([]);
  const [date, setDate] = useState<Date>();

  useEffect(() => {
    if (payrolls?.[0]?.data) {
      const payrollItems = payrolls[0].data as unknown as PayrollItem[];
      const earningsArray = payrollItems.filter((item) => !item.isDeduction);
      const deductionsArray = payrollItems.filter((item) => item.isDeduction);

      setEarnings(earningsArray);
      setDeductions(deductionsArray);
      setDate(new Date(payrolls[0].month));

      const defaultValues: FormValues = {};
      payrolls.forEach((payroll) => {
        const items = payroll.data as unknown as PayrollItem[];
        items.forEach((item) => {
          defaultValues[`${payroll.id}_${item.name}`] = item.amount;
        });
      });
      reset(defaultValues);
    }
  }, [payrolls, reset]);

  const calculateTotals = useCallback((payrollId: string) => {
    const grossPay = earnings.reduce((acc, item) => acc + (watch(`${payrollId}_${item.name}`) || 0), 0);
    const grossDeductions = deductions.reduce((acc, item) => acc + (watch(`${payrollId}_${item.name}`) || 0), 0);
    const netPay = grossPay - grossDeductions;
    return { grossPay, grossDeductions, netPay };
  }, [earnings, deductions, watch]);

  const updatePayroll = trpc.updatePayroll.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Payroll updated successfully.",
      });
      refetch();
    },
    onError: (error) => {
      console.error("Failed to update payroll:", error);
      toast({
        title: "Error",
        description: "Failed to update payroll",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: FormValues) => {
    const updates = payrolls?.map((payroll) => {
      const payrollItems = Object.entries(data)
        .filter(([key]) => key.startsWith(payroll.id))
        .map(([key, value]) => {
          const [, name] = key.split("_");
          const items = payroll.data as unknown as PayrollItem[];
          const item = items.find((i) => i.name === name);

          return {
            name,
            amount: value,
            required: item?.required ?? false,
            description: item?.description ?? "",
            isDeduction: item?.isDeduction ?? false,
          };
        });

      return updatePayroll.mutateAsync({
        id: payroll.id,
        slug: organizationSlug,
        data: payrollItems,
      });
    });

    if (updates) {
      await Promise.all(updates);
    }
  };

  const handleModalAction = (action: "approve" | "disapprove" | "generate") => {
    setModalAction(action);
    setOpenView(true);
  };

  const handleSingleModalAction = (action: "approve" | "disapprove" | "generate") => {
    setModalAction(action);
    setOpenSingleView(true);
  };

  const handleCheckboxChange = (id: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedPayrollId(id);
    } else {
      setSelectedPayrollId(null);
    }
  };

  useEffect(() => {
    if (selectedPayrollId) {
      const payroll = payrolls?.find((p) => p.id === selectedPayrollId);
      if (payroll) {
        setSelectedPayroll(payroll);
      } else {
        setSelectedPayroll(null);
      }
    }
  }, [selectedPayrollId, payrolls, setSelectedPayroll]);

  return (
    <>
      <div>
        <h4>{date?.toLocaleString("en-US", { month: "long", year: "numeric" })} - Payroll</h4>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-2 space-y-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">

                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Names
                  </th>
                  {earnings.map((item) => (
                    <th
                      key={item.name}
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                    >
                      {item.name}
                    </th>
                  ))}
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Gross Pay
                  </th>
                  {deductions.map((item) => (
                    <th
                      key={item.name}
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                    >
                      {item.name}
                    </th>
                  ))}
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Gross Deductions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Net Pay
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {payrolls?.map((payroll) => {
                  const { grossPay, grossDeductions, netPay } = calculateTotals(payroll.id);
                  return (
                    <tr key={payroll.id}>
                      <td className="whitespace-nowrap px-6 py-4">
                        <input onChange={(e) =>
                          handleCheckboxChange(payroll.id, e.target.checked)
                        } checked={selectedPayrollId === payroll.id} type="checkbox" name="" id="" />
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {`${payroll.staff.user.first_name} ${payroll.staff.user.last_name}`}
                      </td>
                      {earnings.map((item) => (
                        <td key={item.name} className="whitespace-nowrap px-6 py-4">
                          <Input
                            {...register(`${payroll.id}_${item.name}`, { valueAsNumber: true })}
                            type="number"
                            className="min-w-[100px]"
                            disabled={payroll.generated}
                          />
                        </td>
                      ))}
                      <td className="whitespace-nowrap px-6 py-4">{formatAmountToNaira(grossPay.toFixed(2))}</td>
                      {deductions.map((item) => (
                        <td key={item.name} className="whitespace-nowrap px-6 py-4">
                          <Input
                            {...register(`${payroll.id}_${item.name}`, { valueAsNumber: true })}
                            type="number"
                            className="min-w-[100px]"
                            disabled={payroll.generated}
                          />
                        </td>
                      ))}
                      <td className="whitespace-nowrap px-6 py-4">{formatAmountToNaira(grossDeductions.toFixed(2))}</td>
                      <td className="whitespace-nowrap px-6 py-4">{formatAmountToNaira(netPay.toFixed(2))}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={!selectedPayroll}
              className="w-fit text-sm"
              onClick={() => handleSingleModalAction(selectedPayroll?.approved ? "disapprove" : "approve")}
            >
              {selectedPayroll?.approved ? "Disapprove" : "Approve"}
            </Button>
            <Button
              type="button"
              onClick={() => handleSingleModalAction("generate")}
              disabled={!selectedPayroll?.approved}
              className="w-fit bg-blue-500 text-sm hover:bg-blue-600"
            >
              Generate Single Payslips
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-fit text-sm"
              onClick={() => handleModalAction(payrolls?.[0]?.approved ? "disapprove" : "approve")}
            >
              {payrolls?.[0]?.approved ? "Disapprove All" : "Approve All"}
            </Button>

            <Button
              type="submit"
              className="w-fit bg-blue-500 text-sm hover:bg-blue-600"
            >
              Save Changes
            </Button>

            <Button
              type="button"
              onClick={() => handleModalAction("generate")}
              disabled={!payrolls?.[0]?.approved}
              className="w-fit bg-blue-500 text-sm hover:bg-blue-600"
            >
              Generate All Payslips
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
