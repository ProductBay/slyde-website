import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/metadata";
import { getLegalIndex } from "@/modules/legal/services/legal-document.service";

export const metadata: Metadata = buildMetadata(
  "Legal",
  "Browse SLYDE legal documents for Slyders, merchants, and general website policies.",
  "/legal",
);

export default async function LegalIndexPage() {
  const categories = await getLegalIndex();

  return (
    <section className="section-shell py-16">
      <div className="max-w-3xl">
        <p className="eyebrow-badge border-sky-100 bg-sky-50 text-sky-700">Legal Center</p>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-950">Legal documents and policy pages</h1>
        <p className="mt-4 text-base leading-8 text-slate-600">
          This page groups the current SLYDE legal documents by audience so applicants, merchants, and public website users can review the active terms and notices in one place.
        </p>
      </div>

      <div className="mt-12 grid gap-8">
        {categories.map((category) => (
          <section key={category.key} className="surface-panel p-6 sm:p-8">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">{category.name}</p>
              <p className="mt-3 text-sm leading-7 text-slate-600">{category.description}</p>
            </div>
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {category.documents.map((document) => (
                <Link key={document.id} href={`/legal/${document.slug}`} className="surface-card p-5 transition hover:-translate-y-1">
                  <h2 className="text-lg font-semibold text-slate-950">{document.title}</h2>
                  {document.summary ? <p className="mt-3 text-sm leading-7 text-slate-600">{document.summary}</p> : null}
                  <div className="mt-4 flex flex-wrap gap-3 text-xs uppercase tracking-[0.16em] text-slate-500">
                    <span>Version {document.version}</span>
                    <span>{document.effectiveFrom ? `Effective ${new Date(document.effectiveFrom).toLocaleDateString("en-JM")}` : "Current"}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}
