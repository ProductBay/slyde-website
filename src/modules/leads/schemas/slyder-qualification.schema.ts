import { z } from "zod";

export const createSlyderQualificationSchema = z.object({
  leadId: z.string().min(1),
  hasVehicle: z.boolean().optional(),
  hasSmartphone: z.boolean().optional(),
  usesWhatsapp: z.boolean().optional(),
  hasDataAccess: z.boolean().optional(),
  availableWeekly: z.boolean().optional(),
  preferredZones: z.array(z.string()).default([]),
  preferredSchedule: z.string().trim().optional(),
  deliveryExperience: z.string().trim().optional(),
  readinessLevel: z.string().trim().optional(),
});

export type CreateSlyderQualificationInput = z.infer<typeof createSlyderQualificationSchema>;
