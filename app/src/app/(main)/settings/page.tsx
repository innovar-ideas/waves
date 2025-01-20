"use client";

import useActiveOrganizationStore from "@/app/server/store/active-organization.store";
import { Button } from "@/components/ui/button";
import { useSignOut } from "@/hooks/use-signout";
import { useSession } from "next-auth/react";
import { ExpectedDocumentsForm } from "../(admin)/preference/_components/expected-document-form";
import { HomeAppLinkFormComponent } from "../(admin)/preference/_components/home-app-link-form";
import { LogoUploadForm } from "../(admin)/preference/_components/logo-upload-form";

export default function SettingsPage() {
  const { signingOut, handleSignout } = useSignOut();
  const { organizationSlug } = useActiveOrganizationStore();
  const session = useSession();

  return (
    <>
      <div className='flex flex-col'>
        <h1 className='text-lg font-semibold md:text-2xl'>Settings</h1>
        <p className='text-muted-foreground'>Manage your account settings and set preferences.</p>
        <hr className='my-3' />
      </div>
      <div className='container mx-auto pb-10 space-y-8'>
        <ExpectedDocumentsForm organizationSlug={organizationSlug} user_id={session.data?.user.id as string} />
        
        <HomeAppLinkFormComponent organizationSlug={organizationSlug} user_id={session.data?.user.id as string} />
        
        <LogoUploadForm organizationSlug={organizationSlug} user_id={session.data?.user.id as string} />
      <div className=''>
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
