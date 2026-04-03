import { z } from "zod";

export const outOfParishFieldsSchema = z.object({
  deliveryType: z.enum(["in_parish", "out_of_parish"]).default("in_parish"),
  destinationParish: z.string().trim().optional(),
  destinationTown: z.string().trim().optional(),
  transferPartnerId: z.string().trim().optional(),
  partnerHandoffLocationId: z.string().trim().optional(),
  finalFulfillmentMethod: z.enum(["customer_collection", "partner_final_delivery", "slyde_final_mile"]).optional(),
  packageValue: z.coerce.number().nonnegative().optional(),
  specialHandlingNotes: z.string().trim().max(500).optional(),
});

export type OutOfParishFieldsInput = z.infer<typeof outOfParishFieldsSchema>;
