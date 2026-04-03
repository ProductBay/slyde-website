"use client";

import { startTransition, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import type { DeliveryLeg, PartnerCarrier, PartnerTrackingEvent } from "@/types/backend/onboarding";

export function OutOfParishTrackingManager({
  deliveryId,
  partnerCarrier,
  legs,
  partnerEvents,
  devAdminKey,
}: {
  deliveryId: string;
  partnerCarrier: PartnerCarrier | null;
  legs: DeliveryLeg[];
  partnerEvents: PartnerTrackingEvent[];
  devAdminKey?: string;
}) {
  const partnerLegs = useMemo(() => legs.filter((leg) => leg.providerType === "partner"), [legs]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    deliveryLegId: partnerLegs[0]?.id ?? "",
    partnerCarrierId: partnerCarrier?.id ?? "",
    externalTrackingReference: partnerLegs[0]?.partnerTrackingReference ?? "",
    rawStatus: "",
    normalizedStatus: "in_interparish_transit",
    notes: "",
  });

  async function submit() {
    setPending(true);
    setError(null);
    startTransition(async () => {
      const response = await fetch(`/api/admin/out-of-parish/deliveries/${deliveryId}/partner-tracking`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(devAdminKey ? { "x-slyde-admin-key": devAdminKey } : {}),
        },
        body: JSON.stringify(form),
      });
      const body = await response.json().catch(() => null);
      setPending(false);
      if (!response.ok) {
        setError(body?.error ?? "Unable to save partner tracking update.");
        return;
      }
      window.location.reload();
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="text-xl font-semibold text-slate-950">Manual partner tracking</h2>
        <p className="mt-2 text-sm text-slate-600">
          Use this when the transfer partner does not expose a live API yet. SLYDE stays the unified tracking layer while ops records partner updates here.
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="field-shell">
            <span className="field-label">Partner leg</span>
            <select className="field-input" value={form.deliveryLegId} onChange={(event) => setForm((current) => ({ ...current, deliveryLegId: event.target.value }))}>
              {partnerLegs.map((leg) => (
                <option key={leg.id} value={leg.id}>
                  Leg {leg.legSequence}: {leg.originLabel} to {leg.destinationLabel}
                </option>
              ))}
            </select>
          </label>
          <label className="field-shell">
            <span className="field-label">Partner reference</span>
            <input className="field-input" value={form.externalTrackingReference} onChange={(event) => setForm((current) => ({ ...current, externalTrackingReference: event.target.value }))} />
          </label>
          <label className="field-shell">
            <span className="field-label">Raw partner status</span>
            <input className="field-input" value={form.rawStatus} onChange={(event) => setForm((current) => ({ ...current, rawStatus: event.target.value }))} />
          </label>
          <label className="field-shell">
            <span className="field-label">Normalized status</span>
            <select className="field-input" value={form.normalizedStatus} onChange={(event) => setForm((current) => ({ ...current, normalizedStatus: event.target.value }))}>
              <option value="accepted_by_partner">Accepted by partner</option>
              <option value="in_interparish_transit">In inter-parish transit</option>
              <option value="arrived_at_destination_hub">Arrived at destination hub</option>
              <option value="ready_for_collection">Ready for collection</option>
              <option value="out_for_final_delivery">Out for final delivery</option>
              <option value="delivered">Delivered</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>
          <label className="field-shell md:col-span-2">
            <span className="field-label">Notes</span>
            <textarea className="field-input min-h-24" value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} />
          </label>
        </div>

        {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}

        <div className="mt-6">
          <Button type="button" onClick={submit} disabled={pending || !partnerLegs.length || !partnerCarrier}>
            {pending ? "Saving..." : "Save partner tracking update"}
          </Button>
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="text-xl font-semibold text-slate-950">Partner tracking history</h2>
        <div className="mt-5 space-y-4">
          {partnerEvents.length ? partnerEvents.map((event) => (
            <div key={event.id} className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-semibold text-slate-900">{event.normalizedStatus.replace(/_/g, " ")}</p>
                <p className="text-sm text-slate-500">{new Date(event.eventTimestamp).toLocaleString()}</p>
              </div>
              <p className="mt-2 text-sm text-slate-600">Raw status: {event.rawStatus}</p>
              <p className="mt-1 text-sm text-slate-600">Tracking reference: {event.externalTrackingReference ?? "Pending"}</p>
              {event.notes ? <p className="mt-1 text-sm text-slate-600">{event.notes}</p> : null}
            </div>
          )) : (
            <p className="text-sm text-slate-500">No partner tracking updates recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
