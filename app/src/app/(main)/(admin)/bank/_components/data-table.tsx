"use client";

import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from "@tanstack/react-table";
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import BankEditableTable from "./bank-editable-table";
import { bankEditableTableSchema } from "@/app/server/dtos";
import { trpc } from "@/app/_providers/trpc-provider";
import { toast } from "sonner";
import { ROLE_ACCESS } from "@/lib/role-codes";
import { CheckUserRole } from "@/lib/session-manager";
import { useSession } from "next-auth/react";
import { Bank } from "@prisma/client";
import { DataTableViewOptions } from "@/components/table/data-table-view-option";
import useActiveOrganizationStore from "@/app/server/store/active-organization.store";


interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onRowClick?: (row: Bank) => void;
}

interface UpdatedRow {
  id: string;
  [key: string]: string | number | boolean | undefined;
}

export function BankDataTable<TData extends Bank, TValue> ({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  type TEditedContent = z.infer<typeof bankEditableTableSchema>;

  const [columnFilters, setColumnFilters] = React.useState("");
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [rowSelection, setRowSelection] = React.useState({});
  const [editedContent, setEditedContent] = React.useState<TEditedContent>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<{ [key: string]: boolean }>({});
  const [isDirty, setIsDirty] = React.useState(false);
  const utils = trpc.useUtils();
  const session = useSession();
  const roles = session.data?.user.roles?.map(role => role.role_name) as string[];
  const { organizationSlug } = useActiveOrganizationStore();


  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      globalFilter: columnFilters,
      sorting,
      rowSelection,
      columnVisibility,
    },
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    manualPagination: true,
    enableRowSelection: true

  });
  const editableRef = useRef(true);

  const handleCellEdit = <TValue extends string >(
    rowId: string,
    cellId: string,
    value: TValue
  ) => {
    setEditedContent((prevContent) => {
      const existingRow = prevContent.find((row) => row.id === rowId);

      const updatedRow = existingRow
        ? { ...existingRow, [cellId]: value }
        : { id: rowId, sort_code: value, organization_id: organizationSlug };

      (updatedRow as UpdatedRow)[cellId] = value;

      if (existingRow) {
        const updatedContent = prevContent.map((row) =>
          row.id === rowId ? updatedRow : row
        );

        return updatedContent;
      } else {
        return [...prevContent, updatedRow];
      }
    });
  };

  const editBankSortCodes = trpc.editBankTable.useMutation({
    onSuccess: async () => {
      toast.success("Banks edited successfully");
      editableRef.current = false;
      setEditedContent([]);
      setIsDirty(false);

      utils.getAllBanks.invalidate();
    },
    onError: (error) => {
      console.error(error);
      toast.error("Error creating role");

    },
  });

  const handleSaveChanges = async () => {
    try {
      editBankSortCodes.mutate(editedContent);
    } catch (error) {
      console.error("Error saving changes:", error);
    }
  };

  const handleUndoChanges = () => {
    setEditedContent([]);
    setIsDirty(false);
  };

  React.useEffect(() => {
    if (Object.keys(editedContent).length > 0) {
      setIsDirty(true);
    } else {
      setIsDirty(false);
    }
  }, [editedContent]);

  return (
    <div className="px-10">
      <div className="py-4 flex justify-between items-stretch w-full">
        <div className="flex items-center">
          <Input
            placeholder="Search bank"
            value={columnFilters}
            onChange={(e) => setColumnFilters(e.target.value)}
            className="w-64 h-10 px-3 rounded-md border"
          />
        </div>

        <div className="flex items-center space-x-2 ">

          {CheckUserRole(ROLE_ACCESS.UPDATE_LOAN, roles) &&
          <div className="flex items-center space-x-2 ">
            <Button
              variant="default"
              onClick={handleSaveChanges}
              disabled={!isDirty}
            >
        Save
            </Button>
            <Button
              variant="secondary"
              onClick={handleUndoChanges}
              disabled={!isDirty}
            >
        Undo
            </Button>
          </div>
          }
          <div>

            <DataTableViewOptions table={table} />
          </div>
        </div>
      </div>

      <div className="overflow-auto max-h-[calc(100vh-100px)]">
        <table className="text-sm  table-fixed w-full text-left rtl:text-right  dark:text-gray">
          <thead  className="sticky top-0 z-10 whitespace-nowrap shadow-md py-3 px-2 border border-1
          text-xs text-gray2 uppercase bg-gray-50 dark:bg-gray dark:text-gray2">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    scope="col"
                    onClick={header.column.getToggleSortingHandler()}
                    className="sticky top-0 z-10 bg-white text-gblue font-semibold px-6 py-3  whitespace-nowrap shadow-md border border-1"
                  >
                    <div className="flex">
                      {header.isPlaceholder ? null : (
                        <>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </>
                      )}
                      {{ asc: "↑", desc: "↓" }[header.column.getIsSorted() as string] ?? ""}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} data-state={row.getIsSelected() && "selected"} className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray even:dark:bg-gray-800 border-b dark:border-gray-700">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      <BankEditableTable cell={cell} handleCellEdit={handleCellEdit}  />
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="h-24 text-center">
          No results
                </td>
              </tr>
            )}
          </tbody>
        </table>

      </div>
    </div>
  );
}
