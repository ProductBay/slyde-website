"use client";

import { useState } from "react";

const STATUSES = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "PRICING_SENT",
  "APPROVED",
  "SCHEDULED",
  "COMPLETED",
  "NOT_READY",
  "ARCHIVED",
];

const BRANDING_INTERESTS = [
  "Vehicle decals",
  "Rear/window branding",
  "Bike box branding",
  "Helmet branding",
  "Full wrap later",
  "Not sure yet",
];

type Props = {
  leadId: string;
  currentStatus: string;
  currentNotes: string | null;
  currentSlyderStatus: string | null;
  currentBrandingInterest: string[];
  devAdminKey?: string;
};

export function VehicleBrandingDetailPanel({
  leadId,
  currentStatus,
  currentNotes,
  currentSlyderStatus,
  currentBrandingInterest,
  devAdminKey,
}: Props) {
  const [status, setStatus] = useState(currentStatus);
  const [notes, setNotes] = useState(currentNotes ?? "");
  const [slyderStatus, setSlyderStatus] = useState(currentSlyderStatus ?? "");
  const [brandingInterest, setBrandingInterest] = useState(currentBrandingInterest);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function toggleInterest(value: string) {
    setBrandingInterest((prev) => (
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    ));
  }

  async function save() {
    setPending(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(`/api/admin/vehicle-branding-leads/${leadId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(devAdminKey ? { "x-slyde-admin-key": devAdminKey } : {}),
        },
        body: JSON.stringify({
          status,
          notes,
          currentSlyderStatus: slyderStatus,
          brandingInterest,
          ...(status === "CONTACTED" ? { contactedAt: new Date().toISOString() } : {}),
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not update lead.");
        return;
      }

      setMessage("Lead updated.");
    } catch {
      setError("Could not connect to the admin API.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
          Status
          <select className="field-input" value={status} onChange={(event) => setStatus(event.target.value)}>
            {STATUSES.map((item) => (
              <option key={item} value={item}>{item.replace(/_/g, " ")}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
          Slyder status
          <input className="field-input" value={slyderStatus} onChange={(event) => setSlyderStatus(event.target.value)} />
        </label>
      </div>

      <fieldset>
        <legend className="text-sm font-semibold text-slate-700">Branding interest</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {BRANDING_INTERESTS.map((interest) => (
            <label key={interest} className="flex items-start gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
              <input
                type="checkbox"
                className="field-checkbox mt-1"
                checked={brandingInterest.includes(interest)}
                onChange={() => toggleInterest(interest)}
              />
              <span>{interest}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
        Notes
        <textarea className="field-input min-h-24 resize-y" value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={500} />
      </label>

      {message ? <p className="text-sm font-semibold text-emerald-700">{message}</p> : null}
      {error ? <p className="text-sm font-semibold text-red-700">{error}</p> : null}

      <button
        type="button"
        onClick={save}
        disabled={pending}
        className="justify-self-start rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save lead"}
      </button>
    </div>
  );
}
