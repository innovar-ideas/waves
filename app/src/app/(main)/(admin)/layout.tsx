import { ReactNode } from "react";
// import { redirect } from "next/navigation";
// import { auth } from "@/auth";
// import { pages, userRoleNames } from "@/lib/constants";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // const session = await auth();

  // if (!session?.user.roles?.find(({ role_name }) => role_name === userRoleNames.default)) return redirect(pages.login.pathname);

  return <>{children}</>;
}
