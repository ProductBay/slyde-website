import { z } from "zod";

const nonEmpty = (message: string) => z.string().trim().min(1, message);

export const claimRewardSchema = z.object({
  referralId: z.string().trim().optional(),
  referralCode: z.string().trim().optional(),
  customerAccountId: nonEmpty("Customer account id is required"),
  phone: nonEmpty("Customer phone is required"),
}).refine((input) => Boolean(input.referralId || input.referralCode), {
  message: "Referral id or referral code is required",
  path: ["referralCode"],
});

export const giftRewardSchema = z.object({
  referralId: z.string().trim().optional(),
  referralCode: z.string().trim().optional(),
  recipientCustomerAccountId: nonEmpty("Recipient customer account id is required"),
  recipientPhone: nonEmpty("Recipient phone is required"),
}).refine((input) => Boolean(input.referralId || input.referralCode), {
  message: "Referral id or referral code is required",
  path: ["referralCode"],
});

export const adminRewardExpirySchema = z.object({
  notes: z.string().trim().max(300).optional(),
});

export type ClaimRewardInput = z.infer<typeof claimRewardSchema>;
export type GiftRewardInput = z.infer<typeof giftRewardSchema>;
export type AdminRewardExpiryInput = z.infer<typeof adminRewardExpirySchema>;
