import { Activity, ArrowUpRight, BriefcaseBusiness, Radar, UsersRound } from "lucide-react";
import { launchZoneCards } from "@/content/site";
import { LinkButton } from "@/components/ui/link-button";

const readinessSignals = [
  { readiness: "72%", couriers: 46, demand: "Open" },
  { readiness: "64%", couriers: 31, demand: "Open" },
  { readiness: "58%", couriers: 22, demand: "Building" },
];

export function ReadinessBoard() {
  return (
    <section className="section-shell py-16">
      <div className="grid gap-8 lg:grid-cols-[0.74fr_1.26fr] lg:items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-700">Launch readiness board</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-[2.5rem]">
            A live-feeling view of where the network is building next
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
            Instead of presenting launch as a static promo, this board frames each operating area as an active readiness surface: zone posture, courier growth, and business demand formation.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="surface-card p-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-sky-700">
                  <UsersRound className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Couriers building now</p>
                  <p className="mt-1 text-lg font-semibold text-slate-950">99 active applicants in formation</p>
                </div>
              </div>
            </div>
            <div className="surface-card p-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-700">
                  <BriefcaseBusiness className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Business demand</p>
                  <p className="mt-1 text-lg font-semibold text-slate-950">Merchant intake open across launch zones</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="surface-panel reveal-on-scroll overflow-hidden p-4 sm:p-5">
          <div className="grid gap-3">
            <div className="grid grid-cols-[1.4fr_0.9fr_0.9fr_0.9fr] gap-3 rounded-[1.5rem] border border-slate-200 bg-slate-950 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-300">
              <span>Zone status</span>
              <span>Projected readiness</span>
              <span>Couriers building now</span>
              <span>Business demand open</span>
            </div>

            {launchZoneCards.map((item, index) => {
              const signal = readinessSignals[index] ?? readinessSignals[readinessSignals.length - 1];
              return (
                <div key={item.title} className="readiness-row grid grid-cols-1 gap-3 rounded-[1.6rem] border border-slate-200 bg-white/94 p-4 shadow-soft lg:grid-cols-[1.4fr_0.9fr_0.9fr_0.9fr] lg:items-center">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">{item.eyebrow}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-semibold text-slate-950">{item.title}</h3>
                      <span className="rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-700">
                        {item.status}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
                  </div>

                  <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 py-4">
                    <div className="flex items-center gap-2 text-sky-700">
                      <Radar className="h-4 w-4" />
                      <span className="text-xs font-semibold uppercase tracking-[0.24em]">Projected</span>
                    </div>
                    <p className="mt-3 text-2xl font-semibold text-slate-950">{signal.readiness}</p>
                  </div>

                  <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 py-4">
                    <div className="flex items-center gap-2 text-slate-700">
                      <UsersRound className="h-4 w-4" />
                      <span className="text-xs font-semibold uppercase tracking-[0.24em]">Courier flow</span>
                    </div>
                    <p className="mt-3 text-2xl font-semibold text-slate-950">{signal.couriers}</p>
                  </div>

                  <div className="rounded-[1.4rem] border border-emerald-100 bg-emerald-50/70 px-4 py-4">
                    <div className="flex items-center gap-2 text-emerald-700">
                      <Activity className="h-4 w-4" />
                      <span className="text-xs font-semibold uppercase tracking-[0.24em]">Merchant signal</span>
                    </div>
                    <p className="mt-3 text-lg font-semibold text-slate-950">{signal.demand}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 flex flex-col gap-3 rounded-[1.6rem] border border-slate-200 bg-slate-50/90 p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-3xl text-sm leading-7 text-slate-600">
              Readiness combines courier pipeline strength, document review throughput, and merchant demand. SLYDE uses this posture to decide where live activation should happen next.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <LinkButton href="/become-a-slyder/apply">Apply as a Slyder</LinkButton>
              <LinkButton href="/coverage" variant="secondary">
                Check your area <ArrowUpRight className="h-4 w-4" />
              </LinkButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
