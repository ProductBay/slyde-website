import { LinkButton } from "@/components/ui/link-button";

const options = [
  {
    href: "/for-businesses/grabquik",
    eyebrow: "Marketplace Growth",
    title: "Grow with GrabQuik",
    body: "Get customer exposure, storefront visibility, and delivery support in one merchant track.",
    bullets: ["Marketplace exposure", "Storefront onboarding", "Delivery included"],
  },
  {
    href: "/for-businesses/slyde",
    eyebrow: "Delivery Operations",
    title: "Use SLYDE for Delivery",
    body: "Keep your Instagram, WhatsApp, website, and existing customer channels while SLYDE handles delivery operations.",
    bullets: ["Keep your current channels", "Manual or assisted dispatch", "Upgrade later if needed"],
  },
];

export function ForBusinessesSplitOptions() {
  return (
    <section className="section-shell pb-12">
      <div className="grid gap-6 lg:grid-cols-2">
        {options.map((option) => (
          <div key={option.href} className="surface-panel p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">{option.eyebrow}</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{option.title}</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">{option.body}</p>
            <div className="mt-6 grid gap-3">
              {option.bullets.map((bullet) => (
                <div key={bullet} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  {bullet}
                </div>
              ))}
            </div>
            <div className="mt-8">
              <LinkButton href={option.href}>{option.title}</LinkButton>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
