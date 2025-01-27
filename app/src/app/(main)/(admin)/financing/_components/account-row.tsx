"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, MoreHorizontal, Pencil, ChevronDown, ChevronRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Account, AccountItem, AccountTypeEnum } from "@prisma/client";
import { useState } from "react";
import { trpc } from "@/app/_providers/trpc-provider";
import { AccountStatementDialog } from "./account-statement-dialogue";
import { AccountFormDialog } from "./account-form-dialog";
import { PaymentDialog } from "./payment-dialog";



export type RecursiveAccount = Account & {
  account_items: AccountItem[];
  sub_accounts: RecursiveAccount[];
};

 interface AccountRowProps {
  account: RecursiveAccount;
  level: number;
  sessions: Array<{
    id: string;
    name: string;
    parent_session: { id: string; name: string; } | null;
  }>;
}

export function 
AccountRow({ account, level, sessions }: AccountRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showItems, setShowItems] = useState(false);
  const utils = trpc.useUtils();


  return (
    <>
      <TableRow 
        className="cursor-pointer hover:bg-slate-50"
      >
        <TableCell>
          <div className="flex items-center" style={{ paddingLeft: `${level * 20}px` }}>
            <div className="flex items-center gap-2">
            {account.sub_accounts.length > 0 && (
              <button onClick={() => setIsExpanded(!isExpanded)}>
                {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                ) : (
                    <ChevronRight className="h-4 w-4" />
                )}
              </button>
            )}
              <div className="flex items-center gap-2" onClick={() => setShowItems(!showItems)}>
                {showItems ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                <span>{account.account_name}</span>
              </div>
            </div>
          </div>
        </TableCell>
        <TableCell>{"₦" + account.total_amount.toFixed(2)}</TableCell>
        <TableCell>
          {account.account_items[0]
            ? new Date(account.account_items[0].date).toLocaleDateString()
            : "No transactions"}
        </TableCell>
        <TableCell>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
             <AccountFormDialog
                accountType={account.account_type_enum ?? AccountTypeEnum.INCOME}
                editData={account as unknown as Account & {account_items?: AccountItem[]}}
                trigger={
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit Account
                  </DropdownMenuItem>
                }
              />
              <AccountFormDialog
                accountType={account.account_type_enum ?? AccountTypeEnum.INCOME}
                parentId={account.id}
                trigger={
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Sub Account
                  </DropdownMenuItem>
                }
              />
              <AccountStatementDialog
                accountId={account.id}
                accountName={account.account_name}
                sessions={sessions}
              />

                <PaymentDialog
                  sourceType="account"
                  sourceId={account.id}
                  trigger={
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      Log Payment
                    </DropdownMenuItem>
                  }
                  onSuccess={() => {
                    utils.getAllIncomeAccounts.invalidate();
                    utils.getAllExpensesAccounts.invalidate();
                    
                  }}
                />
        
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

      {/* Show Account Items */}
      {showItems && account.account_items.length > 0 && (
        <TableRow>
          <TableCell colSpan={4}>
            <div className="bg-slate-50 p-4 rounded-md" style={{ marginLeft: `${level * 20 + 20}px` }}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Paid By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {account.account_items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{"₦" + item.amount.toFixed(2)}</TableCell>
                      <TableCell>{item.paid_in_by || "N/A"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TableCell>
        </TableRow>
      )}

      {/* Show Sub Accounts */}
      {isExpanded &&
        account.sub_accounts.map((subAccount) => (
          <AccountRow
            key={subAccount.id}
            account={subAccount}
            level={level + 1}
            sessions={sessions}
          />
        ))}

      
    </>
  );
}