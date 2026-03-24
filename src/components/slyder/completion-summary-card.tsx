import Link from "next/link";

type CompletionSummary = {
  headline: string;
  body: string;
};

type WorkflowState = {
  title: string;
  body: string;
  tone: "action" | "review" | "ready";
};

export function CompletionSummaryCard({
  summary,
  remainingSteps,
  nextAction,
  workflowState,
}: {
  summary: CompletionSummary;
  remainingSteps: string[];
  nextAction?: { href: string; label: string } | null;
  workflowState: WorkflowState;
}) {
  const toneClasses =
    workflowState.tone === "action"
      ? "border-amber-200 bg-amber-50 text-amber-900"
      : workflowState.tone === "review"
        ? "border-sky-200 bg-sky-50 text-sky-900"
        : "border-emerald-200 bg-emerald-50 text-emerald-900";

  return (
    <div className="surface-card p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Completion result</p>
      <h2 className="mt-3 text-2xl font-semibold text-slate-950">{summary.headline}</h2>
      <p className="mt-3 text-sm leading-7 text-slate-600">{summary.body}</p>
      <div className={`mt-5 rounded-[1.5rem] border p-4 ${toneClasses}`}>
        <p className="text-sm font-semibold">{workflowState.title}</p>
        <p className="mt-2 text-sm leading-7">{workflowState.body}</p>
      </div>
      {nextAction ? (
        <div className="mt-5">
          <Link
            href={nextAction.href}
            className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-glow transition duration-200 hover:-translate-y-0.5 hover:bg-slate-800"
          >
            {nextAction.label}
          </Link>
        </div>
      ) : null}
      <div className="mt-5 rounded-[1.5rem] border border-slate-200 bg-surface-1 p-4">
        <p className="text-sm font-semibold text-slate-950">Remaining items</p>
        <ul className="mt-3 grid gap-2 text-sm text-slate-600">
          {remainingSteps.length ? remainingSteps.map((step) => <li key={step}>{step.replace(/_/g, " ")}</li>) : <li>No remaining onboarding items.</li>}
        </ul>
      </div>
    </div>
  );
}
