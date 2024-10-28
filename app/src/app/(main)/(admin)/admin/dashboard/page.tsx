import { auth } from "@/auth";

export default async function Dashboard() {
  const session = await auth();

  return (
    <>
      <div className='flex items-center'>
        <h1 className='text-lg font-semibold md:text-2xl'>Hi, {session?.user.first_name} 👋🏽</h1>
      </div>
      <div className='mb-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'></div>
    </>
  );
}
