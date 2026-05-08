"use client";

import { useState } from "react";

const PARISHES = [
  "Kingston",
  "St. Andrew",
  "St. Thomas",
  "Portland",
  "St. Mary",
  "St. Ann",
  "Trelawny",
  "St. James",
  "Hanover",
  "Westmoreland",
  "St. Elizabeth",
  "Manchester",
  "Clarendon",
  "St. Catherine",
];

const VEHICLE_TYPES = ["Motorcycles", "Cars", "Vans", "Trucks", "Box trucks", "Bicycles", "Walkers", "Mixed fleet"];
const PARTNERSHIP_OPTIONS = [
  "Register company-owned drivers",
  "Offer fleet capacity to SLYDE",
  "Become a transfer partner",
  "Support final-mile delivery",
  "Discuss API / dispatch integration",
  "Not sure yet",
];

type FormState = {
  ownerName: string;
  companyName: string;
  whatsapp: string;
  email: string;
  parish: string;
  operatingAreas: string[];
  fleetSize: string;
  driverCount: string;
  vehicleTypes: string[];
  hasDispatchSystem: string;
  partnershipInterest: string;
  notes: string;
};

const initialForm: FormState = {
  ownerName: "",
  companyName: "",
  whatsapp: "",
  email: "",
  parish: "",
  operatingAreas: [],
  fleetSize: "",
  driverCount: "",
  vehicleTypes: [],
  hasDispatchSystem: "",
  partnershipInterest: "",
  notes: "",
};

export function FleetLeadForm() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function toggleList(field: "operatingAreas" | "vehicleTypes", value: string) {
    setForm((current) => {
      const exists = current[field].includes(value);
      return {
        ...current,
        [field]: exists ? current[field].filter((item) => item !== value) : [...current[field], value],
      };
    });
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/public/fleet-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const body = (await response.json().catch(() => null)) as { error?: string; ok?: boolean } | null;

      if (!response.ok || !body?.ok) {
        setError(typeof body?.error === "string" ? body.error : "Could not submit fleet interest.");
        return;
      }

      setSuccess(true);
      setForm(initialForm);
    } catch {
      setError("Could not connect. Please check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50 p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Fleet interest received</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">Thank you. Our team will review your fleet details.</h2>
        <p className="mt-3 text-sm leading-7 text-emerald-900">
          SLYDE will contact you on WhatsApp to understand your operating areas, vehicle capacity, and partnership fit.
        </p>
        <button
          type="button"
          onClick={() => setSuccess(false)}
          className="mt-5 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
        >
          Submit another fleet
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="surface-card space-y-5 p-6 sm:p-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">Fleet owner intake</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">Tell us about your delivery capacity</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5">
          <span className="field-label">Owner / contact name</span>
          <input className="field-input" required value={form.ownerName} onChange={(event) => update("ownerName", event.target.value)} />
        </label>
        <label className="grid gap-1.5">
          <span className="field-label">Company / fleet name</span>
          <input className="field-input" required value={form.companyName} onChange={(event) => update("companyName", event.target.value)} />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5">
          <span className="field-label">WhatsApp number</span>
          <input className="field-input" required value={form.whatsapp} onChange={(event) => update("whatsapp", event.target.value)} placeholder="876-XXX-XXXX" />
        </label>
        <label className="grid gap-1.5">
          <span className="field-label">Email optional</span>
          <input className="field-input" type="email" value={form.email} onChange={(event) => update("email", event.target.value)} />
        </label>
      </div>

      <label className="grid gap-1.5">
        <span className="field-label">Primary parish</span>
        <select className="field-input" value={form.parish} onChange={(event) => update("parish", event.target.value)}>
          <option value="">Select primary parish</option>
          {PARISHES.map((parish) => (
            <option key={parish} value={parish}>{parish}</option>
          ))}
        </select>
      </label>

      <div>
        <p className="field-label">Operating areas</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {PARISHES.map((parish) => (
            <button
              key={parish}
              type="button"
              onClick={() => toggleList("operatingAreas", parish)}
              className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${form.operatingAreas.includes(parish) ? "border-sky-500 bg-sky-50 text-sky-700" : "border-slate-200 bg-white text-slate-600"}`}
            >
              {parish}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5">
          <span className="field-label">Fleet size</span>
          <select className="field-input" value={form.fleetSize} onChange={(event) => update("fleetSize", event.target.value)}>
            <option value="">Select fleet size</option>
            {["1 vehicle", "2-5 vehicles", "6-10 vehicles", "11-25 vehicles", "26+ vehicles"].map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5">
          <span className="field-label">Driver count</span>
          <select className="field-input" value={form.driverCount} onChange={(event) => update("driverCount", event.target.value)}>
            <option value="">Select driver count</option>
            {["Owner-driver only", "2-5 drivers", "6-10 drivers", "11-25 drivers", "26+ drivers"].map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>
      </div>

      <div>
        <p className="field-label">Vehicle types</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {VEHICLE_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => toggleList("vehicleTypes", type)}
              className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${form.vehicleTypes.includes(type) ? "border-sky-500 bg-sky-50 text-sky-700" : "border-slate-200 bg-white text-slate-600"}`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5">
          <span className="field-label">Dispatch system</span>
          <select className="field-input" value={form.hasDispatchSystem} onChange={(event) => update("hasDispatchSystem", event.target.value)}>
            <option value="">Select one</option>
            <option value="Yes">Yes, we use dispatch software</option>
            <option value="No">No, mostly manual / WhatsApp</option>
            <option value="Basic spreadsheets">Basic spreadsheets</option>
          </select>
        </label>
        <label className="grid gap-1.5">
          <span className="field-label">Partnership interest</span>
          <select className="field-input" value={form.partnershipInterest} onChange={(event) => update("partnershipInterest", event.target.value)}>
            <option value="">Select one</option>
            {PARTNERSHIP_OPTIONS.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="grid gap-1.5">
        <span className="field-label">Notes optional</span>
        <textarea className="field-input min-h-28" value={form.notes} onChange={(event) => update("notes", event.target.value)} placeholder="Tell us about your routes, vehicle availability, operating model, or partnership goals." />
      </label>

      {error ? <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-slate-950 px-6 py-4 text-sm font-semibold text-white shadow-glow transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Submitting..." : "Submit Fleet Interest"}
      </button>
    </form>
  );
}
