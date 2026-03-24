import { BadgeCheck, Boxes, FileSearch, Radar, Send } from "lucide-react";
import type { TimelineStep } from "@/types/site";

export function ProcessTimeline({
  steps,
  compact = false,
}: {
  steps: TimelineStep[];
  compact?: boolean;
}) {
  const icons = [FileSearch, Boxes, Radar, Send, BadgeCheck];

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
