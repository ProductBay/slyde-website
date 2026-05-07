import { z } from "zod";

export const vehicleBrandingLeadStatusSchema = z.enum([
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "PRICING_SENT",
  "APPROVED",
  "SCHEDULED",
  "COMPLETED",
  "NOT_READY",
  "ARCHIVED",
]);

export type VehicleBrandingLeadStatus = z.infer<typeof vehicleBrandingLeadStatusSchema>;

export const createVehicleBrandingLeadSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required"),
  whatsapp: z.string().trim().min(7, "WhatsApp number is required"),
  email: z.string().trim().email("Valid email is required").optional().or(z.literal("")),
  currentSlyderStatus: z.string().trim().optional(),
  vehicleType: z.string().trim().optional(),
  brandingInterest: z.array(z.string()).default([]),
  parish: z.string().trim().optional(),
  notes: z.string().trim().max(500).optional(),
});

export type CreateVehicleBrandingLeadInput = z.infer<typeof createVehicleBrandingLeadSchema>;

export const updateVehicleBrandingLeadSchema =
  createVehicleBrandingLeadSchema.partial().extend({
    status: vehicleBrandingLeadStatusSchema.optional(),
    contactedAt: z.string().datetime().optional(),
  });

export type UpdateVehicleBrandingLeadInput = z.infer<typeof updateVehicleBrandingLeadSchema>;

export const listVehicleBrandingLeadsQuerySchema = z.object({
  status: vehicleBrandingLeadStatusSchema.optional(),
  parish: z.string().trim().optional(),
  q: z.string().trim().optional(),
});

export type ListVehicleBrandingLeadsQuery = z.infer<typeof listVehicleBrandingLeadsQuerySchema>;
