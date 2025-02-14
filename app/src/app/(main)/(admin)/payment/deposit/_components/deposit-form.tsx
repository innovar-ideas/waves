"use client";

import { useState, useCallback, Dispatch, SetStateAction, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Table } from "@/components/ui/table";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Accounts, Client, Invoice, Payment } from "@prisma/client";
import { trpc } from "@/app/_providers/trpc-provider";
import { getActiveOrganizationSlugFromLocalStorage } from "@/lib/helper-function";
import { CashToBankFormSchema } from "@/app/server/dtos";

interface DepositFormProps {
  initialEntries?: (Payment & {client: Client | null, account: Accounts | null, invoice: Invoice | null})[]
  onEntriesChange?: (entries: (Payment & {client: Client | null, account: Accounts | null, invoice: Invoice | null})[]) => void
  onSubmit?: (formData: CashToBankFormSchema) => void
  setLoading: Dispatch<SetStateAction<boolean>>
  loading: boolean
}

export default function DepositForm({ initialEntries = [], onEntriesChange, onSubmit, setLoading, loading }: DepositFormProps) {
  const [date, setDate] = useState<Date | undefined>(new Date("2025-01-26"));
  const [entries, setEntries] = useState<(Payment & {client: Client | null, account: Accounts | null, invoice: Invoice | null})[]>(initialEntries);
  const [depositTo, setDepositTo] = useState<string>("");
  const [memo, setMemo] = useState("Deposit");
  const [currency, setCurrency] = useState("US Dollar");
  const orgId = getActiveOrganizationSlugFromLocalStorage() || "";
  
  const handleRemoveEntry = (id: string) => {
    const newEntries = entries.filter((entry) => entry.id !== id);
    setEntries(newEntries);
    onEntriesChange?.(newEntries);
  };

  const {data: accountBank } = trpc.getAllAccountOfTypeBank.useQuery(
        {organizationSlug: orgId},
        {
          enabled:!!orgId,
          retry: 2
        }
      );

      useEffect(()=> {
        if(accountBank){
          setDepositTo(accountBank[0].id);
        }
      }, [accountBank]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    onSubmit?.({
      depositTo,
      date,
      memo,
      currency,
      paymentIds: entries.map(item => item.id),
      organization_id: orgId
    });
  };

  const handleClear = useCallback(() => {
    setDepositTo("");
    setDate(new Date());
    setMemo("Deposit");
    setCurrency("US Dollar");
  }, []);

  const totalAmount = entries.reduce((sum, entry) => sum + (entry.amount || 0), 0);

  return (
    <form onSubmit={handleSave} className="p-4 h-full">
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="space-y-2">
          <label className="text-sm" htmlFor="deposit-to">
            Deposit To
          </label>
          <select
            id="deposit-to"
            className="w-full border rounded px-3 py-1.5 bg-white"
            value={depositTo}
            onChange={(e) => setDepositTo(e.target.value)}
          >
            {accountBank?.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.account_name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm" htmlFor="date">
              Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  id="date"
                  className={cn(
                    "w-full flex items-center justify-start border rounded px-3 py-1.5 bg-white text-left text-sm",
                    !date && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "MM/dd/yyyy") : <span>Pick a date</span>}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <label className="text-sm" htmlFor="memo">
              Memo
            </label>
            <Input type="text" id="memo" value={memo} onChange={(e) => setMemo(e.target.value)} className="w-full" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm" htmlFor="currency">
            Currency
          </label>
          <select
            id="currency"
            className="w-full border rounded px-3 py-1.5 bg-white"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            <option>US Dollar</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm">EXCHANGE RATE 1 USD =</label>
            <div className="border rounded px-3 py-1.5 bg-gray-50">USD</div>
          </div>
        </div>
      </div>

      <div className="text-sm mb-4">
        Click Payments to select customer payments that you have received. List any other amounts to deposit below.
      </div>

      <div className="border rounded">
        <Table>
          <thead>
            <tr className="bg-gray-50 text-xs">
              <th className="border-b px-4 py-2 text-left">S.NO</th>
              <th className="border-b px-4 py-2 text-left">RECEIVED FROM</th>
              <th className="border-b px-4 py-2 text-left">FROM ACCOUNT</th>
              <th className="border-b px-4 py-2 text-left">MEMO</th>
              <th className="border-b px-4 py-2 text-left">CHK NO.</th>
              <th className="border-b px-4 py-2 text-left">PMT METH</th>
              <th className="border-b px-4 py-2 text-right">AMOUNT (USD)</th>
              <th className="border-b px-4 py-2 w-16"></th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => (
              <tr key={entry.id} className={index % 2 === 0 ? "bg-blue-50/50" : ""}>
                <td className="border-b px-4 py-1 text-center">{index + 1}</td>
                <td className="border-b px-4 py-1">{entry?.client?.first_name + " " + entry?.client?.last_name}</td>
                <td className="border-b px-4 py-1">{entry?.account?.account_name}</td>
                <td className="border-b px-4 py-1">{entry.description}</td>
                <td className="border-b px-4 py-1">{entry.bank_reference}</td>
                <td className="border-b px-4 py-1">{entry.payment_method}</td>
                <td className="border-b px-4 py-1 text-right">
                  {entry.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </td>
                <td className="border-b px-4 py-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveEntry(entry.id)}
                    className="h-8 w-8 text-gray-500 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
      
            {Array(Math.max(0, 15 - entries.length))
              .fill(null)
              .map((_, i) => (
                <tr key={`empty-${i}`} className={(i + entries.length) % 2 === 0 ? "bg-blue-50/50" : ""}>
                  {Array(8).fill(null).map((_, j) => (
                    <td key={j} className="border-b px-4 py-1">&nbsp;</td>
                  ))}
                </tr>
              ))}
          </tbody>
        </Table>
      </div>

      <div className="flex justify-between mt-4">
        <div className="flex gap-4">
          <Button disabled={loading} type="submit" className="bg-primary">
            {loading ? "Submitting" : "Save"}
          </Button>
          <Button type="button" variant="outline" onClick={handleClear}>
            Clear
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm">Deposit Subtotal</div>
          <div className="border rounded px-3 py-1.5 bg-gray-50 min-w-[100px] text-right">
            {totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>
    </form>
  );
}

