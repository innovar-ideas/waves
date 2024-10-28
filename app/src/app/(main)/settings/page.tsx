"use client";

import { Button } from "@/components/ui/button";
import { useSignOut } from "@/hooks/use-signout";

export default function SettingsPage() {
  const { signingOut, handleSignout } = useSignOut();

  return (
    <>
      <div className='flex flex-col'>
        <h1 className='text-lg font-semibold md:text-2xl'>Settings</h1>
        <p className='text-muted-foreground'>Manage your account settings and set preferences.</p>
        <hr className='my-3' />
      </div>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <div className='col-span-4'>
          <h2 className='mb-2 text-lg font-semibold'>Account</h2>
          <Button variant='secondary' disabled={signingOut} onClick={handleSignout}>
            Sign Out
          </Button>
        </div>
      </div>
      <hr className='my-3' />
    </>
  );
}
