import { z } from "zod";

export const slyderLeadPostCategorySchema = z.enum([
  "ANNOUNCEMENT",
  "PROMOTION",
  "LAUNCH_UPDATE",
  "REMINDER",
  "EDUCATION",
]);

export const createSlyderLeadPostSchema = z.object({
  title: z.string().trim().min(3, "Title is required"),
  body: z.string().trim().min(8, "Post details are required"),
  category: slyderLeadPostCategorySchema.default("ANNOUNCEMENT"),
  imageUrl: z.string().trim().optional(),
  ctaLabel: z.string().trim().optional(),
  ctaHref: z.string().trim().optional(),
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
});

export const updateSlyderLeadPostSchema = createSlyderLeadPostSchema.partial();

export type CreateSlyderLeadPostInput = z.infer<typeof createSlyderLeadPostSchema>;
export type UpdateSlyderLeadPostInput = z.infer<typeof updateSlyderLeadPostSchema>;
