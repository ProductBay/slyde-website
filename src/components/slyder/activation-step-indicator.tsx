export function ActivationStepIndicator({
  current,
}: {
  current: "activate" | "legal" | "setup" | "readiness" | "complete";
}) {
  const steps = [
    { key: "activate", label: "Activate" },
    { key: "legal", label: "Legal" },
    { key: "setup", label: "Setup" },
    { key: "readiness", label: "Readiness" },
    { key: "complete", label: "Complete" },
  ] as const;

  const currentIndex = steps.findIndex((step) => step.key === current);

  return (
    <div className="grid gap-3 sm:grid-cols-5">
      {steps.map((step, index) => {
        const active = currentIndex === index;
        const complete = currentIndex > index;

        return (
          <div
            key={step.key}
            className={`rounded-3xl border px-4 py-3 text-sm font-semibold transition ${
              active
                ? "border-slate-950 bg-slate-950 text-white"
                : complete
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-slate-50 text-slate-500"
            }`}
          >
            {index + 1}. {step.label}
          </div>
        );
      })}
    </div>
  );
}
