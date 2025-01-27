"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/app/_providers/trpc-provider";
import { DataTable } from "@/components/table/data-table";
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
import { BillStatus } from "@prisma/client";
import useActiveOrganizationStore from "@/app/server/store/active-organization.store";
import { PaymentForm } from "../_components/payment-form";
import { billColumns, renderSubComponent } from "./_components/bill-columns";
import CreateBillForm from "./_components/create-bill-form";

enum ViewType {
  Default = "default",
  CreateBill = "createBill",
  LogBill = "logBill"
}

const BILL_STATUSES = {
  DRAFT: BillStatus.DRAFT,
  RECEIVED: BillStatus.RECEIVED,
  PAID: BillStatus.PAID,
  PARTIALLY_PAID: BillStatus.PARTIALLY_PAID,
  OVERDUE: BillStatus.OVERDUE,
  VOID: BillStatus.VOID,
  PENDING: BillStatus.PENDING,
} as const;

type BillStatusType = typeof BILL_STATUSES[keyof typeof BILL_STATUSES];

export default function BillsPage() {
  const [currentView, setCurrentView] = useState<ViewType>(ViewType.Default);
  const { organizationSlug } = useActiveOrganizationStore();
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<"month" | "week" | "2months" | "custom" | undefined>();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [status, setStatus] = useState<BillStatusType>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const debouncedSearch = useDebounce(search, 300);
  
  const { data } = trpc.getBills.useQuery({ 
    organizationSlug,
    search: debouncedSearch,
    dateRange,
    startDate,
    endDate,
    status,
    page,
    pageSize
  });

  const utils = trpc.useUtils();

  const handleCreate = () => {
    utils.getBills.invalidate();
    setCurrentView(ViewType.Default);
  };

  const bills = data?.bills || [];

  const handleNextPage = async () => {
    setPage(page + 1);
  };

  const resetFilters = () => {
    setSearch("");
    setDateRange(undefined);
    setStartDate(undefined);
    setEndDate(undefined);
    setStatus(undefined);
    setPage(1);
    setPageSize(10);
  };

  return (
    <>
      {currentView === ViewType.Default && (
        <div className="min-h-screen w-full space-y-6 rounded-lg bg-white p-6 shadow-lg">
          <div className="flex flex-col items-center space-y-4 md:flex-row md:justify-between">
            <h4 className="font-bold">Bills</h4>
            <Button
              variant="default"
              className="w-full bg-emerald-600 hover:bg-emerald-700 md:w-auto"
              onClick={() => setCurrentView(ViewType.CreateBill)}
            >
              Create New Bill
            </Button>
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

            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="relative">
                <Search className="absolute left-2 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search bills..."
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
              )}

              <div className="relative">
                <Select 
                  value={status} 
                  onValueChange={(value: string) => setStatus(value as BillStatusType)}
                >
                  <SelectTrigger className="pr-8">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(BILL_STATUSES).map(([key, value]) => (
                      <SelectItem key={key} value={value}>
                        {key}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {status && (
                  <Button
                    variant="ghost"
                    className="absolute right-0 top-0 h-full px-2 hover:bg-transparent"
                    onClick={() => setStatus(undefined)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

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

          <DataTable
            columns={billColumns}
            data={bills}
            filterColumnId="vendor_name"
            filterInputPlaceholder="Filter by vendor..."
            renderSubComponent={renderSubComponent}
            getRowCanExpand={() => true}
            nextPage={handleNextPage}
            rowCount={data?.pagination.total || 0}
          />
        </div>
      )}

      {currentView === ViewType.CreateBill && (
        <CreateBillForm handleCreate={handleCreate} />
      )}
      {currentView === ViewType.LogBill && (
        <PaymentForm
          sourceType="bill"
          onSuccess={handleCreate}
          onCancel={() => setCurrentView(ViewType.Default)}
        />
      )}
    </>
  );
}