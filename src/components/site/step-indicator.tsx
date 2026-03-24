import { cn } from "@/lib/utils";

export function StepIndicator({
  steps,
  currentStep,
}: {
  steps: Array<{ title: string }>;
  currentStep: number;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-4 xl:grid-cols-8">
      {steps.map((step, index) => {
        const active = index === currentStep;
        const completed = index < currentStep;

        return (
          <div
            key={step.title}
            className={cn(
              "rounded-3xl border px-4 py-3 transition duration-200",
              active
                ? "border-slate-950 bg-slate-950 text-white shadow-panel"
                : completed
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-border bg-white/90 text-slate-500",
            )}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em]">Step {index + 1}</p>
            <p className="mt-2 text-sm font-medium">{step.title}</p>
          </div>
        );
      })}
    </div>
  );
}
