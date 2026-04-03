import { z } from "zod";

export const supportWebhookSchema = z.object({
  provider: z.string().trim().min(1, "Provider is required."),
  eventType: z.string().trim().min(1, "Event type is required."),
  externalConversationId: z.string().trim().optional(),
  externalTicketId: z.string().trim().optional(),
  externalMessageId: z.string().trim().optional(),
  status: z.string().trim().optional(),
  priority: z.string().trim().optional(),
  senderType: z.enum(["customer", "agent", "ai", "system"]).optional(),
  messageBody: z.string().trim().optional(),
  occurredAt: z.string().trim().min(1, "Occurrence time is required."),
  raw: z.record(z.string(), z.unknown()),
});

export type SupportWebhookSchemaInput = z.infer<typeof supportWebhookSchema>;
