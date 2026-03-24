import { z } from "zod";
import { notificationActorTypes, notificationChannels, notificationStatuses } from "@/types/backend/onboarding";

export const notificationLogListQuerySchema = z.object({
  channel: z.enum(notificationChannels).optional(),
  status: z.enum(notificationStatuses).optional(),
  template: z.string().trim().optional(),
  actorType: z.enum(notificationActorTypes).optional(),
  search: z.string().trim().optional(),
});

export const updateNotificationTemplateSchema = z.object({
  name: z.string().trim().min(2).optional(),
  subject: z.string().trim().optional(),
  bodyTemplate: z.string().trim().min(8).optional(),
  plainTextTemplate: z.string().trim().optional(),
  isActive: z.boolean().optional(),
  description: z.string().trim().optional(),
});

