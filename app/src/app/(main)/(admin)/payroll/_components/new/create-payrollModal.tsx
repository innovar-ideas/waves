import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { trpc } from "@/app/_providers/trpc-provider";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import useActiveOrganizationStore from "@/app/server/store/active-organization.store";

interface PayrollItem {
  name: string;
  amount: number;
  required: boolean;
  description: string;
  isDeduction: boolean;
}

const CreatePayrollModal = ({
  isOpen,
  onClose,
  isSingleStaff,
  staffId,
  templateId,
}: {
  isOpen: boolean;
  onClose: () => void;
  isSingleStaff: boolean;
  staffId: string | undefined;
  templateId: string | undefined;
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [templateData, setTemplateData] = useState<PayrollItem[]>([]);
  const { organizationSlug } = useActiveOrganizationStore();
  const [previousPayroll, setPreviousPayroll] = useState<boolean>(false);
  const [previousMonthStaff, setPreviousMonthStaff] = useState<
    Array<{
      id: string;
      staffId: string;
      name: string;
      checked: boolean;
      templateId: string;
      payrollData: PayrollItem[];
    }>
  >([]);

  const { data: previousPayrolls } = trpc.getPreviousMonthPayrolls.useQuery(
    {
      organization_slug: organizationSlug,
      currentMonth: selectedMonth || new Date().toISOString(),
    },
    {
      enabled: previousPayroll && !!selectedMonth,
    }
  );

  useEffect(() => {
    if (previousPayrolls) {
      const staffList = previousPayrolls.map((payroll) => ({
        id: payroll.id,
        staffId: payroll.staff_id,        
        name: `${payroll.staff.user.first_name} ${payroll.staff.user.last_name}`,
        checked: false,
        templateId: payroll.template_id,
        payrollData: payroll.data as unknown as PayrollItem[],
      }));
      setPreviousMonthStaff(staffList);
    }
  }, [previousPayrolls]);

  const handlePreviousPayroll = () => {
    if (!previousPayroll) {
      setPreviousMonthStaff([]);
    }
  };

  const handleStaffCheckbox = (staffId: string) => {
    setPreviousMonthStaff((prev) =>
      prev.map((staff) => (staff.id === staffId ? { ...staff, checked: !staff.checked } : staff))
    );
  };

  const { data: payrollTemplates } = trpc.getAllPayrollTemplatesForOrganization.useQuery({
    organization_slug: organizationSlug,
  });

  const { data: payrollTemp } = trpc.getPayrollTemplateById.useQuery(
    {
      id: isSingleStaff ? (templateId as string) : (selectedTemplate as string),
    },
    { enabled: isSingleStaff ? !!templateId : !!selectedTemplate }
  );

  const utils = trpc.useUtils();

  useEffect(() => {
    if (isSingleStaff && templateId) {
      setSelectedTemplate(templateId);
    }
  }, [isSingleStaff, templateId]);

  useEffect(() => {
    if (payrollTemp?.data) {
      const payrollItems = payrollTemp.data as unknown as PayrollItem[];
      setTemplateData(payrollItems);
    }
  }, [payrollTemp]);

  const resetForm = () => {
    setSelectedMonth(null);
    setTemplateData([]);
    if (!isSingleStaff) {
      setSelectedTemplate(null);
    }
  };

  const createPayroll = trpc.createPayroll.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        variant: "default",
        description: "Payroll Generated.",
      });
      resetForm();
      onClose();
      utils.getAllPayrollsForOrganization.invalidate();
    },
    onError: (error) => {
      console.error("Failed to create payroll:", error);
      toast({
        title: "Error",
        description: "Failed to generate payroll",
        variant: "destructive",
      });
    },
  });

  const createSinglePayroll = trpc.createSinglePayroll.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        variant: "default",
        description: "Payroll Generated.",
      });
      resetForm();
      onClose();
      utils.getAllPayrollsForOrganization.invalidate();
      utils.getStaffWithPayrollTemplate.invalidate();
    },
    onError: (error) => {
      console.error("Failed to create payroll:", error);
      toast({
        title: "Error",
        description: "Failed to generate payroll",
        variant: "destructive",
      });
    },
  });

  const handleCreate = async () => {
    if (!selectedMonth) return;

    if (isSingleStaff) {
      const singleStaffPayrollData = {
        staffId: staffId as string,
        payrollData: templateData,
        templateId: templateId as string,
      };

      await createSinglePayroll.mutateAsync({
        month: selectedMonth,
        slug: organizationSlug,
        staffPayrollData: singleStaffPayrollData,
      });
    } else {
      if (previousPayroll && previousMonthStaff.some((staff) => staff.checked)) {
        const staffPayrollData = previousMonthStaff
          .filter((staff) => staff.checked)
          .map((staff) => ({
            staffId: staff.staffId,
            payrollData: staff.payrollData,
            templateId: staff.templateId,
          }));

        await createPayroll.mutateAsync({
          month: selectedMonth,
          slug: organizationSlug,
          staffPayrollData: staffPayrollData,
        });
      } else {
        if (payrollTemp?.staff.length === 0) {
          toast({
            title: "Error",
            description: "Payroll cannot be generated without assigned staff",
            variant: "destructive",
          });
          return;
        }

        const staffPayrollData = payrollTemp?.staff?.map((staff) => {
          return {
            staffId: staff.id,
            payrollData: templateData,
            templateId: selectedTemplate as string,
          };
        });

        await createPayroll.mutateAsync({
          month: selectedMonth,
          slug: organizationSlug,
          staffPayrollData: staffPayrollData ?? [],
        });
      }
    }
  };

  // const isSubmitDisabled = !selectedTemplate || !selectedMonth;

  const isSubmitDisabled = previousPayroll
    ? !previousMonthStaff.some((staff) => staff.checked)
    : !selectedTemplate || !selectedMonth;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          resetForm();
          onClose();
        }
      }}
    >
      <DialogContent className='max-h-screen overflow-y-scroll'>
        <DialogHeader>
          <DialogTitle>Generate Monthly Payroll</DialogTitle>
        </DialogHeader>
        <div className='space-y-4'>
          <div className='flex flex-row items-center gap-3'>
            <div className='space-y-0.5'>
              <p className='text-base'>Use Previous month Payroll for Staff?</p>
            </div>
            <Switch
              data-cy='previous-payroll'
              checked={previousPayroll}
              onCheckedChange={(active) => {
                setPreviousPayroll(active);
                handlePreviousPayroll();
              }}
              id='previous-payroll'
            />
          </div>

          {previousPayroll && previousMonthStaff.length > 0 && (
            <div className='max-h-48 space-y-2 overflow-y-auto rounded-md border p-2'>
              {previousMonthStaff.map((staff) => (
                <div key={staff.id} className='flex items-center space-x-2'>
                  <input
                    type='checkbox'
                    id={staff.id}
                    checked={staff.checked}
                    onChange={() => handleStaffCheckbox(staff.id)}
                    className='rounded border-gray-300'
                  />
                  <label htmlFor={staff.id} className='text-sm'>
                    {staff.name}
                  </label>
                </div>
              ))}
            </div>
          )}

          <div>
            <p>Month</p>
            <Input
              type='month'
              title='month'
              className='mt-2 rounded-md px-2'
              onChange={(e) => setSelectedMonth(e.target.value)}
              value={selectedMonth ?? ""}
            />
          </div>

          <div>
            <p>Template</p>
            <Select
              onValueChange={setSelectedTemplate}
              value={selectedTemplate ?? undefined}
              disabled={isSingleStaff || previousPayroll}
            >
              <SelectTrigger className='mt-2 w-full'>
                <SelectValue placeholder='Select a Template' />
              </SelectTrigger>
              <SelectContent>
                {payrollTemplates?.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            className='w-full bg-blue-500 text-center hover:bg-blue-600'
            onClick={() => handleCreate()}
            disabled={isSubmitDisabled}
          >
            Generate Payroll
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePayrollModal;
