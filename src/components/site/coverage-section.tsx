import { MapPinned } from "lucide-react";
import { coverageCards, parishCoverageGroups } from "@/content/site";
import { SectionHeading } from "@/components/site/section-heading";

export function CoverageSection() {
  return (
    <section className="mx-auto max-w-shell px-4 py-16 sm:px-6 lg:px-8">
      <div className="surface-panel reveal-on-scroll overflow-hidden p-6 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
          <div>
            <SectionHeading
              eyebrow="Coverage"
              title="Jamaica-first coverage shaped around real operating cities"
              description="Instead of claiming everywhere at once, SLYDE is structuring growth around launch anchors, next-wave city corridors, and a compact view of major towns across all 14 parishes."
            />
            <div className="mt-6 rounded-[1.6rem] border border-slate-200 bg-white/85 p-4 shadow-soft">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-sky-700">
                  <MapPinned className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">Compact network view</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    These city names show where SLYDE is mapping merchant demand, courier formation, and future service design. Actual launch timing can still vary by readiness and operating depth.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="grid gap-3 md:grid-cols-3">
              {coverageCards.map((item) => (
                <div key={item.title} className="rounded-[1.5rem] border border-slate-200 bg-white/92 p-4 shadow-soft">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-700">{item.eyebrow}</p>
                  <h3 className="mt-2 text-base font-semibold text-slate-950">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.highlights.map((highlight) => (
                      <span
                        key={`${item.title}-${highlight}`}
                        className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-[1.7rem] border border-slate-200 bg-white/94 p-4 shadow-soft sm:p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Major cities and towns</p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-950">A compact parish-by-parish coverage map</h3>
                </div>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">14 parishes</p>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {parishCoverageGroups.map((group) => (
                  <div key={group.parish} className="coverage-flip-card">
                    <div className="coverage-flip-inner">
                      <div className="coverage-flip-face coverage-flip-face-front">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-semibold text-slate-950">{group.parish}</p>
                          <span className="inline-flex items-center rounded-full border border-sky-100 bg-sky-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-700">
                            Hover for readiness
                          </span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {group.towns.map((town) => (
                            <span
                              key={`${group.parish}-${town}`}
                              className="inline-flex items-center rounded-full border border-sky-100 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600"
                            >
                              {town}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="coverage-flip-face coverage-flip-face-back">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-950">{group.parish}</p>
                            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-700">{group.status}</p>
                          </div>
                          <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
                            {group.readiness}% ready
                          </span>
                        </div>

                        <div className="mt-3">
                          <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                            <span>Zone readiness</span>
                            <span>{group.readiness}%</span>
                          </div>
                          <div className="mt-1.5 h-1.5 rounded-full bg-slate-200">
                            <div
                              className="h-full rounded-full bg-[linear-gradient(90deg,#38bdf8_0%,#22c55e_100%)]"
                              style={{ width: `${group.readiness}%` }}
                            />
                          </div>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <div className="rounded-2xl border border-slate-200 bg-white px-2.5 py-2">
                            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-500">Signed up</p>
                            <p className="mt-1 text-lg font-semibold text-slate-950">{group.signedUpSlyders}</p>
                            <p className="text-[10px] leading-4 text-slate-500">Slyders in pipeline</p>
                          </div>
                          <div className="rounded-2xl border border-slate-200 bg-white px-2.5 py-2">
                            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-500">Readiness</p>
                            <p className="mt-1 text-lg font-semibold text-slate-950">
                              {group.readiness >= 28 ? "High" : group.readiness >= 18 ? "Mid" : "Early"}
                            </p>
                            <p className="text-[10px] leading-4 text-slate-500">Formation stage</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
