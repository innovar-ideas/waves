"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/app/_providers/trpc-provider";
import { DataTable } from "@/components/table/data-table";
import { Input } from "@/components/ui/input";
import { DollarSign, Search, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/use-debounce";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatAmountToNaira } from "@/lib/helper-function";
import useActiveOrganizationStore from "@/app/server/store/active-organization.store";
import { invoiceColumns, renderSubComponent } from "../invoices/_components/invoice-columns";
import { INVOICE_STATUSES } from "@/app/server/types";

type InvoiceStatusType = typeof INVOICE_STATUSES[keyof typeof INVOICE_STATUSES];

export default function ReceivablesPage() {
  const { organizationSlug } = useActiveOrganizationStore();
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<"month" | "week" | "2months" | "custom" | undefined>();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [sessionId, setSessionId] = useState<string>();
  const [status, setStatus] = useState<InvoiceStatusType>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const debouncedSearch = useDebounce(search, 300);
  
  const { data } = trpc.getReceivables.useQuery({ 
    organizationSlug,
    search: debouncedSearch,
    dateRange,
    startDate,
    endDate,
    sessionId,
    status,
    page,
    pageSize
  });

  const handleNextPage = async () => {
    setPage(page + 1);
  };

  const resetFilters = () => {
    setSearch("");
    setDateRange(undefined);
    setStartDate(undefined);
    setEndDate(undefined);
    setSessionId(undefined);
    setStatus(undefined);
    setPage(1);
    setPageSize(10);
  };

  return (
    <div className="min-h-screen w-full space-y-6 rounded-lg bg-white p-6 shadow-lg">
      <div className="flex flex-col items-center space-y-4 md:flex-row md:justify-between">
        <h4 className="font-bold">Receivables</h4>
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
              placeholder="Search receivables..."
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

        <div className="mb-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Receivables</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatAmountToNaira(data?.totalReceivables || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total amount owed to customers
            </p>
          </CardContent>
        </Card>
      </div>

      <DataTable
        columns={invoiceColumns}
        data={data?.invoices || []}
        filterColumnId="customer_name"
        filterInputPlaceholder="Filter by customer..."
        renderSubComponent={renderSubComponent}
        getRowCanExpand={() => true}
        nextPage={handleNextPage}
        rowCount={data?.pagination.total || 0}
      />

      {/* Pagination */}
      {data?.pagination && (
        <div className="flex items-center justify-between px-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, data.pagination.total)} of{" "}
            {data.pagination.total} results
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
                Page {page} of {data.pagination.pageCount}
              </div>
              <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={page === data.pagination.pageCount}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 