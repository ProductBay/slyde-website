import { z } from "zod";

const coordinateValueSchema = z.coerce.number().refine((value) => Number.isFinite(value), "Enter a valid coordinate.");

const optionalPointSchema = z
  .object({
    lat: coordinateValueSchema,
    lng: coordinateValueSchema,
    label: z.string().trim().max(120).optional(),
  })
  .optional();

export const merchantLocationUpdateSchema = z.object({
  riderLocation: optionalPointSchema,
  pickupLocation: optionalPointSchema,
  destinationLocation: optionalPointSchema,
  etaToPickupMinutes: z.coerce.number().int().min(0).max(24 * 60).optional(),
  etaToDeliveryMinutes: z.coerce.number().int().min(0).max(7 * 24 * 60).optional(),
  notes: z.string().trim().max(500).optional(),
});

export type MerchantLocationUpdateInput = z.infer<typeof merchantLocationUpdateSchema>;
