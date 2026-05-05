import { z } from "zod";

export const PAYOUT_STATUSES = ["PENDING", "EARNED", "APPROVED", "PAID", "CANCELLED"] as const;
export type ReferralPayoutStatus = (typeof PAYOUT_STATUSES)[number];

export const PAYOUT_METHODS = ["CASH", "BANK_TRANSFER", "WALLET", "LYNK", "OTHER"] as const;
export type ReferralPayoutMethod = (typeof PAYOUT_METHODS)[number];

export const createReferralPayoutCycleSchema = z.object({
  referralId: z.string().min(1),
  cycleNumber: z.number().int().min(1).max(5),
});
export type CreateReferralPayoutCycleInput = z.infer<typeof createReferralPayoutCycleSchema>;

export const approveReferralPayoutSchema = z.object({
  payoutId: z.string().min(1),
  adminNotes: z.string().optional(),
});
export type ApproveReferralPayoutInput = z.infer<typeof approveReferralPayoutSchema>;

export const markReferralPayoutPaidSchema = z.object({
  payoutId: z.string().min(1),
  payoutMethod: z.enum(PAYOUT_METHODS),
  externalReference: z.string().optional(),
  adminNotes: z.string().optional(),
});
export type MarkReferralPayoutPaidInput = z.infer<typeof markReferralPayoutPaidSchema>;

export const markRentCyclePaidSchema = z.object({
  referralId: z.string().min(1),
  cycleNumber: z.number().int().min(1).max(5),
});
export type MarkRentCyclePaidInput = z.infer<typeof markRentCyclePaidSchema>;

export const slyderReferralPayoutFiltersSchema = z.object({
  status: z.enum(PAYOUT_STATUSES).optional(),
  referralId: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
});
export type SlyderReferralPayoutFilters = z.infer<typeof slyderReferralPayoutFiltersSchema>;
