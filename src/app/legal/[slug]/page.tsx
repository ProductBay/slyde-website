import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalDocumentPage } from "@/components/legal/legal-document-page";
import { getActiveLegalDocumentBySlug } from "@/modules/legal/services/legal-document.service";
import { buildMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const document = await getActiveLegalDocumentBySlug(slug);
  if (!document) {
    return buildMetadata("Legal", "SLYDE legal document", `/legal/${slug}`);
  }
  return buildMetadata(document.title, document.summary || document.excerpt || "SLYDE legal document", `/legal/${slug}`);
}

export default async function LegalDocumentRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const document = await getActiveLegalDocumentBySlug(slug);
  if (!document) notFound();

  return <LegalDocumentPage document={document} />;
}
