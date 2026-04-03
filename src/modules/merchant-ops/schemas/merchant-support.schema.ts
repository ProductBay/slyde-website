import { z } from "zod";

const nonEmpty = (message: string) => z.string().trim().min(1, message);

export const merchantSupportSchema = z.object({
  topic: nonEmpty("Topic is required"),
  priority: z.enum(["normal", "urgent"]).default("normal"),
  message: nonEmpty("Message is required").max(1000, "Message is too long"),
  relatedOrderId: z.string().trim().optional(),
  relatedDeliveryId: z.string().trim().optional(),
});

export type MerchantSupportInput = z.infer<typeof merchantSupportSchema>;
