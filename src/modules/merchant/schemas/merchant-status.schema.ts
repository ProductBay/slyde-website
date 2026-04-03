import { z } from "zod";

const nonEmpty = (message: string) => z.string().trim().min(1, message);

export const merchantStatusLookupSchema = z.object({
  email: z.string().trim().email("Enter a valid email address.").optional(),
  phone: nonEmpty("Phone number is required.").optional(),
  token: z.string().trim().min(1, "Status token is required.").optional(),
}).superRefine((input, ctx) => {
  if (input.token) return;
  if (!input.email) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["email"], message: "Enter a valid email address." });
  }
  if (!input.phone) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["phone"], message: "Phone number is required." });
  }
});

export const merchantApplicantReplySchema = z.object({
  applicationId: nonEmpty("Application id is required."),
  email: z.string().trim().email("Enter a valid email address."),
  phone: nonEmpty("Phone number is required."),
  message: z.string().trim().min(10, "Share a bit more detail so SLYDE can review it.").max(2000),
});

export const merchantRequestInfoSchema = z.object({
  notes: z.string().trim().min(10, "Add a clear request so the merchant knows what to send.").max(2000),
});

export type MerchantStatusLookupInput = z.infer<typeof merchantStatusLookupSchema>;
export type MerchantApplicantReplyInput = z.infer<typeof merchantApplicantReplySchema>;
export type MerchantRequestInfoInput = z.infer<typeof merchantRequestInfoSchema>;
