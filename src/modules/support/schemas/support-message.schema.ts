import { z } from "zod";

export const supportReplySchema = z.object({
  conversationId: z.string().trim().min(1, "Conversation id is required."),
  senderType: z.enum(["customer", "agent", "ai", "system"]),
  senderId: z.string().trim().optional(),
  body: z.string().trim().min(1, "Message body is required."),
  messageFormat: z.string().trim().default("plain_text"),
  externalMessageId: z.string().trim().optional(),
  aiGenerated: z.boolean().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type SupportReplySchemaInput = z.infer<typeof supportReplySchema>;
