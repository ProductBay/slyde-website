"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const SCHEDULES = [
  { value: "weekdays", label: "Weekdays" },
  { value: "weekends", label: "Weekends" },
  { value: "evenings", label: "Evenings" },
  { value: "flexible", label: "Flexible / Anytime" },
];

const EXPERIENCE_LEVELS = [
  { value: "none", label: "No experience — new to delivery" },
  { value: "some", label: "Some experience (part-time, informal)" },
  { value: "experienced", label: "Experienced delivery rider/driver" },
];

const READINESS_LEVELS = [
  { value: "ready_now", label: "Ready to start immediately" },
  { value: "within_month", label: "Ready within the next month" },
  { value: "exploring", label: "Still exploring my options" },
];

// TODO: analytics hooks — slyder_qualification_started, slyder_qualification_submitted

export function SlyderQualificationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leadId, setLeadId] = useState<string | null>(null);

  const [form, setForm] = useState({
    hasVehicle: undefined as boolean | undefined,
    hasSmartphone: undefined as boolean | undefined,
    usesWhatsapp: undefined as boolean | undefined,
    hasDataAccess: undefined as boolean | undefined,
    availableWeekly: undefined as boolean | undefined,
    preferredSchedule: "",
    deliveryExperience: "",
    readinessLevel: "",
  });

  useEffect(() => {
    const id = searchParams.get("leadId") ?? localStorage.getItem("slyde-slyder-lead-id");
    if (id) setLeadId(id);
  }, [searchParams]);

  function setBool(field: keyof typeof form, value: boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function setStr(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!leadId) {
      setError("Your lead session expired. Please go back and resubmit your details.");
      return;
    }
    setError(null);
    setPending(true);

    try {
      const res = await fetch("/api/public/slyder-qualification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, ...form, preferredZones: [] }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.error ?? "Could not save. Please try again.");
        return;
      }

      router.push(data.nextUrl ?? `/become-a-slyder?leadId=${leadId}`);
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setPending(false);
    }
  }

  function BoolToggle({
    field,
    label,
  }: {
    field: "hasVehicle" | "hasSmartphone" | "usesWhatsapp" | "hasDataAccess" | "availableWeekly";
    label: string;
  }) {
    const value = form[field];
    return (
      <div className="surface-card p-4">
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        <div className="mt-3 flex gap-3">
          <button
            type="button"
            onClick={() => setBool(field, true)}
            className={`flex-1 rounded-full border py-2.5 text-sm font-semibold transition duration-200 ${
              value === true
                ? "border-sky-500 bg-sky-50 text-sky-700"
                : "border-slate-200 bg-white text-slate-700 hover:border-sky-300"
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => setBool(field, false)}
            className={`flex-1 rounded-full border py-2.5 text-sm font-semibold transition duration-200 ${
              value === false
                ? "border-slate-400 bg-slate-100 text-slate-700"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
            }`}
          >
            No
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <BoolToggle field="hasVehicle" label="Do you have a vehicle or bike?" />
        <BoolToggle field="hasSmartphone" label="Do you have a smartphone?" />
        <BoolToggle field="usesWhatsapp" label="Do you use WhatsApp?" />
        <BoolToggle field="hasDataAccess" label="Do you have reliable mobile data?" />
        <BoolToggle field="availableWeekly" label="Available to work weekly?" />
      </div>

      <div>
        <label htmlFor="preferredSchedule" className="mb-1.5 block text-sm font-semibold text-slate-800">
          When are you most available?
        </label>
        <select
          id="preferredSchedule"
          className="field-input w-full"
          value={form.preferredSchedule}
          onChange={(e) => setStr("preferredSchedule", e.target.value)}
        >
          <option value="">Select preferred schedule</option>
          {SCHEDULES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="deliveryExperience" className="mb-1.5 block text-sm font-semibold text-slate-800">
          Delivery experience
        </label>
        <select
          id="deliveryExperience"
          className="field-input w-full"
          value={form.deliveryExperience}
          onChange={(e) => setStr("deliveryExperience", e.target.value)}
        >
          <option value="">Select your experience level</option>
          {EXPERIENCE_LEVELS.map((l) => (
            <option key={l.value} value={l.value}>{l.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="readinessLevel" className="mb-1.5 block text-sm font-semibold text-slate-800">
          How ready are you to start?
        </label>
        <select
          id="readinessLevel"
          className="field-input w-full"
          value={form.readinessLevel}
          onChange={(e) => setStr("readinessLevel", e.target.value)}
        >
          <option value="">Select your readiness</option>
          {READINESS_LEVELS.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
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
        {pending ? "Saving your answers…" : "Continue My SLYDE Application"}
      </button>
    </form>
  );
}
