"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatAmountToNaira } from "@/lib/helper-function";
import { PayrollFormData, PayrollItem, PayrollTemplateField, StaffWithPayroll } from "@/app/server/module/types";
import PayrollTemplateModal from "./payroll-template-modal";
import { trpc } from "@/app/_providers/trpc-provider";
import { toast } from "@/components/ui/use-toast";
import useActiveOrganizationStore from "@/app/server/store/active-organization.store";

interface StaffPayrollListProps {
  staffList: StaffWithPayroll[];
  refetch: () => void;
}

interface PayrollData {
  data: PayrollTemplateField[];
}

export default function StaffPayrollList({ staffList, refetch }: StaffPayrollListProps) {
  const [selectedStaff, setSelectedStaff] = useState<StaffWithPayroll | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { organizationSlug } = useActiveOrganizationStore();

  const getLatestPayroll = (staff: StaffWithPayroll) => {
    if (!staff.payrolls.length) return null;
    return staff.payrolls.reduce((latest, current) => {
      return new Date(current.created_at) > new Date(latest.created_at) ? current : latest;
    });
  };

  const calculatePayrollTotals = useCallback((payroll: PayrollData | null) => {
    if (!payroll?.data) return { grossPay: 0, netPay: 0 };
  
    const payrollItems = payroll.data;
    
    const grossPay = payrollItems
      .filter((item: PayrollTemplateField) => !item.isDeduction)
      .reduce((sum: number, item: PayrollTemplateField) => sum + (item.amount || 0), 0);
  
    const totalDeductions = payrollItems
      .filter((item: PayrollTemplateField) => item.isDeduction)
      .reduce((sum: number, item: PayrollTemplateField) => sum + (item.amount || 0), 0);
  
    return {
      grossPay,
      netPay: grossPay - totalDeductions
    };
  }, []);

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

  const handleSubmit = async (data: PayrollFormData) => {
    if (!selectedStaff) return;

    const payrollItems = Object.entries(data)
    .filter(([key]) => key.startsWith(selectedStaff.payrolls[0].id))
    .map(([key, value]) => {
      const [, name] = key.split("_");
      const items = selectedStaff.payrolls[0].data as unknown as PayrollItem[];
      const item = items.find((i) => i.name === name);

      return {
        name,
        amount: value,
        required: item?.required ?? false,
        description: item?.description ?? "",
        isDeduction: item?.isDeduction ?? false,
      };
    });

    await updatePayroll.mutateAsync({
      id: selectedStaff.payrolls[0].id,
      data: payrollItems,
      slug: organizationSlug
    });
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Staff Name</TableHead>
            <TableHead>Gross Pay</TableHead>
            <TableHead>Net Pay</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {staffList.map((staff) => {
            const latestPayroll = getLatestPayroll(staff);
            const { grossPay, netPay } = calculatePayrollTotals(latestPayroll as unknown as PayrollData );

            return (
              <TableRow key={staff.id}>
                <TableCell>
                  {staff.user.first_name} {staff.user.last_name}
                </TableCell>
                <TableCell>{formatAmountToNaira(grossPay.toFixed(2))}</TableCell>
                <TableCell>{formatAmountToNaira(netPay.toFixed(2))}</TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedStaff(staff);
                      setIsModalOpen(true);
                    }}
                    disabled={!staff.payroll_template}
                  >
                    View Template
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {selectedStaff && (
        <PayrollTemplateModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          staff={selectedStaff}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

