import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalDocumentPage } from "@/components/legal/legal-document-page";
import { getActiveLegalDocumentBySlug } from "@/modules/legal/services/legal-document.service";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata(
  "Privacy",
  "Read the SLYDE public website privacy policy.",
  "/privacy",
);

export default async function PrivacyPage() {
  const document = await getActiveLegalDocumentBySlug("privacy");
  if (!document) notFound();
  return <LegalDocumentPage document={document} />;
}
