import type { LegalDocument } from "@/types/backend/onboarding";

export function LegalDocumentPage({ document }: { document: LegalDocument }) {
  const paragraphs = document.contentMarkdown.split(/\n\n+/).filter(Boolean);

  return (
    <section className="mx-auto max-w-reading px-4 py-16 sm:px-6 lg:px-8">
      <p className="eyebrow-badge border-sky-100 bg-sky-50 text-sky-700">Legal Document</p>
      <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-950">{document.title}</h1>
      <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-500">
        <span>Version {document.version}</span>
        <span>Published {document.publishedAt ? new Date(document.publishedAt).toLocaleDateString("en-JM") : "Draft"}</span>
      </div>
      {document.summary ? <p className="mt-6 text-base leading-8 text-slate-600">{document.summary}</p> : null}
      <div className="mt-10 space-y-6 text-sm leading-8 text-slate-600">
        {paragraphs.map((paragraph, index) => (
          <p key={`${document.id}-${index}`}>{paragraph}</p>
        ))}
      </div>
    </section>
  );
}
