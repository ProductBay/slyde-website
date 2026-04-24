import { ArrowRight, BadgeCheck, Boxes, FileSearch, Radar, Send } from "lucide-react";
import type { TimelineStep } from "@/types/site";

export function ProcessTimeline({
  steps,
  compact = false,
  variant = "default",
}: {
  steps: TimelineStep[];
  compact?: boolean;
  variant?: "default" | "workflow";
}) {
  const icons = [FileSearch, Boxes, Radar, Send, BadgeCheck];

  if (variant === "workflow") {
    return (
      <div className="surface-card reveal-on-scroll overflow-hidden p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          {steps.map((step, index) => (
            <div key={`workflow-rail-${step.title}`} className="flex items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50/80 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-800">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] text-slate-900 shadow-sm">
                  {index + 1}
                </span>
                <span className="max-w-[12rem] truncate">{step.title}</span>
              </div>
              {index < steps.length - 1 ? <ArrowRight className="hidden h-3.5 w-3.5 text-sky-400 sm:block" /> : null}
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = icons[index] || BadgeCheck;

            return (
              <div
                key={step.title}
                className="relative overflow-hidden rounded-[1.5rem] border border-slate-200/85 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(245,249,252,0.98))] p-4 shadow-[0_18px_45px_-36px_rgba(15,23,42,0.45)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Step {index + 1}
                  </span>
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-sky-700 shadow-sm">
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-950">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {steps.map((step, index) => (
        <div key={step.title} className="surface-card reveal-on-scroll flex gap-4 overflow-hidden p-5">
          <div className="flex flex-col items-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-sky-700">
              {(() => {
                const Icon = icons[index] || BadgeCheck;
                return <Icon className="h-5 w-5" />;
              })()}
            </span>
            {index < steps.length - 1 ? <span className="workflow-connector mt-4 h-16 w-1 rounded-full" /> : null}
          </div>
          <div className={`min-w-0 ${compact ? "pb-2" : "pb-4"}`}>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">Workflow node 0{index + 1}</p>
            <h3 className="mt-2 text-lg font-semibold text-slate-950">{step.title}</h3>
            <p className="mt-2 text-sm leading-7 text-slate-600">{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
