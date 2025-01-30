"use client";

import { Navigation } from "./_components/navigation";

export default function FinanceLayout({ children }: { children: React.ReactNode }) {

  return (
    <div className='min-h-screen'>
      <Navigation />
      <div className='w-full'>
      
        {children}
      </div>
    </div>
  );
}