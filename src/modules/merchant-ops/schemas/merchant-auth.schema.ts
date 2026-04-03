import { z } from "zod";

const nonEmpty = (message: string) => z.string().trim().min(1, message);

export const merchantLoginSchema = z.object({
  identifier: nonEmpty("Email or phone is required"),
  password: nonEmpty("Password is required"),
});

export const merchantSetPasswordSchema = z.object({
  token: nonEmpty("Activation token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type MerchantLoginInput = z.infer<typeof merchantLoginSchema>;
export type MerchantSetPasswordInput = z.infer<typeof merchantSetPasswordSchema>;
