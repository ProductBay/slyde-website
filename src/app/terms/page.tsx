import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalDocumentPage } from "@/components/legal/legal-document-page";
import { getActiveLegalDocumentBySlug } from "@/modules/legal/services/legal-document.service";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata(
  "Terms",
  "Read the SLYDE public website terms of use.",
  "/terms",
);

export default async function TermsPage() {
  const document = await getActiveLegalDocumentBySlug("terms");
  if (!document) notFound();
  return <LegalDocumentPage document={document} />;
}
