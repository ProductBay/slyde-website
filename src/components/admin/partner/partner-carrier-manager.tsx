"use client";

import { startTransition, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import type { PartnerCarrier, PartnerHandoffLocation } from "@/types/backend/onboarding";

export function PartnerCarrierManager({
  carriers,
  locationsByCarrierId,
  devAdminKey,
}: {
  carriers: PartnerCarrier[];
  locationsByCarrierId: Record<string, PartnerHandoffLocation[]>;
  devAdminKey?: string;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [carrierForm, setCarrierForm] = useState({
    name: "",
    slug: "",
    type: "branch_network",
    supportsTracking: true,
    supportsApi: false,
    supportsFinalDelivery: false,
    supportsBranchCollection: true,
    active: true,
  });
  const [locationForm, setLocationForm] = useState({
    partnerCarrierId: carriers[0]?.id ?? "",
    name: "",
    parish: "",
    town: "",
    addressLine: "",
  });
  const selectedLocations = useMemo(
    () => locationsByCarrierId[locationForm.partnerCarrierId] ?? [],
    [locationForm.partnerCarrierId, locationsByCarrierId],
  );

  async function submitCarrier() {
    setPending(true);
    setError(null);
    startTransition(async () => {
      const response = await fetch("/api/admin/partner-carriers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(devAdminKey ? { "x-slyde-admin-key": devAdminKey } : {}),
        },
        body: JSON.stringify(carrierForm),
      });
      const body = await response.json().catch(() => null);
      setPending(false);
      if (!response.ok) {
        setError(body?.error ?? "Unable to create carrier.");
        return;
      }
      window.location.reload();
    });
  }

  async function submitLocation() {
    if (!locationForm.partnerCarrierId) {
      setError("Choose a carrier before adding a handoff location.");
      return;
    }

    setPending(true);
    setError(null);
    startTransition(async () => {
      const response = await fetch(`/api/admin/partner-carriers/${locationForm.partnerCarrierId}/locations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(devAdminKey ? { "x-slyde-admin-key": devAdminKey } : {}),
        },
        body: JSON.stringify(locationForm),
      });
      const body = await response.json().catch(() => null);
      setPending(false);
      if (!response.ok) {
        setError(body?.error ?? "Unable to create handoff location.");
        return;
      }
      window.location.reload();
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="text-xl font-semibold text-slate-950">Add transfer partner</h2>
          <div className="mt-5 grid gap-4">
            <label className="field-shell">
              <span className="field-label">Carrier name</span>
              <input className="field-input" value={carrierForm.name} onChange={(event) => setCarrierForm((current) => ({ ...current, name: event.target.value }))} />
            </label>
            <label className="field-shell">
              <span className="field-label">Slug</span>
              <input className="field-input" value={carrierForm.slug} onChange={(event) => setCarrierForm((current) => ({ ...current, slug: event.target.value }))} />
            </label>
            <label className="field-shell">
              <span className="field-label">Type</span>
              <select className="field-input" value={carrierForm.type} onChange={(event) => setCarrierForm((current) => ({ ...current, type: event.target.value }))}>
                <option value="branch_network">Branch network</option>
                <option value="courier">Courier</option>
                <option value="express">Express</option>
              </select>
            </label>
            <div className="grid gap-3 text-sm text-slate-600 md:grid-cols-2">
              {[
                ["supportsTracking", "Supports tracking"],
                ["supportsApi", "Supports API"],
                ["supportsFinalDelivery", "Supports final delivery"],
                ["supportsBranchCollection", "Supports branch collection"],
              ].map(([key, label]) => (
                <label key={key} className="flex items-center gap-3 rounded-[1rem] border border-slate-200 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={Boolean(carrierForm[key as keyof typeof carrierForm])}
                    onChange={(event) => setCarrierForm((current) => ({ ...current, [key]: event.target.checked }))}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>
          {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}
          <div className="mt-6">
            <Button type="button" onClick={submitCarrier} disabled={pending}>
              {pending ? "Saving..." : "Add transfer partner"}
            </Button>
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="text-xl font-semibold text-slate-950">Active transfer partners</h2>
          <div className="mt-5 space-y-4">
            {carriers.map((carrier) => (
              <div key={carrier.id} className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-slate-950">{carrier.name}</p>
                    <p className="text-sm text-slate-500">{carrier.slug}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">{carrier.type.replace(/_/g, " ")}</span>
                    {carrier.active ? <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800">Active</span> : null}
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                  <span className="rounded-full bg-white px-3 py-1">Tracking: {carrier.supportsTracking ? "Yes" : "No"}</span>
                  <span className="rounded-full bg-white px-3 py-1">API: {carrier.supportsApi ? "Yes" : "No"}</span>
                  <span className="rounded-full bg-white px-3 py-1">Final delivery: {carrier.supportsFinalDelivery ? "Yes" : "No"}</span>
                  <span className="rounded-full bg-white px-3 py-1">Collection: {carrier.supportsBranchCollection ? "Yes" : "No"}</span>
                </div>
                <div className="mt-4 text-sm text-slate-600">
                  {locationsByCarrierId[carrier.id]?.length ?? 0} handoff locations configured
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="text-xl font-semibold text-slate-950">Add partner handoff location</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <label className="field-shell">
            <span className="field-label">Carrier</span>
            <select className="field-input" value={locationForm.partnerCarrierId} onChange={(event) => setLocationForm((current) => ({ ...current, partnerCarrierId: event.target.value }))}>
              <option value="">Select carrier</option>
              {carriers.map((carrier) => (
                <option key={carrier.id} value={carrier.id}>
                  {carrier.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field-shell">
            <span className="field-label">Location name</span>
            <input className="field-input" value={locationForm.name} onChange={(event) => setLocationForm((current) => ({ ...current, name: event.target.value }))} />
          </label>
          <label className="field-shell">
            <span className="field-label">Parish</span>
            <input className="field-input" value={locationForm.parish} onChange={(event) => setLocationForm((current) => ({ ...current, parish: event.target.value }))} />
          </label>
          <label className="field-shell">
            <span className="field-label">Town</span>
            <input className="field-input" value={locationForm.town} onChange={(event) => setLocationForm((current) => ({ ...current, town: event.target.value }))} />
          </label>
          <label className="field-shell md:col-span-2 xl:col-span-1">
            <span className="field-label">Address</span>
            <input className="field-input" value={locationForm.addressLine} onChange={(event) => setLocationForm((current) => ({ ...current, addressLine: event.target.value }))} />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            {selectedLocations.length ? `${selectedLocations.length} locations already configured for this carrier.` : "No locations configured yet for this carrier."}
          </p>
          <Button type="button" onClick={submitLocation} disabled={pending}>
            {pending ? "Saving..." : "Add handoff location"}
          </Button>
        </div>
      </div>
    </div>
  );
}
