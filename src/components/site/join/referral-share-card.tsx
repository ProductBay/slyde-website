"use client";

import { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";

export function ReferralShareCard({ referralCode, firstName }: { referralCode: string; firstName: string }) {
  const [copied, setCopied] = useState(false);
  const referralUrl = `https://slydenetwork.com/join/slyder?ref=${referralCode}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not available — silent fail
    }
  }

  return (
    <div className="surface-card p-5">
      <div className="flex items-center gap-2">
        <Share2 className="h-5 w-5 text-sky-600" />
        <p className="text-sm font-semibold text-slate-800">Your Referral Link</p>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        Share your link with other couriers. When they reserve a spot, it&apos;s tracked to you.
      </p>
      <div className="mt-3 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5">
        <code className="flex-1 truncate text-xs text-slate-700">{referralUrl}</code>
        <button
          type="button"
          onClick={handleCopy}
          className="shrink-0 rounded-full p-1.5 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
          aria-label="Copy referral link"
        >
          {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        Your code: <span className="font-semibold text-slate-800">{referralCode}</span>
      </p>
      {firstName && (
        <p className="mt-1 text-xs text-slate-400">Linked to your spot, {firstName}.</p>
      )}
    </div>
  );
}
