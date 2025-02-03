"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/app/_providers/trpc-provider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/use-debounce";
import useActiveOrganizationStore from "@/app/server/store/active-organization.store";
import { AccountRow } from "../_components/account-row";
import { PaymentForm } from "../_components/payment-form";
import NewIncomeAccountForm from "../_components/create-new-income";
import { RecursiveAccount } from "@/app/server/types";

enum ViewType {
  Default = "default",
  PaymentRecords = "paymentRecords",
  CreateIncomeAccount = "createIncomeAccount",
  LoginIncome = "loginIncome",
  LogIncomePayment = "logIncomePayment",
}

export default function IncomePage() {
  const [currentView, setCurrentView] = useState<ViewType>(ViewType.Default);
  const { organizationSlug } = useActiveOrganizationStore();
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<"month" | "week" | "2months" | "custom" | undefined>();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const debouncedSearch = useDebounce(search, 300);

  const { data } = trpc.getAllIncomeAccounts.useQuery({ 
    slug: organizationSlug,
    search: debouncedSearch,
    dateRange,
    startDate,
    endDate,
    page,
    pageSize
  });

  const utils = trpc.useUtils();
  
  const handleCreate = () => {
    utils.getAllIncomeAccounts.invalidate();
    setCurrentView(ViewType.Default);
  };

  const toggleView = (view: ViewType) => {
    setCurrentView(currentView === view ? ViewType.Default : view);
  };

  const accounts = data?.accounts || [];
  const pagination = data?.pagination;

  const resetFilters = () => {
    setSearch("");
    setDateRange(undefined);
    setStartDate(undefined);
    setEndDate(undefined);
    setPage(1);
    setPageSize(10);
  };

  return (
    <>
      {currentView === ViewType.Default && (
        <div className='min-h-screen w-full space-y-6 rounded-lg bg-white p-6 shadow-lg'>
          <div className='flex flex-col items-center space-y-4 md:flex-row md:justify-between'>
            <h4 className='font-bold'>Income</h4>

            <div className='flex flex-col space-y-2 md:flex-row md:space-x-4 md:space-y-0'>
              <Button
                variant='default'
                className='w-full bg-emerald-600 hover:bg-emerald-700 md:w-auto'
                onClick={() => toggleView(ViewType.CreateIncomeAccount)}
              >
                Create New Income Account
              </Button>
              <Button
                variant='default'
                className='w-full bg-emerald-600 hover:bg-emerald-700 md:w-auto'
                onClick={() => toggleView(ViewType.LogIncomePayment)}
              >
                Log Income Payment
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Filters</h3>
              <Button 
                variant="outline" 
                onClick={resetFilters}
                className="h-8 px-2 lg:px-3"
              >
                Reset Filters
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-2 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search accounts..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 pr-8"
                />
                {search && (
                  <Button
                    variant="ghost"
                    className="absolute right-0 top-0 h-full px-2 hover:bg-transparent"
                    onClick={() => setSearch("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="relative">
                <Select 
                  value={dateRange} 
                  onValueChange={(value) => setDateRange(value as "month" | "week" | "2months" | "custom" | undefined)}
                >
                  <SelectTrigger className="pr-8">
                    <SelectValue placeholder="Select date range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Last Week</SelectItem>
                    <SelectItem value="month">Last Month</SelectItem>
                    <SelectItem value="2months">Last 2 Months</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
                {dateRange && (
                  <Button
                    variant="ghost"
                    className="absolute right-0 top-0 h-full px-2 hover:bg-transparent"
                    onClick={() => {
                      setDateRange(undefined);
                      setStartDate(undefined);
                      setEndDate(undefined);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {dateRange === "custom" && (
                <>
                  <div className="relative">
                    <Input
                      type="date"
                      value={startDate?.toISOString().split("T")[0]}
                      onChange={(e) => setStartDate(new Date(e.target.value))}
                      className="pr-8"
                    />
                    {startDate && (
                      <Button
                        variant="ghost"
                        className="absolute right-0 top-0 h-full px-2 hover:bg-transparent"
                        onClick={() => setStartDate(undefined)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      type="date"
                      value={endDate?.toISOString().split("T")[0]}
                      onChange={(e) => setEndDate(new Date(e.target.value))}
                      className="pr-8"
                    />
                    {endDate && (
                      <Button
                        variant="ghost"
                        className="absolute right-0 top-0 h-full px-2 hover:bg-transparent"
                        onClick={() => setEndDate(undefined)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </>
              )};

              <div className="relative">
                <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
                  <SelectTrigger className="pr-8">
                    <SelectValue placeholder="Page size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 per page</SelectItem>
                    <SelectItem value="20">20 per page</SelectItem>
                    <SelectItem value="50">50 per page</SelectItem>
                    <SelectItem value="100">100 per page</SelectItem>
                  </SelectContent>
                </Select>
                {pageSize !== 10 && (
                  <Button
                    variant="ghost"
                    className="absolute right-0 top-0 h-full px-2 hover:bg-transparent"
                    onClick={() => setPageSize(10)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account Name</TableHead>
                  <TableHead>Total Amount (₦)</TableHead>
                  <TableHead>Last Transaction</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-gray-500">
                      No accounts found
                    </TableCell>
                  </TableRow>
                ) : (
                  accounts?.map((account) => (
                    <AccountRow
                      key={account.id}
                      sourceType="income"
                      account={account as unknown as RecursiveAccount}
                      level={0}
                      sessions={[]}
                    />
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {pagination && (
              <div className="flex items-center justify-between px-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                  Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, pagination.total)} of{" "}
                  {pagination.total} results
                </div>
                <div className="flex items-center space-x-6 lg:space-x-8">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <div className="text-sm font-medium">
                      Page {page} of {pagination.pageCount}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setPage(page + 1)}
                      disabled={page === pagination.pageCount}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {(() => {
        switch (currentView) {
          // case ViewType.PaymentRecords:
          //   return <PaymentRecords onBack={() => toggleView(ViewType.Default)} />;
          case ViewType.CreateIncomeAccount:
            return <NewIncomeAccountForm handleCreate={handleCreate} />;
          case ViewType.LogIncomePayment:
            return <PaymentForm sourceType="account" onSuccess={handleCreate} onCancel={() => toggleView(ViewType.Default)}/>;
          default:
            return null;
        }
      })()}
    </>
  );
}
