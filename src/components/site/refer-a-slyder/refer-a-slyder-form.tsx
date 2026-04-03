"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { TurnstileWidget } from "@/components/site/turnstile-widget";
import { Button } from "@/components/ui/button";

type FormState = {
  referrerName: string;
  referrerPhone: string;
  referrerEmail: string;
  referredName: string;
  referredEmail: string;
  referredPhone: string;
  referredParish: string;
  referredTown: string;
  referredVehicleType: string;
  notes: string;
};

const initialState: FormState = {
  referrerName: "",
  referrerPhone: "",
  referrerEmail: "",
  referredName: "",
  referredEmail: "",
  referredPhone: "",
  referredParish: "",
  referredTown: "",
  referredVehicleType: "",
  notes: "",
};

export function ReferASlyderForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    if (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && !turnstileToken) {
      setMessage("Complete the bot protection check before submitting.");
      setSubmitting(false);
      return;
    }

    const response = await fetch("/api/public/referrals/slyder", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(turnstileToken ? { "x-turnstile-token": turnstileToken } : {}),
      },
      body: JSON.stringify(form),
    });

    const payload = (await response.json().catch(() => null)) as { error?: { fieldErrors?: Record<string, string[]> } | string; referralCode?: string } | null;

    if (!response.ok) {
      if (typeof payload?.error === "string") {
        setMessage(payload.error);
      } else {
        setMessage("We could not submit the referral. Please check the form and try again.");
      }
      setSubmitting(false);
      return;
    }

    const params = new URLSearchParams();
    if (payload?.referralCode) {
      params.set("code", payload.referralCode);
    }
    if (form.referredEmail.trim()) {
      params.set("invite", "sent");
      params.set("email", form.referredEmail.trim());
    }

    const query = params.size ? `?${params.toString()}` : "";
    router.push(`/refer-a-slyder/success${query}`);
  }

  return (
    <section className="section-shell pb-16">
      <div className="surface-panel p-8">
        <div className="grid gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">Submit A Referral</p>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-950">Share the driver details here</h2>
          <p className="text-sm leading-7 text-slate-600">
            Submit someone who is dependable, reachable, and serious about joining the SLYDE network. The reward only unlocks if they become an active Slyder and complete a first live delivery.
          </p>
        </div>
        <form className="mt-8 grid gap-4" onSubmit={onSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <input className="field-input" placeholder="Your name" value={form.referrerName} onChange={(event) => setForm((current) => ({ ...current, referrerName: event.target.value }))} />
            <input className="field-input" placeholder="Your phone" value={form.referrerPhone} onChange={(event) => setForm((current) => ({ ...current, referrerPhone: event.target.value }))} />
            <input className="field-input md:col-span-2" placeholder="Your email (optional)" value={form.referrerEmail} onChange={(event) => setForm((current) => ({ ...current, referrerEmail: event.target.value }))} />
            <input className="field-input" placeholder="Driver name" value={form.referredName} onChange={(event) => setForm((current) => ({ ...current, referredName: event.target.value }))} />
            <input className="field-input" placeholder="Driver email (recommended)" value={form.referredEmail} onChange={(event) => setForm((current) => ({ ...current, referredEmail: event.target.value }))} />
            <input className="field-input" placeholder="Driver phone" value={form.referredPhone} onChange={(event) => setForm((current) => ({ ...current, referredPhone: event.target.value }))} />
            <input className="field-input" placeholder="Parish / area (optional)" value={form.referredParish} onChange={(event) => setForm((current) => ({ ...current, referredParish: event.target.value }))} />
            <input className="field-input" placeholder="Town (optional)" value={form.referredTown} onChange={(event) => setForm((current) => ({ ...current, referredTown: event.target.value }))} />
            <input className="field-input md:col-span-2" placeholder="Vehicle type (optional)" value={form.referredVehicleType} onChange={(event) => setForm((current) => ({ ...current, referredVehicleType: event.target.value }))} />
            <textarea className="field-input min-h-32 md:col-span-2" placeholder="Notes (optional)" value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} />
          </div>
          {message ? <p className="text-sm font-medium text-rose-600">{message}</p> : null}
          <div className="flex flex-col gap-3 rounded-[1.5rem] border border-sky-100 bg-sky-50 p-5 text-sm leading-7 text-slate-600">
            <p className="font-semibold text-slate-950">Reward reminder</p>
            <p>This referral does not create an instant reward. The milestone is only reached after the referred Slyder becomes active and completes a first real live delivery.</p>
            <p>If the driver email is provided, SLYDE can also send them a direct application invite with the referral attached.</p>
          </div>
          <TurnstileWidget onToken={setTurnstileToken} />
          <div className="flex justify-start">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Referral"}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
