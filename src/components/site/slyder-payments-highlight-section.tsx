import { LinkButton } from "@/components/ui/link-button";

export function SlyderPaymentsHighlightSection({
  eyebrow = "Slyder operations",
  title,
  description,
  cards,
  primaryCta,
  secondaryCta,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  cards: Array<{ id: string; title: string; body: string }>;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
}) {
  return (
    <section id="home-slyder-payments" className="section-shell py-12">
      <div className="surface-panel overflow-hidden p-6 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="eyebrow-badge border-sky-100 bg-sky-50 text-sky-700">{eyebrow}</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-[2.4rem]">{title}</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">{description}</p>
            {(primaryCta || secondaryCta) ? (
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                {primaryCta ? <LinkButton href={primaryCta.href} className="w-full sm:w-auto">{primaryCta.label}</LinkButton> : null}
                {secondaryCta ? (
                  <LinkButton href={secondaryCta.href} variant="secondary" className="w-full sm:w-auto">
                    {secondaryCta.label}
                  </LinkButton>
                ) : null}
              </div>
            ) : null}
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {cards.map((card) => (
              <article key={card.id} className="surface-card p-5">
                <h3 className="text-lg font-semibold text-slate-950">{card.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{card.body}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
