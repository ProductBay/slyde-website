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

const SLYDER_STATUSES = [
  "Already approved",
  "Application submitted",
  "Interested in becoming a Slyder",
];

const VEHICLE_TYPES = [
  "Bike",
  "Car",
  "Van",
  "Truck",
  "Walker / SLYDE-Walk",
  "Other",
];

const BRANDING_INTERESTS = [
  "Vehicle decals",
  "Rear/window branding",
  "Bike box branding",
  "Helmet branding",
  "Full wrap later",
  "Not sure yet",
];

export function BrandingInterestForm() {
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    whatsapp: "",
    email: "",
    currentSlyderStatus: "",
    vehicleType: "",
    brandingInterest: [] as string[],
    parish: "",
    notes: "",
  });

  function set(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleInterest(value: string) {
    setForm((prev) => ({
      ...prev,
      brandingInterest: prev.brandingInterest.includes(value)
        ? prev.brandingInterest.filter((item) => item !== value)
        : [...prev.brandingInterest, value],
    }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/public/vehicle-branding-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        setError(typeof data.error === "string" ? data.error : "Please check the form and try again.");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Could not connect. Please check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  if (success) {
    return (
      <div className="surface-panel p-6 sm:p-8" id="branding-interest-form">
        <p className="eyebrow-badge border-emerald-100 bg-emerald-50 text-emerald-700">Interest received</p>
        <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
          Thank you. Your branding interest has been received.
        </h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          Our team will contact you on WhatsApp with the next steps.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="surface-panel p-6 sm:p-8" id="branding-interest-form">
      <p className="eyebrow-badge border-sky-100 bg-sky-50 text-sky-700">Submit Branding Interest</p>
      <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">Request Branding Info</h2>
      <p className="mt-3 text-sm leading-7 text-slate-600">
        Tell us the basics and the SLYDE team will follow up on WhatsApp. No payment details, documents, or registration records are needed here.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="field-shell">
          <label htmlFor="fullName" className="field-label">Full name</label>
          <input
            id="fullName"
            required
            className="field-input"
            value={form.fullName}
            onChange={(event) => set("fullName", event.target.value)}
            autoComplete="name"
          />
        </div>
        <div className="field-shell">
          <label htmlFor="whatsapp" className="field-label">WhatsApp</label>
          <input
            id="whatsapp"
            required
            className="field-input"
            value={form.whatsapp}
            onChange={(event) => set("whatsapp", event.target.value)}
            autoComplete="tel"
            placeholder="876-XXX-XXXX"
          />
        </div>
        <div className="field-shell">
          <label htmlFor="email" className="field-label">Email optional</label>
          <input
            id="email"
            type="email"
            className="field-input"
            value={form.email}
            onChange={(event) => set("email", event.target.value)}
            autoComplete="email"
          />
        </div>
        <div className="field-shell">
          <label htmlFor="currentSlyderStatus" className="field-label">Current Slyder status</label>
          <select
            id="currentSlyderStatus"
            className="field-input"
            value={form.currentSlyderStatus}
            onChange={(event) => set("currentSlyderStatus", event.target.value)}
          >
            <option value="">Select status</option>
            {SLYDER_STATUSES.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
        <div className="field-shell">
          <label htmlFor="vehicleType" className="field-label">Vehicle type</label>
          <select
            id="vehicleType"
            className="field-input"
            value={form.vehicleType}
            onChange={(event) => set("vehicleType", event.target.value)}
          >
            <option value="">Select vehicle type</option>
            {VEHICLE_TYPES.map((vehicleType) => (
              <option key={vehicleType} value={vehicleType}>{vehicleType}</option>
            ))}
          </select>
        </div>
        <div className="field-shell">
          <label htmlFor="parish" className="field-label">Parish</label>
          <select
            id="parish"
            className="field-input"
            value={form.parish}
            onChange={(event) => set("parish", event.target.value)}
          >
            <option value="">Select parish</option>
            {PARISHES.map((parish) => (
              <option key={parish} value={parish}>{parish}</option>
            ))}
          </select>
        </div>
      </div>

      <fieldset className="mt-5">
        <legend className="field-label">Branding interest</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {BRANDING_INTERESTS.map((interest) => (
            <label key={interest} className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
              <input
                type="checkbox"
                className="field-checkbox mt-1"
                checked={form.brandingInterest.includes(interest)}
                onChange={() => toggleInterest(interest)}
              />
              <span>{interest}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="field-shell mt-5">
        <label htmlFor="notes" className="field-label">Notes optional</label>
        <textarea
          id="notes"
          className="field-input min-h-28 resize-y"
          value={form.notes}
          onChange={(event) => set("notes", event.target.value)}
          maxLength={500}
          placeholder="Tell us anything helpful about your vehicle or setup."
        />
      </div>

      {error ? (
        <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-6 w-full rounded-full bg-slate-950 px-6 py-4 text-sm font-semibold text-white shadow-glow transition duration-200 hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60"
      >
        {pending ? "Submitting..." : "Submit Branding Interest"}
      </button>
    </form>
  );
}
