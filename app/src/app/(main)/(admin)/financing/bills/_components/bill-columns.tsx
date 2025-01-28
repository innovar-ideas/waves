"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { formatAmountToNaira } from "@/lib/helper-function";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, MoreHorizontal, Receipt } from "lucide-react";
import { AccountItem, Bill, BillStatus } from "@prisma/client";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PaymentDialog } from "../../_components/payment-dialog";


export const billColumns: ColumnDef<Bill & { account_items: AccountItem[] }>[] = [
  {
    id: "expand",
    cell: ({ row }) => {
      const bill = row.original;
      return bill.account_items.length > 0 ? (
        <Button
          variant="ghost"
          onClick={() => row.toggleExpanded()}
          className="p-0 hover:bg-transparent"
        >
          {row.getIsExpanded() ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      ) : null;
    },
  },
  {
    accessorKey: "vendor_name",
    header: "Vendor",
  },
  {
    accessorKey: "total_amount",
    header: "Amount",
    cell: ({ row }) => formatAmountToNaira(row.original.amount),
  },
  {
    accessorKey: "due_date",
    header: "Due Date",
    cell: ({ row }) => new Date(row.original.due_date).toLocaleDateString(),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const { status } = row.original;
      const colorMap: Record<BillStatus, string> = {
        DRAFT: "bg-gray-200 text-gray-800",
        PENDING: "bg-yellow-200 text-yellow-800",
        PARTIALLY_PAID: "bg-yellow-200 text-yellow-800",
        PAID: "bg-green-200 text-green-800",
        OVERDUE: "bg-red-200 text-red-800",
        VOID: "bg-red-200 text-red-800",
        RECEIVED: "bg-blue-200 text-blue-800"
      };

      return (
        <Badge className={colorMap[status]}>
          {(status.charAt(0) + status.slice(1).toLowerCase())}
        </Badge>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
  },
  {
    accessorKey: "actions",
    header: "Actions",
     cell: ({ row }) => {
      const bill = row.original;
      const canPay = bill.status !== "PAID" && bill.status !== "VOID";
      
      return (
        <div className="flex gap-2">

               <DropdownMenu modal={false}>
                 <DropdownMenuTrigger asChild>
                   <Button variant="ghost" size="icon">
                     <MoreHorizontal className="h-4 w-4" />
                   </Button>
                 </DropdownMenuTrigger>
                 <DropdownMenuContent>
                   {canPay && (
                     <DropdownMenuItem asChild>
                       <PaymentDialog
                         sourceType="bill"
                         sourceId={bill.id}
                         amount={bill.amount}
                         trigger={
                           <Button variant="ghost" size="sm" className="w-full justify-start">
                             <Receipt className="h-4 w-4 mr-2" />
                             Record Payment
                           </Button>
                         }
                       />
                     </DropdownMenuItem>
                   )}
                 </DropdownMenuContent>
               </DropdownMenu>
        </div>
      );
    }
  },
];

export const renderSubComponent = ({ 
  row 
}: { 
  row: { original: Bill & { account_items: AccountItem[] } } 
}) => {
  const bill = row.original;
  return (
    <div className="px-8 py-2">
      <div className="rounded-lg bg-slate-50 p-4">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left">Description</th>
              <th className="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {bill.account_items.map((item: AccountItem) => (
              <tr key={item.id}>
                <td className="text-left">{item.description}</td>
                <td className="text-right">{formatAmountToNaira(item.amount)}</td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}; 