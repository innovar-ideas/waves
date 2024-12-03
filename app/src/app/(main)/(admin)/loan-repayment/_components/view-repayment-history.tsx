import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import { LoanRepayment } from "@prisma/client";

interface LoanRepaymentTableProps {
  repayments: LoanRepayment[]
}

export function LoanRepaymentTable({ repayments }: LoanRepaymentTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px]">Repayment Date</TableHead>
            <TableHead>Amount Paid</TableHead>
            <TableHead>Balance Remaining</TableHead>
            <TableHead>Payment Method</TableHead>
            <TableHead className="text-right">Remarks</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {repayments.map((repayment) => (
            <TableRow key={repayment.id}>
              <TableCell className="font-medium">
                {format(new Date(repayment.repayment_date), "PPP")}
              </TableCell>
              <TableCell>
                ${repayment.amount_paid.toFixed(2)}
              </TableCell>
              <TableCell>
                ${repayment.balance_remaining.toFixed(2)}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {repayment.payment_method}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {repayment.remarks ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{repayment.remarks}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  "-"
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

