"use client";

import { trpc } from "@/app/_providers/trpc-provider";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCallback, useEffect, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { formatAmountToNaira } from "@/lib/helper-function";
import useActiveOrganizationStore from "@/app/server/store/active-organization.store";
import { FormValues, PayrollItem } from "@/app/server/types";
import { Bank, Payroll, StaffProfile, User } from "@prisma/client";
import PayrollActionModal from "../../../../_components/payroll-action-modal";
import SinglePayrollActionModal from "../../../../_components/single-payroll-action";
import ModernPayslip from "./view-payslip";
import ExportPaymentVoucher from "./export-payment-voucher";
import MultiplePayrollActionModal from "../../../../_components/multiple-payroll-action";
import DeductionsModal from "./deduction-modal";

interface Props {
  payrolls: (Payroll & { staff: StaffProfile & { user: User, bank: Bank | null }; approved_by: User | null })[] | null;
  refetch: () => void
}

export default function ViewApprovedPayrolls({ payrolls, refetch }: Props) {
  const { organizationSlug } = useActiveOrganizationStore();
  const { register, handleSubmit, watch, reset } = useForm<FormValues>();
  const [earnings, setEarnings] = useState<PayrollItem[]>([]);
  const [deductions, setDeductions] = useState<PayrollItem[]>([]);
  const [date, setDate] = useState<Date>();
  const [currentNetPay, setCurrentNetpay] = useState(0);
  const [currentNetPays, setCurrentNetpays] = useState<number[]>([]);
  const [openView, setOpenView] = useState(false);
  const [openSingleView, setOpenSingleView] = useState(false);
  const [openMultipleApprovalView, setOpenMultipleApprovalView] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState<(Payroll & { staff: StaffProfile & { user: User } })[]>([]);

  const [selectedPayrollId, setSelectedPayrollId] = useState<string[]>([]);
  const [modalAction, setModalAction] = useState<"approve" | "disapprove" | "generate">("approve");
  const [openDeductions, setOpenDeductions] = useState(false);
  const [selectedStaffDeductions, setSelectedStaffDeductions] = useState<{ name: string, deductions: PayrollItem[] } | null>(null);

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

  useEffect(() => {
    // Example: Calculate totals for a specific payrollId
    const payrollId = payrolls ? payrolls[0].id : "";
    const { netPay } = calculateTotals(payrollId);
  
    setCurrentNetpay(netPay);
  }, [calculateTotals, payrolls]);

  const calculateTotalsForPayrolls = useCallback(
    (payrollIds: string[]) => {
      return payrollIds.map((payrollId) => {
        const grossPay = earnings.reduce((acc, item) => acc + (watch(`${payrollId}_${item.name}`) || 0), 0);
        const grossDeductions = deductions.reduce((acc, item) => acc + (watch(`${payrollId}_${item.name}`) || 0), 0);
        const netPay = grossPay - grossDeductions;
        return { payrollId, grossPay, grossDeductions, netPay };
      });
    },
    [earnings, deductions, watch]
  );
  
  useEffect(() => {
    if (payrolls) {
      const payrollIds = payrolls.map((payroll) => payroll.id);
      const totals = calculateTotalsForPayrolls(payrollIds);
      const allNetPays = totals.map(pay => pay.netPay);
      setCurrentNetpays(allNetPays); // Update state with the array of netPay results
    }
  }, [calculateTotalsForPayrolls, payrolls]);

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
            // net_pay: currentNetPay
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

  const handleMultiModalAction = (action: "approve" | "disapprove" ) => {
    setModalAction(action);
    setOpenMultipleApprovalView(true);
  };

  const handleCheckboxChange = (id: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedPayrollId(prev => [...prev, id]);
    } else {
      setSelectedPayrollId(prev => prev.filter(payrollId => payrollId !== id));
    }
  };

  useEffect(() => {
    if (selectedPayrollId.length > 0) {
      const selectedPayrolls = payrolls?.filter((p) => selectedPayrollId.includes(p.id)) || [];
      setSelectedPayroll(selectedPayrolls);
    } else {
      setSelectedPayroll([]);
    }
  }, [selectedPayrollId, payrolls]);

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
                  {payrolls && payrolls[0]?.approved && <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Approved by
                  </th>}
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Net Pay
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {(payrolls && payrolls?.length === 0) ? (<p>No Payrolls</p>) : payrolls?.map((payroll) => {
                  const { grossPay, grossDeductions, netPay } = calculateTotals(payroll.id);
                  return (
                    <tr key={payroll.id}>
                      <td className="whitespace-nowrap px-6 py-4">
                        <input onChange={(e) =>
                          handleCheckboxChange(payroll.id, e.target.checked)
                        } checked={selectedPayrollId.includes(payroll.id)} type="checkbox" name="" id="" />
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
                            disabled={payroll.approved}
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
                            disabled={payroll.approved}
                          />
                        </td>
                      ))}
                      <td className="whitespace-nowrap px-6 py-4">{formatAmountToNaira(grossDeductions.toFixed(2))}</td>
                      {payrolls && payrolls[0]?.approved && <td className="whitespace-nowrap px-6 py-4">
                        {payroll.approved_by?.first_name} {payroll.approved_by?.last_name}
                      </td>}
                      <td className="whitespace-nowrap px-6 py-4">{formatAmountToNaira(netPay.toFixed(2))}</td>

                      <td className="whitespace-nowrap px-6 py-4">
                        <Button
                        className="bg-emerald-600 text-white"
                          onClick={() => {
                            const staffDeductions = (payroll.data as unknown as PayrollItem[]).filter(item => item.isDeduction);
                            setSelectedStaffDeductions({
                              name: `${payroll.staff.user.first_name} ${payroll.staff.user.last_name}`,
                              deductions: staffDeductions
                            });
                            setOpenDeductions(true);
                          }}
                        >
                          View Deductions
                        </Button>
                      </td>

                      {payrolls?.every(pay => pay.approved) && <td className="whitespace-nowrap px-6 py-4"><ModernPayslip payroll={payroll} /></td>}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-5 flex justify-end gap-2">
          <ExportPaymentVoucher data={payrolls} />

            <Button
              type="button"
              variant="outline"
              disabled={selectedPayroll.length === 0 || selectedPayroll.length > 1}
              className="w-fit text-sm"
              onClick={() => handleSingleModalAction(selectedPayroll[0]?.approved ? "disapprove" : "approve")}
            >
              {selectedPayroll[0]?.approved ? "Disapprove" : "Approve"}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              className="w-fit text-sm"
              disabled={!payrolls || selectedPayroll.length <= 1}
              onClick={() => handleMultiModalAction(payrolls?.every(pay => pay.approved) ? "disapprove" : "approve")}
            >
              {payrolls?.every(pay => pay.approved) ? "Disapprove All" : "Approve All"}
            </Button>

            <Button
              type="submit"
              className="w-fit bg-blue-500 text-sm hover:bg-blue-600"
            >
              Save Changes
            </Button>
            <Button
              type="button"
              onClick={() => handleSingleModalAction("generate")}
              disabled={selectedPayroll.length === 0 || !selectedPayroll.every(p => p.approved)}
              className="w-fit bg-blue-500 text-sm hover:bg-blue-600"
            >
              Generate Single Payslips
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
        {openView && payrolls && (
          <PayrollActionModal
            open={openView}
            setOpen={setOpenView}
            payrollData={payrolls}
            action={modalAction}
          />
        )}

        {openSingleView && selectedPayroll && (
          <SinglePayrollActionModal
            open={openSingleView}
            setSelectedId={setSelectedPayrollId}
            setOpen={setOpenSingleView}
            payrollData={selectedPayroll[0]}
            netpay={currentNetPay}
            action={modalAction}
          />
        )}

         {openMultipleApprovalView && selectedPayroll && (
          <MultiplePayrollActionModal
            open={openMultipleApprovalView}
            setSelectedId={setSelectedPayrollId}
            setOpen={setOpenMultipleApprovalView}
            payrollData={selectedPayroll}
            netpay={currentNetPays}
            action={modalAction}
          />
        )}

        {selectedStaffDeductions && (
        <DeductionsModal
          open={openDeductions}
          setOpen={setOpenDeductions}
          staffName={selectedStaffDeductions.name}
          deductions={selectedStaffDeductions.deductions}
          month={date?.toLocaleString("en-US", { month: "long", year: "numeric" }) || ""}
          date={new Date().toLocaleDateString()}
        />
      )}
      </div>
    </>
  );
}
