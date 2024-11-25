import React, { useState, useEffect, Dispatch, SetStateAction, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { formatAmountToNaira } from "@/lib/helper-function";
import { useForm } from "react-hook-form";
import { PayrollTemplateWithStaff } from "@/app/server/module/types";

interface ViewPayrollTemplateFormProps {
  payrollTemplateData: Partial<PayrollTemplateWithStaff>;
  setOpen: Dispatch<SetStateAction<boolean>>;
  open: boolean;
}

interface PayrollItem {
  name: string;
  amount: number;
  required: boolean;
  description: string;
  isDeduction: boolean;
}

interface FormValues {
  [key: string]: number;
}

export default function PayrollTemplateModal ({ payrollTemplateData, setOpen, open }: ViewPayrollTemplateFormProps) {
  const [earnings, setEarnings] = useState<PayrollItem[]>([]);
  const [deductions, setDeductions] = useState<PayrollItem[]>([]);

  console.log(payrollTemplateData, "payrollTemplateData");

  const { register, watch } = useForm<FormValues>();

   useEffect(() => {
    if (payrollTemplateData?.data) {
      const payrollItems = payrollTemplateData.data as unknown as PayrollItem[];
      const earningsArray = payrollItems.filter((item) => !item.isDeduction);
      const deductionsArray = payrollItems.filter((item) => item.isDeduction);
      setEarnings(earningsArray);
      setDeductions(deductionsArray);
    }
  }, [payrollTemplateData]);

  const calculateTotals = useCallback(() => {
    const grossPay = earnings.reduce((acc, item) => acc + (watch(item.name) || 0), 0);

    const grossDeductions = deductions.reduce((acc, item) => acc + (watch(item.name) || 0), 0);
    const netPay = grossPay - grossDeductions;

    return { grossPay, grossDeductions, netPay };
  }, [earnings, deductions, watch]);

  const { grossPay, grossDeductions, netPay } = calculateTotals();

  return (
    <Dialog open={open} onOpenChange={(value) => setOpen(value)}>
      <DialogContent className="max-w-[700px] lg:max-w-screen-lg overflow-y-scroll max-h-screen">
        <DialogHeader>
          <DialogTitle>{payrollTemplateData.name}</DialogTitle>
        </DialogHeader>
        <div>
          <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>Names</th>
                {earnings.map((item) => (
                  <th
                    key={item.name}
                    className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'
                  >
                    {item.name}
                  </th>
                ))}
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Gross Pay
                </th>
                {deductions.map((item) => (
                  <th
                    key={item.name}
                    className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'
                  >
                    {item.name}
                  </th>
                ))}
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Gross Deductions
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Net Pay
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200 bg-white'>
              <tr>
                <td className='whitespace-nowrap px-6 py-4'>
                  {`${payrollTemplateData?.staff?.map((item) => item.user?.first_name)} ${payrollTemplateData?.staff?.map((item) => item.user?.last_name)}`}
                </td>
                {earnings.map((item) => (
                  <td key={item.name} className='whitespace-nowrap px-6 py-4'>
                    <Input {...register(item.name, { valueAsNumber: true })} type='number' disabled className='w-full' />
                  </td>
                ))}
                <td className='whitespace-nowrap px-6 py-4'>{formatAmountToNaira(grossPay.toFixed(2))}</td>
                {deductions.map((item) => (
                  <td key={item.name} className='whitespace-nowrap px-6 py-4'>
                    <Input {...register(item.name, { valueAsNumber: true })} type='number' disabled className='w-full' />
                  </td>
                ))}
                <td className='whitespace-nowrap px-6 py-4'>{formatAmountToNaira(grossDeductions.toFixed(2))}</td>
                <td className='whitespace-nowrap px-6 py-4'>{formatAmountToNaira(netPay.toFixed(2))}</td>
              </tr>
            </tbody>
          </table>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}