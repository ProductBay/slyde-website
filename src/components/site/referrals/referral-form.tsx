"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type FormState = {
  referrerName: string;
  referrerWhatsapp: string;
  referrerEmail: string;
  referredFirstName: string;
  referredLastName: string;
  referredWhatsapp: string;
  referredEmail: string;
  referralAgreementAccepted: boolean;
};

const INITIAL: FormState = {
  referrerName: "",
  referrerWhatsapp: "",
  referrerEmail: "",
  referredFirstName: "",
  referredLastName: "",
  referredWhatsapp: "",
  referredEmail: "",
  referralAgreementAccepted: false,
};

const REFERRAL_TERMS = [
  "A referral is tracked when a new Slyder uses your referral link or locked referral code to join the SLYDE Slyder lead flow.",
  "A referral reward is not earned when the link is created. The referred person must move through SLYDE review, be approved, activate, go live, and meet the published reward requirements.",
  "The current referral model is JMD $5,000 total potential reward per eligible live Slyder, paid as JMD $1,000 across each of their first five qualifying weekly rent payments.",
  "SLYDE may reject, cancel, or withhold referral rewards for duplicate referrals, self-referrals, false information, fraud, abuse, spam, or referrals that do not meet operational requirements.",
  "You agree to only refer people who may reasonably be interested in becoming a Slyder and not to represent that approval, employment, activation, or payment is guaranteed.",
  "SLYDE may contact you and the referred person by email, WhatsApp, or phone about referral status, next steps, verification, and payout administration.",
];

export function SlyderNetworkReferralForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/public/slyder-referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referrerName: form.referrerName,
          referrerWhatsapp: form.referrerWhatsapp,
          referrerEmail: form.referrerEmail || undefined,
          referredFirstName: form.referredFirstName || undefined,
          referredLastName: form.referredLastName || undefined,
          referredWhatsapp: form.referredWhatsapp || undefined,
          referredEmail: form.referredEmail || undefined,
          referralAgreementAccepted: form.referralAgreementAccepted,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Could not create referral.");
      }

      router.push(`/refer-a-slyder/slyder-success?code=${encodeURIComponent(data.referralCode)}&link=${encodeURIComponent(data.referralLink)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="section-shell py-12">
      <div className="mx-auto max-w-2xl">
        <form onSubmit={handleSubmit} className="surface-panel space-y-6 p-6 sm:p-8">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Your details</h2>
            <p className="mt-1 text-sm text-slate-500">We need your contact info so you can track the referral and SLYDE can pay you when it qualifies.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Full name <span className="text-red-500">*</span>
              </label>
              <input
                required
                className="field-input w-full"
                placeholder="Your name"
                value={form.referrerName}
                onChange={update("referrerName")}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                WhatsApp number <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="tel"
                className="field-input w-full"
                placeholder="876-XXX-XXXX"
                value={form.referrerWhatsapp}
                onChange={update("referrerWhatsapp")}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="email"
                className="field-input w-full"
                placeholder="your@email.com"
                value={form.referrerEmail}
                onChange={update("referrerEmail")}
              />
            </div>
          </div>

          <hr className="border-slate-100" />

          <div>
            <h2 className="text-xl font-semibold text-slate-950">Who are you referring?</h2>
            <p className="mt-1 text-sm text-slate-500">Optional — fill in if you know their details and want to link them directly.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">First name</label>
              <input
                className="field-input w-full"
                placeholder="First name"
                value={form.referredFirstName}
                onChange={update("referredFirstName")}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Last name</label>
              <input
                className="field-input w-full"
                placeholder="Last name"
                value={form.referredLastName}
                onChange={update("referredLastName")}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Their WhatsApp</label>
              <input
                type="tel"
                className="field-input w-full"
                placeholder="876-XXX-XXXX"
                value={form.referredWhatsapp}
                onChange={update("referredWhatsapp")}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Their email</label>
              <input
                type="email"
                className="field-input w-full"
                placeholder="their@email.com"
                value={form.referredEmail}
                onChange={update("referredEmail")}
              />
            </div>
          </div>

          <hr className="border-slate-100" />

          <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4 sm:p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
              SLYDE Slyder Referral Agreement
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">How the referral works</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Please review and accept these terms before creating your referral link. This agreement explains how SLYDE tracks referrals and when referral rewards may become payable.
            </p>
            <ul className="mt-4 space-y-2.5">
              {REFERRAL_TERMS.map((term) => (
                <li key={term} className="flex gap-2.5 text-sm leading-6 text-slate-700">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-600" />
                  <span>{term}</span>
                </li>
              ))}
            </ul>
            <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-white bg-white p-3 text-sm text-slate-700 shadow-sm">
              <input
                required
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-slate-300 text-sky-600"
                checked={form.referralAgreementAccepted}
                onChange={(e) => setForm((prev) => ({ ...prev, referralAgreementAccepted: e.target.checked }))}
              />
              <span>
                I have read and agree to the SLYDE Slyder Referral Agreement. I understand that creating a referral link does not guarantee approval, activation, or payment, and that referral rewards depend on SLYDE eligibility, verification, and payout rules.
              </span>
            </label>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !form.referralAgreementAccepted}
            className="w-full rounded-full bg-sky-600 py-3 text-sm font-bold text-white hover:bg-sky-700 disabled:opacity-50"
          >
            {submitting ? "Creating…" : "Create My Referral Link"}
          </button>

          <p className="text-center text-xs text-slate-400">
            Use this same email at /refer to track Slyder signups, progress, and potential referral earnings.
          </p>
        </form>
      </div>
    </section>
  );
}
