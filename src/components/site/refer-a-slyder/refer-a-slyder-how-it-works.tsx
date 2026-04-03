const steps = [
  "Refer a reliable driver through the public SLYDE website.",
  "SLYDE reviews, approves, activates, and guides them through readiness.",
  "When they complete their first real live delivery, the reward becomes available.",
  "If you are not in an active customer zone, gift it one time only to a friend or family member who is.",
];

export function ReferASlyderHowItWorks() {
  return (
    <section className="section-shell py-16">
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">How It Works</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">Clean milestones. No instant payout.</h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            This is not a signup bonus. The referral has to turn into a real operational Slyder before the reward is earned.
          </p>
        </div>
        <div className="surface-panel p-8">
          <div className="grid gap-3">
            {steps.map((step, index) => (
              <div key={step} className="flex items-start gap-4 rounded-3xl border border-slate-200 bg-surface-1 px-4 py-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-semibold text-sky-700">
                  {index + 1}
                </span>
                <p className="text-sm leading-7 text-slate-600">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
