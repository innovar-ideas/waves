"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTableToolbar } from "@/components/table/data-table-toolbar";
import { DataTablePagination } from "@/components/table/data-table-pagination";
// import { DataTableToolbar } from "./data-table-toolbar";
// import { DataTablePagination } from "./data-table-pagination";

interface DataTableProps<TData, TValue> {
  action?: React.ReactNode
  onRowClick?: (data: TData) => void
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  nextPage?: () => Promise<void> | undefined
  filterInputPlaceholder?: string
  filterColumnId?: string
  itemCypressTag?: string
  rowCount?: number
  onSelectionChange?: (selectedRows: TData[]) => void
  theme?: string
  updateData?: (rowIndex: number, columnId: string, value: string) => void
}

export function ViewPayrollDataTable<TData, TValue>({
  columns,
  data,
  nextPage,
  action,
  onRowClick,
  filterInputPlaceholder,
  filterColumnId,
  itemCypressTag,
  onSelectionChange,
  isLoading = false,
  withToolbar = true,
}: DataTableProps<TData, TValue> & {
  isLoading?: boolean
  withToolbar?: boolean
}) {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    enableRowSelection: true,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    state: { columnFilters, rowSelection },
    onRowSelectionChange: setRowSelection,
  });

  React.useEffect(() => {
    const selectedRowsData = table.getSelectedRowModel().flatRows.map((row) => row.original);
    onSelectionChange?.(selectedRowsData);
  }, [table, rowSelection, onSelectionChange]);

  return (
    <div className="space-y-4">
      {withToolbar && (
        <DataTableToolbar
          filterColumnId={filterColumnId}
          placeholder={filterInputPlaceholder}
          table={table}
          action={action}
        />
      )}

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead 
                    key={header.id}
                    className="h-10 px-4 text-sm font-medium text-muted-foreground"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index} className="hover:bg-muted/50">
                  {columns.map((_, cellIndex) => (
                    <TableCell key={cellIndex} className="px-4 py-4">
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-cy={itemCypressTag}
                  data-state={row.getIsSelected() && "selected"}
                  className={`hover:bg-muted/50 ${onRowClick && "cursor-pointer"}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onRowClick?.(row.original);
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell 
                      key={cell.id} 
                      className="px-4 py-4 text-sm"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} loadMore={nextPage} />
    </div>
  );
}

