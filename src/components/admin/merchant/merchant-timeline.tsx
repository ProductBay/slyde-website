import type { MerchantOnboardingEvent } from "@/types/backend/onboarding";

function formatEventLabel(eventType: string) {
  if (eventType === "changes_pending_admin_review") {
    return "Merchant updated details";
  }
  return eventType.replaceAll("_", " ");
}

function getEventTone(event: MerchantOnboardingEvent) {
  if (event.eventType === "changes_pending_admin_review") {
    return {
      wrapper: "border border-amber-200 bg-amber-50/80 px-4 py-4 shadow-sm shadow-amber-100/60",
      pill: "bg-amber-600 text-white",
      meta: "text-amber-700",
      body: "text-amber-950",
      spotlight: true,
    };
  }

  if (event.eventType === "information_requested") {
    return {
      wrapper: "border border-sky-200 bg-sky-50/70 px-4 py-4",
      pill: "bg-sky-700 text-white",
      meta: "text-sky-700",
      body: "text-slate-700",
      spotlight: false,
    };
  }

  return {
    wrapper: "border-b border-slate-100 pb-4",
    pill: "bg-slate-100 text-slate-700",
    meta: "text-slate-500",
    body: "text-slate-600",
    spotlight: false,
  };
}

export function MerchantTimeline({ events }: { events: MerchantOnboardingEvent[] }) {
  const latestMerchantUpdate =
    events.find((event) => event.eventType === "changes_pending_admin_review") ?? null;

  return (
    <div className="surface-panel p-6">
      <div className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold text-slate-950">Audit timeline</h2>
        {latestMerchantUpdate ? (
          <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-amber-950">Merchant updated onboarding details</p>
              <span className="rounded-full bg-amber-600 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
                Needs review
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-amber-900">
              {latestMerchantUpdate.notes || "A merchant submitted new onboarding information that should be reviewed."}
            </p>
            <p className="mt-2 text-xs font-medium text-amber-700">
              {new Date(latestMerchantUpdate.createdAt).toLocaleString("en-JM")}
            </p>
          </div>
        ) : null}
      </div>
      <div className="mt-5 grid gap-4">
        {events.length ? (
          events.map((event) => {
            const tone = getEventTone(event);
            return (
              <div key={event.id} className={`${tone.wrapper} text-sm ${tone.spotlight ? "rounded-[1.5rem]" : ""}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-slate-950">{formatEventLabel(event.eventType)}</p>
                  {event.eventType === "changes_pending_admin_review" ? (
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${tone.pill}`}>
                      Merchant update
                    </span>
                  ) : null}
                </div>
                <p className={`mt-1 ${tone.meta}`}>{new Date(event.createdAt).toLocaleString("en-JM")}</p>
                {event.notes ? <p className={`mt-2 leading-7 ${tone.body}`}>{event.notes}</p> : null}
              </div>
            );
          })
        ) : (
          <p className="text-sm text-slate-500">No onboarding events recorded yet.</p>
        )}
      </div>
    </div>
  );
}
