import { trpc } from "@/app/_providers/trpc-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import useActiveOrganizationStore from "@/app/server/store/active-organization.store";
import { MultiplePayrollActionModalProps } from "@/app/server/types";

export default function MultiplePayrollActionModal({ open, setOpen, netpay, payrollData, action, setSelectedId }: MultiplePayrollActionModalProps) {
  const { toast } = useToast();
  const { organizationSlug } = useActiveOrganizationStore();
  const utils = trpc.useUtils();

  console.error("non approve payroll: ", payrollData);

  const approveMultiplePayroll = trpc.approveMultiplePayrolls.useMutation({
    onSuccess: () => {
      toast({ description: "Payrolls approved." });
      invalidateQueries();
      setSelectedId([]);
    },
  });

  const disapproveMultiplePayroll = trpc.disapproveMultiplePayrolls.useMutation({
    onSuccess: () => {
      toast({ description: "Payrolls disapproved." });
      invalidateQueries();
      setSelectedId([]);
    },
  });

  const invalidateQueries = () => {
    utils.getPayrollsByTemplateAndMonth.invalidate();
    setOpen(false);
  };

  const transformToSchema = (ids: string[], netPays: number[]) => {
    return ids.map((id, index) => ({
      id,
      netpay: netPays[index] !== undefined ? netPays[index] : undefined, // Handle optional netpay
    }));
  };

  const handleAction = async () => {

      const ids = payrollData.map(pay => pay.id);
      const sentData = transformToSchema(ids, netpay);
      const mutation = action === "approve" ? approveMultiplePayroll : disapproveMultiplePayroll;
      return mutation.mutateAsync({
        payroll: sentData,
        organization_slug: organizationSlug,
        
      });

    // await Promise.all(updates);
  };

  const getDialogTitle = () => {
    switch (action) {
      case "approve":
        return "Approve Multiple Payrolls?";
      case "disapprove":
        return "Disapprove Multiple Payrolls?";
      case "generate":
        return "Generate All Payslips?";
    }
  };

  const getDialogContent = () => {
    const isApproved = payrollData.every(pay => pay.approved);
    if (action === "approve" && isApproved) return "These payrolls are already approved.";
    if (action === "disapprove" && !isApproved) return "These payrolls are not yet approved.";
    if (action === "generate") return "Are you sure you want to generate payslips for all employees?";
    return `Are you sure you want to ${action} all payrolls?`;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
        </DialogHeader>
        <p>{getDialogContent()}</p>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            className={`w-fit border border-white outline-2 active:outline ${
              action === "disapprove" ? "bg-red-600" : "bg-blue-600"
            }`}
            data-cy={`${action}-payroll-confirm-button`}
            onClick={handleAction}
          >
            Confirmation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}