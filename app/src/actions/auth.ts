"use server";

import { signIn } from "@/auth";
import { signInSchema } from "../lib/dtos";
import { ERROR_MESSAGES } from "@/lib/constants";
import { z } from "zod";

export async function signInWithPassword(input: z.infer<typeof signInSchema>) {
  const validation = signInSchema.safeParse(input);

  if (!validation.success)
    return {
      error: ERROR_MESSAGES.INPUT_VALIDATION_FAILED,
      errors: validation.error.flatten(),
    };

  try {
    await signIn("credentials", {
      email: validation.data.email,
      password: validation.data.password,
      redirect: false,
    });

    return { ok: true };
  } catch (error) {
    console.error("failed to sign in with password", error);
    return {
      error: ERROR_MESSAGES.INVALID_CREDENTIALS,
    };
  }
}
