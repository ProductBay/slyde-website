import { SectionHeading } from "@/components/site/section-heading";
import { LinkButton } from "@/components/ui/link-button";

export function FundedErrandsExplainer({
  sectionId,
  title,
  description,
  points,
  cta,
}: {
  sectionId: string;
  title: string;
  description: string;
  points?: Array<{ id: string; title: string; body: string }>;
  cta?: { label: string; href: string };
}) {
  return (
    <section id={sectionId} className="section-shell py-16">
      <div className="surface-panel p-8">
        <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
          <SectionHeading eyebrow="Structured errands" title={title} description={description} />
          <div>
            {points?.length ? (
              <div className="grid gap-4 md:grid-cols-3">
                {points.map((point) => (
                  <div key={point.id} className="surface-card p-5">
                    <h3 className="text-lg font-semibold text-slate-950">{point.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{point.body}</p>
                  </div>
                ))}
              </div>
            ) : null}
            {cta ? (
              <div className="mt-6">
                <LinkButton href={cta.href}>{cta.label}</LinkButton>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
