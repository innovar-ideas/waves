"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
<<<<<<< HEAD
=======
import { Input } from "@/components/ui/input";
>>>>>>> e33eb23 (completed load approval and rejection and load crud)

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
<<<<<<< HEAD
  searchKey?: string;
=======
  searchKey: string;
>>>>>>> e33eb23 (completed load approval and rejection and load crud)
}

export function DataTable<TData, TValue>({
  columns,
  data,
<<<<<<< HEAD
=======
  searchKey,
>>>>>>> e33eb23 (completed load approval and rejection and load crud)
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div>
<<<<<<< HEAD
=======
      <div className="flex items-center py-4">
        <Input
          placeholder="Search..."
          onChange={(event) =>
            table.getColumn(searchKey)?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>
>>>>>>> e33eb23 (completed load approval and rejection and load crud)
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
<<<<<<< HEAD
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
=======
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
>>>>>>> e33eb23 (completed load approval and rejection and load crud)
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
<<<<<<< HEAD
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
=======
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
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
>>>>>>> e33eb23 (completed load approval and rejection and load crud)
        </TableBody>
      </Table>
    </div>
  );
} 