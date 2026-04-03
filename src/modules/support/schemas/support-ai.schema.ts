import { z } from "zod";

export const supportAiRequestSchema = z.object({
  conversationId: z.string().trim().min(1, "Conversation id is required."),
  domain: z.enum(["public", "merchant", "slyder", "employee", "referrer", "admin"]),
  userMessage: z.string().trim().min(1, "User message is required."),
  userProfile: z
    .object({
      userId: z.string().trim().optional(),
      role: z.string().trim().optional(),
      fullName: z.string().trim().optional(),
      email: z.string().trim().optional(),
    })
    .optional(),
  linkedEntities: z
    .object({
      merchantId: z.string().trim().optional(),
      merchantApplicationId: z.string().trim().optional(),
      deliveryId: z.string().trim().optional(),
      orderId: z.string().trim().optional(),
      referralId: z.string().trim().optional(),
      slyderProfileId: z.string().trim().optional(),
      employeeProfileId: z.string().trim().optional(),
    })
    .optional(),
  contextSnapshots: z.array(
    z.object({
      type: z.string().trim().min(1),
      payload: z.record(z.string(), z.unknown()),
    }),
  ),
  knowledgeMatches: z.array(
    z.object({
      title: z.string().trim().min(1),
      snippet: z.string().trim().min(1),
      sourceId: z.string().trim().min(1),
    }),
  ),
});

export type SupportAiRequestSchemaInput = z.infer<typeof supportAiRequestSchema>;
