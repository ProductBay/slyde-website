import { z } from "zod";

export const supportConversationCreateSchema = z.object({
  channel: z.enum(["web_chat", "email", "whatsapp", "phone", "internal_note"]),
  domain: z.enum(["public", "merchant", "slyder", "employee", "referrer", "admin"]),
  priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
  subject: z.string().trim().min(1, "Subject is required."),
  externalProvider: z.string().trim().optional(),
  externalConversationId: z.string().trim().optional(),
  externalTicketId: z.string().trim().optional(),
  userId: z.string().trim().optional(),
  merchantId: z.string().trim().optional(),
  slyderProfileId: z.string().trim().optional(),
  employeeProfileId: z.string().trim().optional(),
  referrerAccountId: z.string().trim().optional(),
  assignedTeam: z.string().trim().optional(),
  assignedAgentId: z.string().trim().optional(),
});

export const supportConversationUpdateSchema = z.object({
  status: z.enum(["open", "waiting_on_user", "waiting_on_agent", "resolved", "closed"]).optional(),
  priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
  assignedTeam: z.string().trim().optional(),
  assignedAgentId: z.string().trim().optional(),
});

export type SupportConversationCreateSchemaInput = z.infer<typeof supportConversationCreateSchema>;
export type SupportConversationUpdateSchemaInput = z.infer<typeof supportConversationUpdateSchema>;
