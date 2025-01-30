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
import { cn } from "@/lib/utils";
import { trpc } from "@/app/_providers/trpc-provider";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";

export default function BudgetLogPage({organizationSlug}: {organizationSlug: string}) {
  const [expandedBudgets, setExpandedBudgets] = useState<Set<string>>(new Set());
  const [editedItems, setEditedItems] = useState<Record<string, { amount: string; paidInBy: string }>>({});
  const [hasChanges, setHasChanges] = useState(false);

  const { data: budgetData, isLoading, refetch } = trpc.getBudgets.useQuery({
    organizationSlug,
    page: 1,
    pageSize: 100,
  });

  const updateSpentMutation = trpc.updateBudgetItemsSpent.useMutation({
    onSuccess: () => {
      setEditedItems({});
      setHasChanges(false);
      refetch();
    },
  });

  const toggleBudget = (budgetId: string) => {
    const newExpanded = new Set(expandedBudgets);
    if (newExpanded.has(budgetId)) {
      newExpanded.delete(budgetId);
    } else {
      newExpanded.add(budgetId);
    }
    setExpandedBudgets(newExpanded);
  };

  const handleInputChange = (itemId: string, field: "amount" | "paidInBy", value: string) => {
    setEditedItems(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSaveAll = async () => {
    const updates = Object.entries(editedItems).map(([itemId, data]) => ({
      id: itemId,
      amount_spent: parseFloat(data.amount) || 0,
      paid_in_by: data.paidInBy
    }));

    if (updates.length > 0) {
      await updateSpentMutation.mutate(updates);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Budget Spending Log</h1>
          {hasChanges && (
            <Button 
              onClick={handleSaveAll}
              disabled={updateSpentMutation.isPending}
            >
              Save All Changes
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead>Budget Name</TableHead>
              <TableHead className="text-right">Budgeted Amount</TableHead>
              <TableHead className="text-right">Amount Spent</TableHead>
              <TableHead className="text-right">Balance</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {budgetData?.budgets.map((budget) => (
              <>
                <TableRow key={budget.id} className="cursor-pointer hover:bg-slate-50">
                  <TableCell onClick={() => toggleBudget(budget.id)}>
                    {expandedBudgets.has(budget.id) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </TableCell>
                  <TableCell onClick={() => toggleBudget(budget.id)}>
                    {budget.name}
                  </TableCell>
                  <TableCell className="text-right">
                    ₦{budget.budgeted_amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    ₦{budget.amount_spent.toLocaleString()}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right",
                      budget.balance < 0 ? "text-red-500" : "text-inherit"
                    )}
                  >
                    {budget.balance < 0 && "-"}₦{Math.abs(budget.balance).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center">
                    {budget.status === "APPROVED" ? (
                      <span className="text-green-500">Approved</span>
                    ) : (
                      <span className="text-yellow-500">Pending</span>
                    )}
                  </TableCell>
                </TableRow>
                {expandedBudgets.has(budget.id) &&
                  budget.items.map((item) => (
                    <TableRow key={item.id} className="bg-slate-50">
                      <TableCell></TableCell>
                      <TableCell className="pl-8">{item.description}</TableCell>
                      <TableCell className="text-right">
                        ₦{item.budgeted_amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end space-x-2">
                          <Input
                            type="text"
                            value={editedItems[item.id]?.paidInBy ?? item.paid_in_by ?? ""}
                            onChange={(e) => handleInputChange(item.id, "paidInBy", e.target.value)}
                            placeholder="Paid in by"
                            className="w-32 p-1 border rounded"
                          />
                          <Input
                            type="number"
                            value={editedItems[item.id]?.amount ?? item.amount.toString()}
                            onChange={(e) => handleInputChange(item.id, "amount", e.target.value)}
                            className="w-24 p-1 border rounded"
                          />
                        </div>
                      </TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  ))}
              </>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}