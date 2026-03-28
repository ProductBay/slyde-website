import { z } from "zod";

const nonEmpty = (message: string) => z.string().trim().min(1, message);

export const adminLoginSchema = z.object({
  identifier: nonEmpty("Email or phone is required"),
  password: nonEmpty("Password is required"),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
