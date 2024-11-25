import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PayrollTemplate } from "@prisma/client";
import React, { Dispatch, SetStateAction } from "react";
import PayrollTemplateForm from "./payroll-template-form";

interface IEditPayrollProps {
  payrollTemplate?: Partial<PayrollTemplate>;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  onSuccess: () => void;
}

const EditPayrollTemplateModal: React.FC<IEditPayrollProps> = ({ payrollTemplate, open, setOpen, onSuccess }) => {
  console.log(payrollTemplate);

  return (
    <Dialog open={open} onOpenChange={(value) => setOpen(value)}>
      <DialogContent className={"max-h-screen overflow-y-scroll lg:max-w-screen-lg"}>
        <PayrollTemplateForm payrollTemplate={payrollTemplate} onSuccess={onSuccess} />
      </DialogContent>
    </Dialog>
  );
};

export default EditPayrollTemplateModal;
