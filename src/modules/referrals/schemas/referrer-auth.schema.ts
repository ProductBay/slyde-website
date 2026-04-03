import { z } from "zod";

const emailSchema = z.string().trim().email("Enter a valid email address.");

export const referrerRequestCodeSchema = z.object({
  email: emailSchema,
  displayName: z.string().trim().max(120, "Display name must be 120 characters or less.").optional(),
});

export const referrerVerifyCodeSchema = z.object({
  challengeId: z.string().trim().min(1, "Challenge id is required."),
  email: emailSchema,
  code: z.string().trim().length(6, "Enter the 6-digit code."),
});

export type ReferrerRequestCodeInput = z.infer<typeof referrerRequestCodeSchema>;
export type ReferrerVerifyCodeInput = z.infer<typeof referrerVerifyCodeSchema>;
