import { z } from "zod";

const nonEmpty = (message: string) => z.string().trim().min(1, message);

const operatingHoursSchema = z
  .object({
    days: z.array(z.string().trim().min(1)).optional(),
    openTime: z.string().trim().optional(),
    closeTime: z.string().trim().optional(),
    summary: z.string().trim().optional(),
  })
  .passthrough()
  .optional();

export const merchantTrackSchema = z.enum(["grabquik", "slyde_delivery", "both"]);
export const merchantDispatchModeSchema = z.enum(["manual_dashboard", "whatsapp_assisted", "api_later"]);

export const grabquikApplicationSchema = z.object({
  merchantLeadId: nonEmpty("Merchant lead id is required."),
  onboardingTrack: merchantTrackSchema.default("grabquik"),
  storeName: nonEmpty("Store name is required."),
  logoUrl: z.string().trim().url("Enter a valid logo URL.").optional().or(z.literal("")),
  businessDescription: nonEmpty("Business description is required."),
  category: nonEmpty("Category is required."),
  operatingHours: operatingHoursSchema,
  pickupAddress: nonEmpty("Pickup address is required."),
  serviceAreas: z.array(nonEmpty("Service area is required.")).default([]),
  fulfillmentMode: nonEmpty("Fulfillment type is required."),
  catalogReady: z.boolean(),
  payoutDetails: z.record(z.string(), z.unknown()).optional(),
  legalAccepted: z.boolean().refine((value) => value, "Legal acceptance is required."),
});

export const slydeMerchantApplicationSchema = z.object({
  merchantLeadId: nonEmpty("Merchant lead id is required."),
  onboardingTrack: merchantTrackSchema.default("slyde_delivery"),
  pickupAddress: nonEmpty("Pickup address is required."),
  serviceAreas: z.array(nonEmpty("Service area is required.")).default([]),
  fulfillmentMode: z.string().trim().optional(),
  orderSources: z.array(nonEmpty("Order source is required.")).min(1, "Select at least one order source."),
  dispatchMode: merchantDispatchModeSchema,
  pickupLocations: z.array(nonEmpty("Pickup location is required.")).min(1, "Add at least one pickup location."),
  deliveryRadius: nonEmpty("Delivery radius is required."),
  packageTypes: z.array(nonEmpty("Package type is required.")).min(1, "Add at least one package type."),
  averageOrderSize: z.string().trim().max(80).optional(),
  operatingHours: operatingHoursSchema,
  sameDaySupported: z.boolean(),
  scheduledSupported: z.boolean(),
  acceptsCOD: z.boolean(),
});

export const merchantApplicationFiltersSchema = z.object({
  approvalStatus: z.enum(["pending", "approved", "rejected"]).optional(),
  activationStatus: z.enum(["pending", "activated", "live", "paused"]).optional(),
  onboardingTrack: merchantTrackSchema.optional(),
  parish: z.string().trim().optional(),
  assignedAdminId: z.string().trim().optional(),
  search: z.string().trim().optional(),
});

export const merchantAssignAdminSchema = z.object({
  assignedAdminId: z.string().trim().min(1, "Assigned admin id is required."),
});

export const merchantRejectSchema = z.object({
  notes: z.string().trim().min(1, "Rejection reason is required.").max(400),
});

export const merchantActivateSchema = z.object({
  activationStatus: z.enum(["activated", "live", "paused"]).default("activated"),
  notes: z.string().trim().max(400).optional(),
});

export type GrabquikApplicationInput = z.infer<typeof grabquikApplicationSchema>;
export type SlydeMerchantApplicationInput = z.infer<typeof slydeMerchantApplicationSchema>;
export type MerchantApplicationFiltersInput = z.infer<typeof merchantApplicationFiltersSchema>;
export type MerchantAssignAdminInput = z.infer<typeof merchantAssignAdminSchema>;
export type MerchantRejectInput = z.infer<typeof merchantRejectSchema>;
export type MerchantActivateInput = z.infer<typeof merchantActivateSchema>;
