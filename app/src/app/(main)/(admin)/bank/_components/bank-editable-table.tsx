import { Cell, flexRender } from "@tanstack/react-table";
import React, { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Bank } from "@prisma/client";

interface EditableTableCellProps<TData extends Bank, TValue> {
  cell: Cell<TData, TValue>;
  handleCellEdit: (rowId: string, cellId: string, value: TValue) => void;

}

const BankEditableTable = <TData extends Bank, TValue extends string>(
  { cell, handleCellEdit }: EditableTableCellProps<TData, TValue>
) => {
  const [isEditable, setIsEditable] = useState(false);
  const [value, setValue] = useState<TValue>("" as TValue);
  const inputRef = useRef<HTMLInputElement>(null);

  const  handleEditable = (columnId: string) => {
    switch(columnId) {
      case "name":
      case "organization":
        setIsEditable(false);
        break;
      default:
        setIsEditable(true);
    }
  };

  useEffect(() => {
    handleEditable(cell.column.id);
  }, [cell]);

  let content;

  switch (cell.column.id) {
    case "sort_code":
      content = (
        <div  className="text-xs w-[100px]">

          <Input
            value={value}
            defaultValue={cell.row.original.sort_code as string}
            onChange={(e) => {
              setValue(e.target.value as unknown as TValue);
              handleCellEdit((cell.row.original as { id: string }).id as string, cell.column.id, (e.target.value) as TValue);
            }}
            ref={inputRef}
            className="min-w-[100px] text-xs"
          />
        </div>
      );

      break;

      default:
      content = (
        <div  className="text-xs w-[100px]">

          <Input
            value={value as string}
            onChange={(e) => {
              setValue(e.target.value as unknown as TValue);
              handleCellEdit((cell.row.original as { id: string }).id as string, cell.column.id, (e.target.value) as TValue);
            }}
            ref={inputRef}
            className="min-w-[100px] text-xs"
          />
        </div>
      );
      break;
  }

  return isEditable ? content : <div onDoubleClick={()=>handleEditable(cell.column.id)}>{flexRender(cell.column.columnDef.cell, cell.getContext()) }</div>;
};

export default BankEditableTable;
