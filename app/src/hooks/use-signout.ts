"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { pages } from "@/lib/constants";

export function useSignOut() {
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignout() {
    setSigningOut(true);
    await signOut({ redirect: false });

    window.location.href = pages.login.pathname;
  }

  return { handleSignout, signingOut };
}
