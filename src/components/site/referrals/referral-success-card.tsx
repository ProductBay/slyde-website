"use client";

import Link from "next/link";
import { useState } from "react";

export function SlyderReferralSuccessCard({
  referralCode,
  referralLink,
}: {
  referralCode: string;
  referralLink: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for older browsers
    }
  }

  return (
    <div className="surface-panel space-y-6 p-6 sm:p-8">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
          <svg className="h-8 w-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-950">Referral Created!</h1>
        <p className="mt-2 text-sm text-slate-500">
          Your unique referral code and link are below. Share them to start earning.
        </p>
      </div>

      <div className="rounded-xl border border-sky-100 bg-sky-50 p-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-sky-500">Your referral code</p>
        <p className="mt-1 font-mono text-2xl font-bold text-sky-700">{referralCode}</p>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Your referral link</p>
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <span className="flex-1 truncate font-mono text-xs text-slate-600">{referralLink}</span>
          <button
            onClick={copyLink}
            className="shrink-0 rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-700"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-sky-100 bg-sky-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-600">Next action</p>
        <p className="mt-2 text-sm font-semibold text-slate-950">Open your Referrer Dashboard</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Log in with the same email you used to create this referral link. Your dashboard will show who signs up with
          your code, their Slyder progress, and your potential JMD earnings.
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Link
            href="/refer"
            className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-slate-950 px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5"
          >
            Track in Referrer Dashboard
          </Link>
          <Link
            href={`/refer-a-slyder/status?code=${encodeURIComponent(referralCode)}`}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5"
          >
            Check this referral
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-900">How you get paid</p>
        <ul className="mt-2 space-y-1.5 text-sm text-slate-600">
          <li>• When your referred Slyder goes live, SLYDE activates your reward</li>
          <li>• For each of their first 5 weekly rent payments, you earn JMD $1,000</li>
          <li>• Total reward: JMD $5,000 over 5 qualifying weeks</li>
          <li>• SLYDE contacts you via WhatsApp to arrange each payout</li>
        </ul>
      </div>
    </div>
  );
}
