import { z } from "zod";

const nonEmpty = (message: string) => z.string().trim().min(1, message);

export const partnerCarrierSchema = z.object({
  name: nonEmpty("Carrier name is required"),
  slug: nonEmpty("Carrier slug is required"),
  type: z.enum(["branch_network", "courier", "express"]),
  supportsTracking: z.boolean().default(false),
  supportsApi: z.boolean().default(false),
  supportsFinalDelivery: z.boolean().default(false),
  supportsBranchCollection: z.boolean().default(false),
  active: z.boolean().default(true),
  contactConfig: z.record(z.string(), z.unknown()).optional(),
  trackingConfig: z.record(z.string(), z.unknown()).optional(),
  webhookConfig: z.record(z.string(), z.unknown()).optional(),
});

export const partnerHandoffLocationSchema = z.object({
  partnerCarrierId: nonEmpty("Partner carrier is required"),
  name: nonEmpty("Location name is required"),
  parish: nonEmpty("Parish is required"),
  town: nonEmpty("Town is required"),
  addressLine: nonEmpty("Address is required"),
  openingHours: z.record(z.string(), z.unknown()).optional(),
  active: z.boolean().default(true),
});

export const manualPartnerTrackingSchema = z.object({
  deliveryLegId: nonEmpty("Delivery leg is required"),
  partnerCarrierId: nonEmpty("Partner carrier is required"),
  externalTrackingReference: z.string().trim().optional(),
  rawStatus: nonEmpty("Raw status is required"),
  normalizedStatus: z.enum([
    "pending",
    "scheduled",
    "in_progress",
    "handed_off",
    "accepted",
    "in_transit",
    "arrived",
    "ready_for_collection",
    "out_for_delivery",
    "completed",
    "failed",
    "cancelled",
    "submitted",
    "pickup_scheduled",
    "picked_up_by_slyde",
    "dropped_at_partner",
    "accepted_by_partner",
    "in_interparish_transit",
    "arrived_at_destination_hub",
    "out_for_final_delivery",
    "delivered",
  ]),
  notes: z.string().trim().max(500).optional(),
  eventTimestamp: z.string().trim().optional(),
});

export type PartnerCarrierInput = z.infer<typeof partnerCarrierSchema>;
export type PartnerHandoffLocationSchemaInput = z.infer<typeof partnerHandoffLocationSchema>;
export type ManualPartnerTrackingSchemaInput = z.infer<typeof manualPartnerTrackingSchema>;
