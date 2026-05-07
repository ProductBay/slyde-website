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

const JOIN_TERMS = [
  "Reserving a Slyder spot only starts your SLYDE lead process. It is not an approval, activation, employment offer, or guarantee of delivery access.",
  "SLYDE may review your parish, transport type, readiness, documents, identity, legal acceptance, and operational needs before inviting you to the next step.",
  "You may need to complete qualification questions, submit documents, accept required legal terms, activate your SLYDE account, and complete readiness steps before going live.",
  "Slyders operate as independent delivery partners where approved and activated. Earnings, availability, dispatch access, and launch timing may vary by area and operational readiness.",
  "You agree to provide accurate information and understand that false, duplicate, incomplete, or unverifiable details may delay, reject, or cancel your Slyder path.",
  "SLYDE may contact you by email, WhatsApp, phone, dashboard updates, or device notifications about status, next actions, launch updates, and required steps.",
];

// TODO: analytics hooks — slyder_lead_started, slyder_lead_submitted

export function SlyderLeadForm({ referredByCode }: { referredByCode?: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lockedReferralCode = referredByCode?.trim().toUpperCase();
  const [joinAgreementAccepted, setJoinAgreementAccepted] = useState(false);
  const [agreementOpen, setAgreementOpen] = useState(false);

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
          ...(lockedReferralCode ? { referredByCode: lockedReferralCode } : {}),
          joinAgreementAccepted,
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
      {lockedReferralCode ? (
        <div className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3">
          <label htmlFor="referralCode" className="mb-1.5 block text-sm font-semibold text-slate-800">
            Referral Code
          </label>
          <input
            id="referralCode"
            type="text"
            readOnly
            tabIndex={-1}
            className="field-input w-full cursor-not-allowed border-sky-200 bg-white font-mono font-semibold uppercase text-slate-950"
            value={lockedReferralCode}
          />
          <p className="mt-1.5 text-xs font-medium text-sky-800">
            This code is locked from your referral link and will be attached to your Slyder signup.
          </p>
        </div>
      ) : null}

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

      <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
              SLYDE Slyder Join Agreement
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Review and accept the first-step Slyder terms before reserving your spot.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAgreementOpen(true)}
            className="rounded-full border border-sky-200 bg-white px-4 py-2 text-sm font-semibold text-sky-800 shadow-sm transition hover:border-sky-300 hover:bg-sky-100"
          >
            View Agreement
          </button>
        </div>
        <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-white bg-white p-3 text-sm text-slate-700 shadow-sm">
          <input
            required
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-slate-300 text-sky-600"
            checked={joinAgreementAccepted}
            onChange={(e) => setJoinAgreementAccepted(e.target.checked)}
          />
          <span>
            I have read and agree to the SLYDE Slyder Join Agreement.
          </span>
        </label>
      </div>

      {agreementOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="slyder-join-agreement-title"
          onClick={() => setAgreementOpen(false)}
        >
          <div
            className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
                  SLYDE Slyder Join Agreement
                </p>
                <h3 id="slyder-join-agreement-title" className="mt-2 text-xl font-semibold text-slate-950">
                  Before you reserve your spot
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAgreementOpen(false)}
                className="h-9 w-9 rounded-full border border-slate-200 text-lg leading-none text-slate-500 transition hover:bg-slate-50"
                aria-label="Close agreement"
              >
                x
              </button>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Please review these terms so it is clear what this first step means and what may happen next.
            </p>
            <ul className="mt-4 space-y-2.5">
              {JOIN_TERMS.map((term) => (
                <li key={term} className="flex gap-2.5 text-sm leading-6 text-slate-700">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-600" />
                  <span>{term}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  setJoinAgreementAccepted(true);
                  setAgreementOpen(false);
                }}
                className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
              >
                Accept Agreement
              </button>
              <button
                type="button"
                onClick={() => setAgreementOpen(false)}
                className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending || !joinAgreementAccepted}
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
