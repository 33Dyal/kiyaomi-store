import { z } from "zod";

const passwordRule = z.string().min(8, "Password must be at least 8 characters");

export const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email(),
  phone: z.string().min(7, "Enter a valid phone number").optional().or(z.literal("")),
  password: passwordRule,
});

// Login stays "required only" so existing accounts with older passwords can still sign in.
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export const resetPasswordRequestSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: passwordRule,
});