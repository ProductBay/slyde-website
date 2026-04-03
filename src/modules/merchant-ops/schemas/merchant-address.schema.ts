import { z } from "zod";

const nonEmpty = (message: string) => z.string().trim().min(1, message);

export const merchantAddressSchema = z.object({
  type: z.enum(["pickup", "customer", "branch"]),
  label: nonEmpty("Label is required"),
  contactName: nonEmpty("Contact name is required"),
  contactPhone: nonEmpty("Contact phone is required"),
  addressLine: nonEmpty("Address is required"),
  parish: nonEmpty("Parish is required"),
  town: nonEmpty("Town is required"),
  notes: z.string().trim().max(300).optional(),
  isDefault: z.boolean().optional(),
});

export const merchantAddressDefaultSchema = z.object({
  id: nonEmpty("Address id is required"),
});

export type MerchantAddressInput = z.infer<typeof merchantAddressSchema>;
