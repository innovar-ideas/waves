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
import { PayrollTemplateWithStaff } from "@/app/server/types";

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
      <DialogContent className="max-w-[700px] lg:max-w-screen-lg overflow-y-scroll max-h-screen bg-white rounded-lg shadow-xl">
        <DialogHeader className="bg-green-600 text-white p-4 rounded-t-lg">
          <DialogTitle className="text-xl font-semibold">{payrollTemplateData.name}</DialogTitle>
        </DialogHeader>
        <div className="p-6">
          <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200 border border-green-100 rounded-lg'>
            <thead className='bg-green-50'>
              <tr>
                <th className='px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-green-700'>Names</th>
                {earnings.map((item) => (
                  <th
                    key={item.name}
                    className='px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-green-700'
                  >
                    {item.name}
                  </th>
                ))}
                <th className='px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-green-700'>
                  Gross Pay
                </th>
                {deductions.map((item) => (
                  <th
                    key={item.name}
                    className='px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-green-700'
                  >
                    {item.name}
                  </th>
                ))}
                <th className='px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-green-700'>
                  Gross Deductions
                </th>
                <th className='px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-green-700'>
                  Net Pay
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200 bg-white'>
              <tr className="hover:bg-green-50 transition-colors duration-200">
                <td className='whitespace-nowrap px-6 py-4 text-gray-700 font-medium'>
                  {`${payrollTemplateData?.staff?.map((item) => item.user?.first_name)} ${payrollTemplateData?.staff?.map((item) => item.user?.last_name)}`}
                </td>
                {earnings.map((item) => (
                  <td key={item.name} className='whitespace-nowrap px-6 py-4'>
                    <Input 
                      {...register(item.name, { valueAsNumber: true })} 
                      type='number' 
                      disabled 
                      className='w-full border-green-200 focus:border-green-500 focus:ring-green-500 rounded-md' 
                    />
                  </td>
                ))}
                <td className='whitespace-nowrap px-6 py-4 text-green-600 font-semibold'>{formatAmountToNaira(grossPay.toFixed(2))}</td>
                {deductions.map((item) => (
                  <td key={item.name} className='whitespace-nowrap px-6 py-4'>
                    <Input 
                      {...register(item.name, { valueAsNumber: true })} 
                      type='number' 
                      disabled 
                      className='w-full border-green-200 focus:border-green-500 focus:ring-green-500 rounded-md' 
                    />
                  </td>
                ))}
                <td className='whitespace-nowrap px-6 py-4 text-red-600 font-semibold'>{formatAmountToNaira(grossDeductions.toFixed(2))}</td>
                <td className='whitespace-nowrap px-6 py-4 text-green-600 font-bold'>{formatAmountToNaira(netPay.toFixed(2))}</td>
              </tr>
            </tbody>
          </table>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}