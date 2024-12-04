"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "../../_providers/trpc-provider";
import { toast } from "sonner";
import { PageRole, pageRoleMapping } from "@/lib/constants";

interface UserResponseProps {
  id: string;
  email: string;
  roles: string[];
}

const AuthPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasVerified = useRef(false);
  const [error, setError] = useState<string | null>(null);

  const verify = trpc.verifyToken.useMutation({
    onSuccess: async (data) => {
      toast.success(data.message);

      const userDetails = data.user as UserResponseProps;
      const userRoles = userDetails.roles || [];

      if (userRoles.length === 0) {
        setError("No roles assigned to the user.");
        return;
      }

      const defaultPage = pageRoleMapping[userRoles[0] as PageRole][0];
      if (userRoles[0] === "employee") {
        router.push("/profile");
      } else {
        router.push(defaultPage.pathname);
      }
    },
    onError: () => {
      toast.error("Error in designating role.");
      setError("Failed to verify token.");
    },
  });

  useEffect(() => {
    const verifyToken = async () => {
      if (hasVerified.current) return;

      const token = searchParams.get("token");

      if (!token || typeof token !== "string") {
        setError("Token is missing or invalid.");
        return;
      }

      hasVerified.current = true;
      verify.mutate({ token });
    };

    verifyToken();
    // Dependencies ensure this only runs once on initial render
  });

  if (error) {
    return <div className="flex items-center justify-center h-screen">{error}</div>;
  }

  return <div className="flex items-center justify-center h-screen">Verifying token...</div>;
};

export default AuthPage;
