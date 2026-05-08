import { z } from "zod";

export const fleetLeadStatusSchema = z.enum([
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "PARTNERSHIP_REVIEW",
  "APPROVED",
  "NOT_READY",
  "ARCHIVED",
]);

export const createFleetLeadSchema = z.object({
  ownerName: z.string().trim().min(2, "Owner name is required"),
  companyName: z.string().trim().min(2, "Company name is required"),
  whatsapp: z.string().trim().min(7, "WhatsApp number is required"),
  email: z.string().trim().email("Valid email is required").optional().or(z.literal("")),
  parish: z.string().trim().optional(),
  operatingAreas: z.array(z.string().trim().min(1)).default([]),
  fleetSize: z.string().trim().optional(),
  driverCount: z.string().trim().optional(),
  vehicleTypes: z.array(z.string().trim().min(1)).default([]),
  hasDispatchSystem: z.string().trim().optional(),
  partnershipInterest: z.string().trim().optional(),
  notes: z.string().trim().max(600).optional(),
});

export const updateFleetLeadSchema = createFleetLeadSchema.partial().extend({
  status: fleetLeadStatusSchema.optional(),
  contactedAt: z.string().datetime().optional(),
});

export const listFleetLeadsQuerySchema = z.object({
  status: fleetLeadStatusSchema.optional(),
  parish: z.string().trim().optional(),
  q: z.string().trim().optional(),
});

export type FleetLeadStatus = z.infer<typeof fleetLeadStatusSchema>;
export type CreateFleetLeadInput = z.infer<typeof createFleetLeadSchema>;
export type UpdateFleetLeadInput = z.infer<typeof updateFleetLeadSchema>;
export type ListFleetLeadsQuery = z.infer<typeof listFleetLeadsQuerySchema>;
