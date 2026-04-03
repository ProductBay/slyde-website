"use client";

import { startTransition, useState } from "react";
import { Button } from "@/components/ui/button";

type LocationFormState = {
  riderLat: string;
  riderLng: string;
  pickupLat: string;
  pickupLng: string;
  destinationLat: string;
  destinationLng: string;
  etaToPickupMinutes: string;
  etaToDeliveryMinutes: string;
  notes: string;
};

const initialState: LocationFormState = {
  riderLat: "",
  riderLng: "",
  pickupLat: "",
  pickupLng: "",
  destinationLat: "",
  destinationLng: "",
  etaToPickupMinutes: "",
  etaToDeliveryMinutes: "",
  notes: "",
};

function hasPair(lat: string, lng: string) {
  return lat.trim() !== "" && lng.trim() !== "";
}

export function MerchantDeliveryLocationUpdateForm({
  deliveryId,
  devAdminKey,
}: {
  deliveryId: string;
  devAdminKey?: string;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<LocationFormState>(initialState);

  async function submit() {
    setPending(true);
    setError(null);

    startTransition(async () => {
      const payload: Record<string, unknown> = {
        ...(hasPair(form.riderLat, form.riderLng)
          ? {
              riderLocation: {
                lat: form.riderLat,
                lng: form.riderLng,
                label: "Assigned Slyder",
              },
            }
          : {}),
        ...(hasPair(form.pickupLat, form.pickupLng)
          ? {
              pickupLocation: {
                lat: form.pickupLat,
                lng: form.pickupLng,
                label: "Pickup point",
              },
            }
          : {}),
        ...(hasPair(form.destinationLat, form.destinationLng)
          ? {
              destinationLocation: {
                lat: form.destinationLat,
                lng: form.destinationLng,
                label: "Destination",
              },
            }
          : {}),
        ...(form.etaToPickupMinutes.trim() ? { etaToPickupMinutes: form.etaToPickupMinutes } : {}),
        ...(form.etaToDeliveryMinutes.trim() ? { etaToDeliveryMinutes: form.etaToDeliveryMinutes } : {}),
        ...(form.notes.trim() ? { notes: form.notes.trim() } : {}),
      };

      const response = await fetch(`/api/admin/merchant-deliveries/${deliveryId}/location-update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(devAdminKey ? { "x-slyde-admin-key": devAdminKey } : {}),
        },
        body: JSON.stringify(payload),
      });
      const body = await response.json().catch(() => null);
      setPending(false);

      if (!response.ok) {
        setError(body?.error ?? "Unable to save the location update.");
        return;
      }

      setForm((current) => ({
        ...current,
        notes: "",
      }));
      window.location.reload();
    });
  }

  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">Live map update</h2>
          <p className="mt-2 text-sm text-slate-600">
            Push rider coordinates and ETA snapshots into the delivery event feed so the merchant map reflects the latest ops view.
          </p>
        </div>
        <span className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
          Local testing
        </span>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="field-shell">
          <span className="field-label">Rider latitude</span>
          <input className="field-input" inputMode="decimal" value={form.riderLat} onChange={(event) => setForm((current) => ({ ...current, riderLat: event.target.value }))} placeholder="18.0179" />
        </label>
        <label className="field-shell">
          <span className="field-label">Rider longitude</span>
          <input className="field-input" inputMode="decimal" value={form.riderLng} onChange={(event) => setForm((current) => ({ ...current, riderLng: event.target.value }))} placeholder="-77.4991" />
        </label>
        <label className="field-shell">
          <span className="field-label">Pickup latitude</span>
          <input className="field-input" inputMode="decimal" value={form.pickupLat} onChange={(event) => setForm((current) => ({ ...current, pickupLat: event.target.value }))} placeholder="18.0141" />
        </label>
        <label className="field-shell">
          <span className="field-label">Pickup longitude</span>
          <input className="field-input" inputMode="decimal" value={form.pickupLng} onChange={(event) => setForm((current) => ({ ...current, pickupLng: event.target.value }))} placeholder="-77.4948" />
        </label>
        <label className="field-shell">
          <span className="field-label">Destination latitude</span>
          <input className="field-input" inputMode="decimal" value={form.destinationLat} onChange={(event) => setForm((current) => ({ ...current, destinationLat: event.target.value }))} placeholder="18.0310" />
        </label>
        <label className="field-shell">
          <span className="field-label">Destination longitude</span>
          <input className="field-input" inputMode="decimal" value={form.destinationLng} onChange={(event) => setForm((current) => ({ ...current, destinationLng: event.target.value }))} placeholder="-77.5127" />
        </label>
        <label className="field-shell">
          <span className="field-label">ETA to pickup</span>
          <input className="field-input" inputMode="numeric" value={form.etaToPickupMinutes} onChange={(event) => setForm((current) => ({ ...current, etaToPickupMinutes: event.target.value }))} placeholder="12 minutes" />
        </label>
        <label className="field-shell">
          <span className="field-label">ETA to delivery</span>
          <input className="field-input" inputMode="numeric" value={form.etaToDeliveryMinutes} onChange={(event) => setForm((current) => ({ ...current, etaToDeliveryMinutes: event.target.value }))} placeholder="28 minutes" />
        </label>
        <label className="field-shell md:col-span-2">
          <span className="field-label">Ops note</span>
          <textarea className="field-input min-h-24" value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} placeholder="Example: Rider is 8 minutes away from the pickup gate and traffic is clear toward Lacovia." />
        </label>
      </div>

      {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button type="button" onClick={submit} disabled={pending}>
          {pending ? "Saving..." : "Push live map update"}
        </Button>
        <p className="text-sm text-slate-500">Each update appends a location event so the merchant tracking view can animate from the latest snapshot.</p>
      </div>
    </div>
  );
}
