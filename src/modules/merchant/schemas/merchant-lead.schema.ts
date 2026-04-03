import { z } from "zod";

const nonEmpty = (message: string) => z.string().trim().min(1, message);

export const merchantProductIntentSchema = z.enum(["grabquik", "slyde_delivery", "both"]);

export const merchantLeadSchema = z.object({
  businessName: nonEmpty("Business name is required."),
  contactName: nonEmpty("Contact name is required."),
  phone: nonEmpty("Phone is required."),
  email: z.string().trim().email("Enter a valid email address."),
  parish: nonEmpty("Parish is required."),
  town: nonEmpty("Town is required."),
  category: nonEmpty("Business category is required."),
  instagramHandle: z.string().trim().max(120).optional(),
  website: z.string().trim().url("Enter a valid website URL.").optional().or(z.literal("")),
  orderChannels: z.array(nonEmpty("Order channel is required.")).min(1, "Select at least one order channel."),
  averageDailyOrders: z.string().trim().max(80).optional(),
  currentDeliveryMethod: z.string().trim().max(120).optional(),
  preferredStartTimeline: z.string().trim().max(120).optional(),
  productIntent: merchantProductIntentSchema,
  notes: z.string().trim().max(600).optional(),
});

export const merchantLeadFiltersSchema = z.object({
  status: z.enum(["submitted", "reviewing", "qualified", "rejected"]).optional(),
  parish: z.string().trim().optional(),
  productIntent: merchantProductIntentSchema.optional(),
  search: z.string().trim().optional(),
});

export type MerchantLeadInput = z.infer<typeof merchantLeadSchema>;
export type MerchantLeadFiltersInput = z.infer<typeof merchantLeadFiltersSchema>;
