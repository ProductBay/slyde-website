import type { ReferralRewardAudit } from "@/types/backend/onboarding";

export function ReferralAuditTimeline({ audits }: { audits: ReferralRewardAudit[] }) {
  return (
    <div className="surface-panel p-6">
      <h3 className="text-lg font-semibold text-slate-950">Reward audit timeline</h3>
      <div className="mt-5 grid gap-4">
        {audits.length === 0 ? (
          <p className="text-sm text-slate-500">No reward audit entries yet.</p>
        ) : (
          audits.map((audit) => (
            <div key={audit.id} className="rounded-3xl border border-slate-200 bg-surface-1 px-4 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-950">{audit.action.replace(/_/g, " ")}</p>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{new Date(audit.createdAt).toLocaleString("en-JM")}</p>
              </div>
              <p className="mt-2 text-sm leading-7 text-slate-600">Actor: {audit.actorType}{audit.actorId ? ` (${audit.actorId})` : ""}</p>
              {audit.notes ? <p className="mt-2 text-sm leading-7 text-slate-600">{audit.notes}</p> : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
