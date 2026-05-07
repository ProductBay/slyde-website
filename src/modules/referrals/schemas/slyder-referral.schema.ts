import { z } from "zod";

export const REFERRAL_STATUSES = [
  "PENDING",
  "LEAD_CAPTURED",
  "APPLICATION_STARTED",
  "APPLICATION_SUBMITTED",
  "APPROVED",
  "ACTIVATED",
  "LIVE",
  "REWARD_ACTIVE",
  "PARTIAL_PAID",
  "PAID_OUT",
  "CANCELLED",
  "REJECTED",
  "EXPIRED",
] as const;

export type ReferralStatus = (typeof REFERRAL_STATUSES)[number];

export const REFERRER_TYPES = ["PUBLIC", "SLYDER", "ADMIN", "MERCHANT"] as const;
export type ReferralReferrerType = (typeof REFERRER_TYPES)[number];

// ─── Public referral creation ────────────────────────────────
export const createPublicReferralSchema = z.object({
  referrerName: z.string().min(2, "Name must be at least 2 characters"),
  referrerWhatsapp: z.string().min(7, "WhatsApp number is required"),
  referrerEmail: z.string().email("A valid email is required so you can access your referrer dashboard"),
  referredFirstName: z.string().optional(),
  referredLastName: z.string().optional(),
  referredWhatsapp: z.string().optional(),
  referredEmail: z.string().email().optional().or(z.literal("")),
  referralAgreementAccepted: z.literal(true, {
    errorMap: () => ({ message: "You must accept the SLYDE Slyder referral agreement before creating a referral link." }),
  }),
  agreementIpAddress: z.string().optional(),
  agreementUserAgent: z.string().optional(),
  source: z.string().optional(),
});
export type CreatePublicReferralInput = z.infer<typeof createPublicReferralSchema>;

// ─── Slyder referral creation (authenticated) ────────────────
export const createSlyderReferralSchema = z.object({
  referredFirstName: z.string().optional(),
  referredLastName: z.string().optional(),
  referredWhatsapp: z.string().optional(),
  referredEmail: z.string().email().optional().or(z.literal("")),
});
export type CreateSlyderReferralInput = z.infer<typeof createSlyderReferralSchema>;

// ─── Attach to lead ──────────────────────────────────────────
export const attachReferralToLeadSchema = z.object({
  referralCode: z.string().min(1),
  leadId: z.string().min(1),
  referredFirstName: z.string().optional(),
  referredLastName: z.string().optional(),
  referredWhatsapp: z.string().optional(),
  referredEmail: z.string().email().optional().or(z.literal("")),
});
export type AttachReferralToLeadInput = z.infer<typeof attachReferralToLeadSchema>;

// ─── Attach to application ───────────────────────────────────
export const attachReferralToApplicationSchema = z.object({
  referralCode: z.string().min(1),
  applicationId: z.string().min(1),
});
export type AttachReferralToApplicationInput = z.infer<typeof attachReferralToApplicationSchema>;

// ─── Admin status update ─────────────────────────────────────
export const updateReferralStatusSchema = z.object({
  status: z.enum(REFERRAL_STATUSES),
  adminNotes: z.string().optional(),
});
export type UpdateReferralStatusInput = z.infer<typeof updateReferralStatusSchema>;

// ─── Referral code lookup ────────────────────────────────────
export const referralCodeLookupSchema = z.object({
  referralCode: z.string().min(1),
});
export type ReferralCodeLookupInput = z.infer<typeof referralCodeLookupSchema>;

// ─── Admin list filters ──────────────────────────────────────
export const slyderReferralFiltersSchema = z.object({
  status: z.enum(REFERRAL_STATUSES).optional(),
  referrerType: z.enum(REFERRER_TYPES).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
});
export type SlyderReferralFilters = z.infer<typeof slyderReferralFiltersSchema>;
