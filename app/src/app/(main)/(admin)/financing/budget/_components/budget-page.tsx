"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Printer, FileEdit, ChevronDown, ChevronRight, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { trpc } from "@/app/_providers/trpc-provider";
import { useState } from "react";
// import { EditBudgetDialog } from "@/components/budget/edit-budget-dialog";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import useActiveOrganizationStore from "@/app/server/store/active-organization.store";
import { EditBudgetDialog } from "./edit-budget-dialog";

type TabValue = "all" | "approved" | "non-approved";

export default function BudgetPage() {
  const { organizationSlug } = useActiveOrganizationStore();
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [editingBudget, setEditingBudget] = useState<typeof budgets[number] | null>(null);
  const [expandedBudgets, setExpandedBudgets] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<TabValue>("all");

  const { data, isLoading, error, refetch } = trpc.getBudgets.useQuery({
    organizationSlug,
    page,
    pageSize,
    search,
    status: activeTab === "all" ? undefined : activeTab === "approved" ? "APPROVED" : "NOT_APPROVED",
  });

  const updateStatusMutation = trpc.updateBudgetStatus.useMutation({
    onSuccess: () => {
      refetch();
      toast({
        title: "Budget status updated",
        description: "The budget status has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const router = useRouter();

  const toggleBudget = (budgetId: string) => {
    const newExpanded = new Set(expandedBudgets);
    if (newExpanded.has(budgetId)) {
      newExpanded.delete(budgetId);
    } else {
      newExpanded.add(budgetId);
    }
    setExpandedBudgets(newExpanded);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading budgets</div>;

  const { budgets, total } = data!;
  const totalPages = Math.ceil(total / pageSize);

  const totalBudgeted = budgets.reduce((sum, item) => sum + item.budgeted_amount, 0);
  const totalSpent = budgets.reduce((sum, item) => sum + item.amount_spent, 0);
  const totalBalance = budgets.reduce((sum, item) => sum + item.balance, 0);

  return (
    <div className='mx-auto w-full'>
      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:items-center">
        <div className="flex-1 space-y-4">
          <h1 className="text-2xl font-bold">Budgets</h1>
          <input
            type="text"
            placeholder="Search budgets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-2 rounded"
          />
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabValue)} className="w-fit">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="non-approved">Non-Approved</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead>Budgets</TableHead>
              <TableHead className="text-right">Budgeted Amount</TableHead>
              <TableHead className="text-right">Amount Spent</TableHead>
              <TableHead className="text-right">Balance</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {budgets.map((item) => (
              <>
                <TableRow key={item.id}>
                  <TableCell onClick={() => toggleBudget(item.id)} className="cursor-pointer">
                    {expandedBudgets.has(item.id) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell className="text-right">₦{item.budgeted_amount.toLocaleString()}</TableCell>
                  <TableCell className="text-right">₦{item.amount_spent.toLocaleString()}</TableCell>
                  <TableCell className={cn(
                    "text-right",
                    item.balance < 0 ? "text-red-500" : "text-inherit"
                  )}>
                    {item.balance < 0 && "-"}₦{Math.abs(item.balance).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={cn(
                      "inline-block rounded-full px-2 py-1 text-xs",
                      item.status === "APPROVED" 
                        ? "bg-green-50 text-green-600" 
                        : "bg-yellow-50 text-yellow-600"
                    )}>
                      {item.status === "APPROVED" ? "Approved" : "Pending"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => updateStatusMutation.mutate({ 
                          id: item.id, 
                          status: "APPROVED" 
                        })}
                        disabled={item.status === "APPROVED"}
                      >
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => updateStatusMutation.mutate({ 
                          id: item.id, 
                          status: "NOT_APPROVED" 
                        })}
                        disabled={item.status === "NOT_APPROVED"}
                      >
                        <XCircle className="h-4 w-4 text-red-500" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setEditingBudget(item)}
                      >
                        <FileEdit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => router.push(`/financing/budget/${item.id}`)}
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                {expandedBudgets.has(item.id) && item.items.map((budgetItem) => (
                  <TableRow key={budgetItem.id} className="bg-slate-50">
                    <TableCell></TableCell>
                    <TableCell className="pl-8">{budgetItem.description}</TableCell>
                    <TableCell className="text-right">₦{budgetItem.budgeted_amount.toLocaleString()}</TableCell>
                    <TableCell className="text-right">₦{budgetItem.amount.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      ₦{(budgetItem.budgeted_amount - budgetItem.amount).toLocaleString()}
                    </TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                ))}
              </>
            ))}
          </TableBody>
          <TableFooter className="bg-slate-50">
            <TableRow>
              <TableCell></TableCell>
              <TableCell className="font-bold">TOTAL</TableCell>
              <TableCell className="text-right font-bold">₦{totalBudgeted.toLocaleString()}</TableCell>
              <TableCell className="text-right font-bold">₦{totalSpent.toLocaleString()}</TableCell>
              <TableCell className="text-right font-bold">₦{totalBalance.toLocaleString()}</TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      <div className="flex justify-between mt-4">
        <Button
          variant="default"
          disabled={page === 1}
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          className="bg-primaryTheme-500 hover:bg-primaryTheme-600"
        >
          Previous
        </Button>
        <span>
          Page {page} of {totalPages}
        </span>
        <Button
          variant="default"
          disabled={page === totalPages}
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          className="bg-primaryTheme-500 hover:bg-primaryTheme-600"
        >
          Next
        </Button>
      </div>

      {editingBudget && (
        <EditBudgetDialog
          open={!!editingBudget}
          onOpenChange={(open) => !open && setEditingBudget(null)}
          budget={editingBudget as {
            id: string;
            name: string;
            expense_account_id?: string;
            items: {
              id: string;
              description: string;
              budgeted_amount: number;
            }[];
          }}
          organizationSlug={organizationSlug}
        />
      )}
    </div>
  );
}

