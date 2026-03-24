import type { ReactNode } from "react";
import type { CtaLink } from "@/types/site";
import { LinkButton } from "@/components/ui/link-button";

export function HeroSection({
  eyebrow,
  title,
  description,
  supportText,
  actions,
  aside,
  metrics,
}: {
  eyebrow: string;
  title: string;
  description: string;
  supportText?: string;
  actions: CtaLink[];
  aside?: ReactNode;
  metrics?: Array<{ value: string; label: string }>;
}) {
  return (
    <section className="section-shell py-8 sm:py-10 lg:py-12">
      <div className="relative overflow-hidden rounded-[2.25rem] border border-white/50 bg-[linear-gradient(135deg,rgba(255,255,255,0.97),rgba(240,247,252,0.92))] px-5 py-8 shadow-panel sm:px-8 sm:py-10 lg:px-10 lg:py-12">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-r from-sky-100/80 via-transparent to-slate-100/40" />
        <div aria-hidden className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-sky-200/20 blur-3xl" />
        <div className="relative z-10 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div className="space-y-8">
            <div className="space-y-5">
              <p className="eyebrow-badge border-sky-100 bg-sky-50 text-sky-700">{eyebrow}</p>
              <h1 className="max-w-4xl text-[2.35rem] font-semibold tracking-[-0.055em] text-slate-950 sm:text-[4rem] lg:text-[4.7rem]">
                {title}
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600 lg:text-[1.15rem]">{description}</p>
              {supportText ? <p className="text-sm font-medium tracking-[0.02em] text-slate-500">{supportText}</p> : null}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              {actions.map((action) => (
                <LinkButton
                  key={action.href}
                  href={action.href}
                  variant={action.variant === "secondary" ? "secondary" : "primary"}
                  className={action.variant === "secondary" ? "w-full sm:min-w-44 sm:w-auto" : "w-full sm:min-w-48 sm:w-auto"}
                >
                  {action.label}
                </LinkButton>
              ))}
            </div>
            {metrics ? (
              <div className="grid gap-4 sm:grid-cols-3">
                {metrics.map((metric) => (
                  <div key={metric.label} className="metric-tile">
                    <p className="text-2xl font-semibold tracking-tight text-slate-950">{metric.value}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{metric.label}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
          {aside ? <div className="lg:pl-4">{aside}</div> : null}
        </div>
      </div>
    </section>
  );
}
