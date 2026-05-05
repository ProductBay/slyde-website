"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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

const VEHICLE_TYPES = [
  { value: "motorcycle", label: "Motorcycle" },
  { value: "bicycle", label: "Bicycle" },
  { value: "car", label: "Car" },
  { value: "van", label: "Van" },
  { value: "walker", label: "On Foot / Walker" },
  { value: "other", label: "Other" },
];

// TODO: analytics hooks — slyder_lead_started, slyder_lead_submitted

export function SlyderLeadForm({ referredByCode }: { referredByCode?: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    whatsapp: "",
    parish: "",
    vehicleType: "",
  });

  function set(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    try {
      const res = await fetch("/api/public/slyder-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          ...(referredByCode ? { referredByCode } : {}),
          source: "join_page",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      localStorage.setItem("slyde-slyder-lead-id", data.leadId);
      if (data.referralCode) {
        localStorage.setItem("slyde-slyder-referral-code", data.referralCode);
      }

      router.push(`/join/slyder/qualify?leadId=${data.leadId}`);
    } catch {
      setError("Could not connect. Please check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className="mb-1.5 block text-sm font-semibold text-slate-800">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            id="firstName"
            type="text"
            required
            autoComplete="given-name"
            className="field-input w-full"
            placeholder="Your first name"
            value={form.firstName}
            onChange={(e) => set("firstName", e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="lastName" className="mb-1.5 block text-sm font-semibold text-slate-800">
            Last Name <span className="text-slate-400 text-xs font-normal">(optional)</span>
          </label>
          <input
            id="lastName"
            type="text"
            autoComplete="family-name"
            className="field-input w-full"
            placeholder="Your last name"
            value={form.lastName}
            onChange={(e) => set("lastName", e.target.value)}
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-slate-800">
          Email Address <span className="text-red-500">*</span>
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          className="field-input w-full"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="whatsapp" className="mb-1.5 block text-sm font-semibold text-slate-800">
          WhatsApp Number <span className="text-red-500">*</span>
        </label>
        <input
          id="whatsapp"
          type="tel"
          required
          autoComplete="tel"
          className="field-input w-full"
          placeholder="876-XXX-XXXX"
          value={form.whatsapp}
          onChange={(e) => set("whatsapp", e.target.value)}
        />
        <p className="mt-1 text-xs text-slate-500">We send updates and confirmations on WhatsApp.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="parish" className="mb-1.5 block text-sm font-semibold text-slate-800">
            Parish
          </label>
          <select
            id="parish"
            className="field-input w-full"
            value={form.parish}
            onChange={(e) => set("parish", e.target.value)}
          >
            <option value="">Select your parish</option>
            {PARISHES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="vehicleType" className="mb-1.5 block text-sm font-semibold text-slate-800">
            How You Move
          </label>
          <select
            id="vehicleType"
            className="field-input w-full"
            value={form.vehicleType}
            onChange={(e) => set("vehicleType", e.target.value)}
          >
            <option value="">Select your transport type</option>
            {VEHICLE_TYPES.map((v) => (
              <option key={v.value} value={v.value}>{v.label}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-slate-950 px-6 py-4 text-sm font-semibold text-white shadow-glow transition duration-200 hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60"
      >
        {pending ? "Reserving your spot…" : "Reserve My Spot"}
      </button>

      <p className="text-center text-xs text-slate-500">
        No documents, ID, or license required at this step. We only need your basics.
      </p>
    </form>
  );
}
