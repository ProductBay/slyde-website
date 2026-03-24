import { z } from "zod";
import { legalDocumentStatuses, legalDocumentTypes } from "@/types/backend/onboarding";

const nonEmpty = (message: string) => z.string().trim().min(1, message);

export const createLegalDocumentSchema = z.object({
  documentType: z.enum(legalDocumentTypes),
  version: nonEmpty("Version is required"),
  title: nonEmpty("Title is required").optional(),
  slug: nonEmpty("Slug is required").optional(),
  summary: z.string().trim().optional(),
  excerpt: z.string().trim().optional(),
  contentMarkdown: nonEmpty("Content is required"),
});

export const updateLegalDocumentSchema = z.object({
  title: nonEmpty("Title is required").optional(),
  slug: nonEmpty("Slug is required").optional(),
  version: nonEmpty("Version is required").optional(),
  summary: z.string().trim().optional(),
  excerpt: z.string().trim().optional(),
  effectiveFrom: z.string().trim().optional(),
  contentMarkdown: nonEmpty("Content is required").optional(),
});

export const legalDocumentActionSchema = z.object({
  note: z.string().trim().optional(),
  nextVersion: z.string().trim().optional(),
});

export const legalDocumentListQuerySchema = z.object({
  category: z.string().trim().optional(),
  documentType: z.enum(legalDocumentTypes).optional(),
  status: z.enum(legalDocumentStatuses).optional(),
  active: z.enum(["true", "false"]).optional(),
  actorScope: z.string().trim().optional(),
});
