import { z } from "zod";
import { publicSlyderReferralStatuses, referralRewardStatuses } from "@/types/backend/onboarding";

const nonEmpty = (message: string) => z.string().trim().min(1, message);

export const publicReferralSubmissionSchema = z
  .object({
    referrerName: nonEmpty("Referrer name is required"),
    referrerPhone: nonEmpty("Referrer phone is required"),
    referrerEmail: z.string().trim().email("Valid referrer email is required").optional().or(z.literal("")),
    referredName: nonEmpty("Referred driver name is required"),
    referredEmail: z.string().trim().email("Valid referred driver email is required").optional().or(z.literal("")),
    referredPhone: nonEmpty("Referred driver phone is required"),
    referredParish: z.string().trim().max(120, "Parish must be 120 characters or less").optional(),
    referredTown: z.string().trim().max(120, "Town must be 120 characters or less").optional(),
    referredVehicleType: z.string().trim().max(120, "Vehicle type must be 120 characters or less").optional(),
    notes: z.string().trim().max(600, "Notes must be 600 characters or less").optional(),
  })
  .superRefine((input, ctx) => {
    const samePhone = input.referrerPhone.replace(/[^\d+]/g, "") === input.referredPhone.replace(/[^\d+]/g, "");

    if (samePhone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["referredPhone"],
        message: "Self-referrals are not allowed.",
      });
    }
  });

export const referralLookupSchema = z.object({
  referralCode: nonEmpty("Referral code is required"),
});

export const adminReferralFiltersSchema = z.object({
  status: z.enum(publicSlyderReferralStatuses).optional(),
  parish: z.string().trim().optional(),
  rewardStatus: z.enum(referralRewardStatuses).optional(),
  duplicateFlagged: z.coerce.boolean().optional(),
  dateFrom: z.string().trim().optional(),
  dateTo: z.string().trim().optional(),
  search: z.string().trim().optional(),
});

export const adminReferralDisqualifySchema = z.object({
  reason: nonEmpty("Disqualification reason is required").max(300, "Reason must be 300 characters or less"),
});

export const adminReferralLinkApplicationSchema = z.object({
  applicationId: nonEmpty("Application id is required"),
});

export const adminReferralMarkFirstDeliverySchema = z.object({
  notes: z.string().trim().max(300, "Notes must be 300 characters or less").optional(),
});

export type PublicReferralSubmissionSchemaInput = z.infer<typeof publicReferralSubmissionSchema>;
export type ReferralLookupInput = z.infer<typeof referralLookupSchema>;
export type AdminReferralFiltersInput = z.infer<typeof adminReferralFiltersSchema>;
export type AdminReferralDisqualifyInput = z.infer<typeof adminReferralDisqualifySchema>;
export type AdminReferralLinkApplicationInput = z.infer<typeof adminReferralLinkApplicationSchema>;
export type AdminReferralMarkFirstDeliveryInput = z.infer<typeof adminReferralMarkFirstDeliverySchema>;
