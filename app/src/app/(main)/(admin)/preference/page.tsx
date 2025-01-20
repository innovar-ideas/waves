"use client";

import { ExpectedDocumentsForm } from "./_components/expected-document-form";
import { HomeAppLinkFormComponent } from "./_components/home-app-link-form";
import { useSession } from "next-auth/react";
import { LogoUploadForm } from "./_components/logo-upload-form";
import useActiveOrganizationStore from "@/app/server/store/active-organization.store";

export default function PreferencesPage() {
  const { organizationSlug } = useActiveOrganizationStore();
  const session = useSession();

  return (
    <div className="container mx-auto py-10 space-y-8">
      <ExpectedDocumentsForm organizationSlug={organizationSlug} user_id={session.data?.user.id as string} />

      <HomeAppLinkFormComponent organizationSlug={organizationSlug} user_id={session.data?.user.id as string} />

      <LogoUploadForm organizationSlug={organizationSlug} user_id={session.data?.user.id as string} />
    </div>
  );
}

