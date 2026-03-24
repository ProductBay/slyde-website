"use client";

import { ArrowRight, BriefcaseBusiness, Cable, MapPinned, UserRoundPlus } from "lucide-react";
import { LinkButton } from "@/components/ui/link-button";

const paths = [
  {
    title: "Become a Slyder",
    description: "Apply, upload documents, and move through the verified activation workflow.",
    href: "/become-a-slyder/apply",
    icon: UserRoundPlus,
    tone: "from-sky-500/14 via-cyan-400/10 to-transparent",
  },
  {
    title: "For Businesses",
    description: "Position your operation for managed delivery capacity without building an internal fleet.",
    href: "/for-businesses",
    icon: BriefcaseBusiness,
    tone: "from-emerald-500/14 via-teal-400/10 to-transparent",
  },
  {
    title: "API Integrations",
    description: "Explore the partner surface for platform connectivity, orchestration, and scale.",
    href: "/api-integrations",
    icon: Cable,
    tone: "from-indigo-500/14 via-sky-400/10 to-transparent",
  },
];

export function PathSelector() {
  return (
    <section className="section-shell py-6">
      <div className="sticky-path-selector surface-panel reveal-on-scroll overflow-hidden p-4 sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-700">Primary conversion lane</p>
            <h2 className="mt-3 text-xl font-semibold tracking-tight text-slate-950 sm:text-[1.75rem]">
              Keep the dominant action visible as the page scrolls
            </h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              SLYDE is actively building courier supply and launch coverage. The primary path stays centered on Slyder conversion, with coverage as the secondary operational check.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <LinkButton href="/become-a-slyder/apply" className="min-w-[220px] justify-between">
              Apply as a Slyder
              <ArrowRight className="h-4 w-4" />
            </LinkButton>
            <LinkButton href="/coverage" variant="secondary" className="min-w-[180px] justify-between">
              Check your area
              <MapPinned className="h-4 w-4" />
            </LinkButton>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {paths.map((path) => {
            const Icon = path.icon;
            return (
              <div
                key={path.title}
                className={`group relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white/92 p-5 shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-panel`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${path.tone}`} />
                <div className="relative">
                  <div className="flex items-start justify-between gap-4">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-950 text-sky-300 shadow-soft">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Shortcut
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-slate-950">{path.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{path.description}</p>
                  <div className="mt-5">
                    <LinkButton href={path.href} variant="secondary" className="w-full justify-between">
                      Open path
                      <ArrowRight className="h-4 w-4" />
                    </LinkButton>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
