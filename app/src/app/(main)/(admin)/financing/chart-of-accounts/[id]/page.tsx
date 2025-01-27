"use client";

import { Button } from "@/components/ui/button";
import { trpc } from "@/app/_providers/trpc-provider";
import { useParams, useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell
} from "@/components/ui/table";
import { ChevronLeft, Plus, Search } from "lucide-react";
import { AccountTypeEnum } from "@prisma/client";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import useActiveOrganizationStore from "@/app/server/store/active-organization.store";
import { AccountRow, RecursiveAccount } from "../../_components/account-row";
import { PaymentDialog } from "../../_components/payment-dialog";
import { AccountFormDialog } from "../../_components/account-form-dialog";

export default function AccountTypePage() {
  const { id } = useParams();
  const name = id as string;
  const router = useRouter();
  const { organizationSlug } = useActiveOrganizationStore();
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<"month" | "week" | "2months" | "custom" | undefined>();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = trpc.getAccountTypeDetails.useQuery({
    name: name as AccountTypeEnum,
    organizationSlug,
    search: debouncedSearch,
    dateRange,
    startDate,
    endDate,
    page,
    pageSize
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const accounts = data?.accounts || [];
  const pagination = data?.pagination;

  return (
    <div className="container mx-auto py-6 bg-white rounded-lg shadow-md min-h-dvh">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Chart of Accounts
        </Button>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-lg font-bold">{name}</h1>
          </div>
          <div className="flex gap-2">
            <AccountFormDialog
              accountType={name as AccountTypeEnum}
              trigger={
                <Button className="bg-emerald-500 hover:bg-emerald-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Account
                </Button>
              }
            />

            <PaymentDialog
              sourceType="account"
              onSuccess={() => trpc.useUtils().getAccountTypeDetails.invalidate()}
              trigger={
                <Button className="bg-emerald-500 hover:bg-emerald-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Log Payment
                </Button>
              }
            />
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-2 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search accounts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>

          <Select 
            value={dateRange} 
            onValueChange={(value) => setDateRange(value as "month" | "week" | "2months" | "custom" | undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="2months">Last 2 Months</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>

          {dateRange === "custom" && (
            <>
              <Input
                type="date"
                value={startDate?.toISOString().split("T")[0]}
                onChange={(e) => setStartDate(new Date(e.target.value))}
              />
              <Input
                type="date"
                value={endDate?.toISOString().split("T")[0]}
                onChange={(e) => setEndDate(new Date(e.target.value))}
              />
            </>
          )}

          {/* <Select value={sessionId} onValueChange={setSessionId}>
            <SelectTrigger>
              <SelectValue placeholder="Select session" />
            </SelectTrigger>
            <SelectContent>
              {sessions?.map((session) => (
                <SelectItem key={session.id} value={session.id}>
                  {session.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select> */}

          <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
            <SelectTrigger>
              <SelectValue placeholder="Page size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 per page</SelectItem>
              <SelectItem value="20">20 per page</SelectItem>
              <SelectItem value="50">50 per page</SelectItem>
              <SelectItem value="100">100 per page</SelectItem>
            </SelectContent>
          </Select>
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
  );
}
