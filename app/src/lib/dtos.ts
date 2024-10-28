import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(5),
});

export const registrationSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  phoneNumber: z.string(),
  emailAddress: z.string().email(),
  password: z.string(),
});
