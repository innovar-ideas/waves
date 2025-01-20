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
import { PayrollActionModalProps } from "@/app/server/types";

export default function PayrollActionModal({ open, setOpen, payrollData, action }: PayrollActionModalProps) {
  const { toast } = useToast();
  const { organizationSlug } = useActiveOrganizationStore();
  const utils = trpc.useUtils();

  const approvePayroll = trpc.approvePayroll.useMutation({
    onSuccess: () => {
      toast({ description: "Payrolls approved." });
      invalidateQueries();
    },
  });

  const disapprovePayroll = trpc.disapprovePayroll.useMutation({
    onSuccess: () => {
      toast({ description: "Payrolls disapproved." });
      invalidateQueries();
    },
  });

  const generatePayroll = trpc.generatePayroll.useMutation({
    onSuccess: () => {
      toast({ description: "Payslips generated successfully." });
      invalidateQueries();
    },
  });

  const invalidateQueries = () => {
    utils.getPayrollsByTemplateAndMonth.invalidate();
    setOpen(false);
  };

  const handleAction = async () => {
    const isApproved = payrollData[0]?.approved;

    if (action === "approve" && isApproved) {
      toast({ description: "Payrolls already approved" });
      return;
    }
    if (action === "disapprove" && !isApproved) {
      toast({ description: "Payrolls not yet approved" });
      return;
    }

    const updates = payrollData.map((payroll) => {
      if (action === "generate") {
        return generatePayroll.mutateAsync({
          id: payroll.id,
          organization_slug: organizationSlug,
        });
      }
      const mutation = action === "approve" ? approvePayroll : disapprovePayroll;
      return mutation.mutateAsync({
        id: payroll.id,
        organization_slug: organizationSlug,
      });
    });

    await Promise.all(updates);
  };

  const getDialogTitle = () => {
    switch (action) {
      case "approve":
        return "Approve All Payrolls?";
      case "disapprove":
        return "Disapprove All Payrolls?";
      case "generate":
        return "Generate All Payslips?";
    }
  };

  const getDialogContent = () => {
    const isApproved = payrollData[0]?.approved;
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
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}