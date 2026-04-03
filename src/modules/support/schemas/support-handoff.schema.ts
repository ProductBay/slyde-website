import { z } from "zod";

export const supportHandoffSchema = z.object({
  conversationId: z.string().trim().min(1, "Conversation id is required."),
  reason: z.string().trim().min(1, "Handoff reason is required."),
  summary: z.string().trim().min(1, "Handoff summary is required."),
  recommendedTeam: z.string().trim().min(1, "Recommended team is required."),
  confidenceScore: z.number().min(0).max(1).optional(),
});

export type SupportHandoffSchemaInput = z.infer<typeof supportHandoffSchema>;
