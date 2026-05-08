import { z } from "zod";

export const slyderLeadStatusSchema = z.enum([
  "NEW",
  "QUALIFIED",
  "NURTURING",
  "STARTED_APPLICATION",
  "ABANDONED",
  "SUBMITTED",
  "UNDER_REVIEW",
  "APPROVED",
  "ACTIVATED",
  "LIVE",
  "REJECTED",
]);

export type SlyderLeadStatus = z.infer<typeof slyderLeadStatusSchema>;

export const createSlyderLeadSchema = z.object({
  firstName: z.string().trim().min(2, "First name is required"),
  lastName: z.string().trim().optional(),
  email: z.string().trim().email("Valid email is required"),
  whatsapp: z.string().trim().min(7, "WhatsApp number is required"),
  parish: z.string().trim().optional(),
  vehicleType: z.string().trim().optional(),
  source: z.string().trim().optional(),
  referredByCode: z.string().trim().optional(),
  joinAgreementAccepted: z.literal(true, {
    errorMap: () => ({ message: "You must accept the SLYDE Slyder join agreement before reserving your spot." }),
  }),
  agreementIpAddress: z.string().trim().optional(),
  agreementUserAgent: z.string().trim().optional(),
});

export type CreateSlyderLeadInput = z.infer<typeof createSlyderLeadSchema>;

export const updateSlyderLeadSchema = createSlyderLeadSchema.partial().extend({
  status: slyderLeadStatusSchema.optional(),
  qualificationNotes: z.string().trim().optional(),
  lastContactedAt: z.string().datetime().optional(),
  applicationId: z.string().optional(),
  actionCenterTitle: z.string().trim().optional(),
  actionCenterBody: z.string().trim().optional(),
  actionCenterCtaLabel: z.string().trim().optional(),
  actionCenterCtaHref: z.string().trim().optional(),
  actionCenterUpdatedAt: z.string().datetime().optional(),
  applicationInviteUnlocked: z.boolean().optional(),
  applicationInviteUnlockedAt: z.string().datetime().optional(),
});

export type UpdateSlyderLeadInput = z.infer<typeof updateSlyderLeadSchema>;

export const slyderLeadActionCenterSchema = z.object({
  status: slyderLeadStatusSchema.optional(),
  actionCenterTitle: z.string().trim().min(3, "Action title is required"),
  actionCenterBody: z.string().trim().min(8, "Action details are required"),
  actionCenterCtaLabel: z.string().trim().optional(),
  actionCenterCtaHref: z.string().trim().optional(),
  unlockApplicationInvite: z.boolean().default(false),
  notifyEmail: z.boolean().default(true),
  notifyWhatsapp: z.boolean().default(true),
});

export type SlyderLeadActionCenterInput = z.infer<typeof slyderLeadActionCenterSchema>;

export const convertSlyderLeadSchema = z.object({
  leadId: z.string().min(1),
  applicationId: z.string().optional(),
  status: z.enum(["STARTED_APPLICATION", "SUBMITTED"]),
});

export type ConvertSlyderLeadInput = z.infer<typeof convertSlyderLeadSchema>;

export const listSlyderLeadsQuerySchema = z.object({
  status: slyderLeadStatusSchema.optional(),
  parish: z.string().trim().optional(),
  vehicleType: z.string().trim().optional(),
  q: z.string().trim().optional(),
});

export type ListSlyderLeadsQuery = z.infer<typeof listSlyderLeadsQuerySchema>;
