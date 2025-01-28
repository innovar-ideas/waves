import { auth } from "@/auth";
import WalletCard from "./_components/wallet-card";
import { RecentTransactions } from "./_components/recent-transactions";
export default async function Wallet() {
  const session = await auth();

  return (
    <>
      <div className='flex items-center'>
        <h1 className='text-lg font-semibold md:text-2xl'>Hi, {session?.user.first_name} 👋🏽</h1>
      </div>
      <div className='mb-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <WalletCard />
      </div>
      <div className='mb-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <RecentTransactions className='lg:col-span-2' />
      </div>
    </>
  );
}
