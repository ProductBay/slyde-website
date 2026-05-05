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
};

const INITIAL: FormState = {
  referrerName: "",
  referrerWhatsapp: "",
  referrerEmail: "",
  referredFirstName: "",
  referredLastName: "",
  referredWhatsapp: "",
  referredEmail: "",
};

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
            <p className="mt-1 text-sm text-slate-500">We need your contact info so we can track the referral and pay you when it qualifies.</p>
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
                Email <span className="text-slate-300 normal-case">(optional)</span>
              </label>
              <input
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

          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-sky-600 py-3 text-sm font-bold text-white hover:bg-sky-700 disabled:opacity-50"
          >
            {submitting ? "Creating…" : "Create My Referral Link"}
          </button>

          <p className="text-center text-xs text-slate-400">
            SLYDE Slyders keep 100% of delivery earnings. SLYDE earns from weekly network rent, not commission.
          </p>
        </form>
      </div>
    </section>
  );
}
