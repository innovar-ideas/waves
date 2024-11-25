import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface LineItemsTableProps {
  items: LineItem[];
  removeItem: (itemId: number) => void;
}

interface LineItem {
  name?: string;
  amount?: number; // Changed to number
  required?: boolean;
  description?: string;
}

export default function LineItemsTable({ removeItem, items }: LineItemsTableProps) {
  return (
    <div className='max-h-[170px] overflow-y-auto rounded-lg border bg-gray-50'>
      <Table>
        <TableCaption>A list of your line items.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className='text-center'>Name</TableHead>
            <TableHead className='text-center'>Amount</TableHead>
            <TableHead className='text-center'>Type</TableHead>
            <TableHead className='text-center'>Delete</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, index) => (
            <TableRow key={item.name}>
              <TableCell className='max-w-[13rem] select-none truncate text-center text-xs font-medium'>
                {item.name}
              </TableCell>
              <TableCell className='text-center text-sm'>{item.amount}</TableCell>
              <TableCell className='text-center text-sm'>{item.required ? "Earning" : "Deduction"}</TableCell>
              <TableCell className='grid place-items-center text-sm'>
                <div className='grid w-[21px] cursor-pointer place-items-center rounded-xl bg-red-500'>
                  <span className='mb-[1px] text-sm text-white' onClick={() => removeItem(index)}>
                    &times;
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
