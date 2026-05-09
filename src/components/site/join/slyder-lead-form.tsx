"use client";

import { useState } from "react";
import Image from "next/image";
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
  const [reservation, setReservation] = useState<{ leadId: string; referralCode: string | null } | null>(null);
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

      setReservation({
        leadId: data.leadId,
        referralCode: data.referralCode ?? null,
      });
    } catch {
      setError("Could not connect. Please check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  const qualificationHref = reservation ? `/join/slyder/qualify?leadId=${reservation.leadId}` : "";
  const siteOrigin = typeof window !== "undefined" ? window.location.origin : "https://slydenetwork.com";
  const referralLink = reservation?.referralCode
    ? `${siteOrigin}/join/slyder?ref=${encodeURIComponent(reservation.referralCode)}`
    : `${siteOrigin}/refer-a-slyder`;
  const referralMessage = `I just reserved my SLYDE Slyder spot. Join the SLYDE network with my referral link: ${referralLink}`;
  const whatsappShareHref = `https://wa.me/?text=${encodeURIComponent(referralMessage)}`;

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

      {reservation ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 px-4 py-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="slyder-referral-promo-title"
        >
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl sm:p-6">
            <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div className="relative overflow-hidden rounded-3xl border border-sky-100 bg-slate-950 p-5 text-white">
                <div className="absolute inset-x-0 top-0 h-24 bg-sky-500/20" />
                <div className="relative mx-auto flex max-w-[260px] justify-center">
                  <Image
                    src="/images/glyde-whatsapp-cta.png"
                    alt="GLYDE holding the SLYDE referral invite"
                    width={320}
                    height={320}
                    className="h-auto w-full drop-shadow-2xl"
                    priority
                  />
                </div>
                <div className="relative mt-4 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">
                    GLYDE tip
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white">
                    Share your SLYDE link now. The faster your area fills with reliable Slyders, the faster the network becomes stronger for everyone.
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
                  Slyder spot reserved
                </p>
                <h3 id="slyder-referral-promo-title" className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  Earn, refer, and help build the SLYDE network faster.
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  You are now in the Slyder join path. Before you continue, share your referral link with reliable riders and drivers in your parish so they can reserve a spot too.
                </p>

                {reservation.referralCode ? (
                  <div className="mt-4 rounded-2xl border border-sky-100 bg-sky-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">Your referral code</p>
                    <p className="mt-1 font-mono text-2xl font-bold text-slate-950">{reservation.referralCode}</p>
                    <p className="mt-2 break-all text-xs font-medium text-slate-600">{referralLink}</p>
                  </div>
                ) : null}

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {[
                    "Earn when qualified referral rewards are active.",
                    "Help your parish reach launch readiness faster.",
                    "Bring trusted people into the SLYDE network early.",
                  ].map((item) => (
                    <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs font-semibold leading-5 text-slate-700">
                      {item}
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <a
                    href={whatsappShareHref}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-full bg-green-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-700"
                  >
                    Share on WhatsApp
                  </a>
                  <button
                    type="button"
                    onClick={() => router.push(qualificationHref)}
                    className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5"
                  >
                    Continue my Slyder steps
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => router.push(qualificationHref)}
                  className="mt-4 text-sm font-semibold text-slate-500 underline-offset-4 hover:text-slate-950 hover:underline"
                >
                  Skip sharing for now
                </button>
              </div>
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
