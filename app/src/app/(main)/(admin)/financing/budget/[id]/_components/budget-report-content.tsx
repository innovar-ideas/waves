import Image from "next/image";

interface BudgetReportContentProps {
  organizationData: {
    name: string;
    contact_email: string;
  };
  budget: {
    name: string;
    budgeted_amount: number;
    amount_spent: number;
    balance: number;
    items: {
      id: string;
      description: string;
      budgeted_amount: number;
      amount: number;
    }[];
  };
  logo: string;
}

export function BudgetReportContent({ organizationData, budget, logo }: BudgetReportContentProps) {
  return (
    <div id="printable-content" className='mx-auto max-w-5xl p-8 bg-white'>
      {/* Header */}
      <div className='mb-8 flex flex-col items-center justify-center space-y-2'>
        <div className='h-24 w-24'>
      <Image 
        src={logo} 
        alt='School Logo' 
        width={128} 
        height={128} 
        objectFit="contain"
        className='h-full w-full' 
      />
        </div>
        <h1 className='text-2xl font-bold text-primaryTheme-500'>{organizationData.name}</h1>
        <p className='text-sm text-primaryTheme-500'>Address: {organizationData.contact_email}</p>
      </div>

      {/* Title Bar */}
      <div className='mb-8 w-full bg-primaryTheme-500 py-4'>
        <h2 className='text-center text-xl font-bold text-white'>
          {budget.name.toUpperCase()}
        </h2>
      </div>

      {/* Budget Items Table */}
      <div className='w-full'>
        <table className='w-full border-collapse'>
          <thead>
            <tr className='bg-primaryTheme-500 text-white'>
              <th className='w-16 border border-primaryTheme-500 p-3 text-left'>S/N</th>
              <th className='border border-primaryTheme-500 p-3 text-left'>DESCRIPTION</th>
              <th className='border border-primaryTheme-500 p-3 text-right'>Budgeted Amount (₦)</th>
              <th className='border border-primaryTheme-500 p-3 text-right'>Amount Spent (₦)</th>
              <th className='border border-primaryTheme-500 p-3 text-right'>Balance (₦)</th>
            </tr>
          </thead>
          <tbody>
            {budget.items.map((item, index) => {
              const balance = item.budgeted_amount - item.amount;
              return (
                <tr key={item.id}>
                  <td className='border border-gray-200 p-3'>
                    {(index + 1).toString().padStart(2, "0")}.
                  </td>
                  <td className='border border-gray-200 p-3'>{item.description}</td>
                  <td className='border border-gray-200 p-3 text-right'>
                    {item.budgeted_amount.toLocaleString()}
                  </td>
                  <td className='border border-gray-200 p-3 text-right'>
                    {item.amount.toLocaleString()}
                  </td>
                  <td className={`border border-gray-200 p-3 text-right ${balance < 0 ? "text-red-600" : ""}`}>
                    {balance < 0 ? "-₦" : "₦"}
                    {Math.abs(balance).toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className='bg-primaryTheme-500 text-white'>
              <td className='border border-primaryTheme-500 p-3 font-bold' colSpan={2}>
                TOTAL
              </td>
              <td className='border border-primaryTheme-500 p-3 text-right font-bold'>
                ₦{budget.budgeted_amount.toLocaleString()}
              </td>
              <td className='border border-primaryTheme-500 p-3 text-right font-bold'>
                ₦{budget.amount_spent.toLocaleString()}
              </td>
              <td className={`border border-primaryTheme-500 p-3 text-right font-bold ${budget.balance < 0 ? "text-red-200" : ""}`}>
                {budget.balance < 0 ? "-₦" : "₦"}
                {Math.abs(budget.balance).toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
} 