"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "../../_providers/trpc-provider";
import { toast } from "sonner";
import { PageRole, pageRoleMapping } from "@/lib/constants";
import { signInWithPassword } from "@/actions/auth";
import { useMutation } from "@tanstack/react-query";

interface UserResponseProps {
  id: string;
  email: string;
  password: string;
  roles: string[];
}

const AuthPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasVerified = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserResponseProps | null>(null);

  const { mutate } = useMutation({
    mutationFn: signInWithPassword,
    onSuccess: async (response) => {

      if (response.error) {
        toast.error(response.error);
        return;
      }

      if (response.ok) {

        toast.success("Sign in successful");

        await handleRedirect();
        return;
      }
    },
  });

  const verify = trpc.verifyToken.useMutation({
    onSuccess: async (data) => {
      toast.success(data.message);

      const userDetails = data.user as UserResponseProps;
      setUserInfo(userDetails);

      mutate({ email: userDetails.email, password: userDetails.email });

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

  async function handleRedirect() {
    const roles = userInfo?.roles || [];

    if (roles.length === 0) {
      setError("No roles assigned to the user.");
      return;
    }

    const defaultPage = pageRoleMapping[roles[0] as PageRole][0];
    if (roles[0] === "employee") {
      router.push("/profile");
    } else {
      router.push(defaultPage.pathname);
    };

  }

  if (error) {
    return <div className="flex items-center justify-center h-screen">{error}</div>;
  }

  return <div className="flex items-center justify-center h-screen">Verifying token...</div>;
};

export default AuthPage;
