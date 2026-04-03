"use client";

import { useState } from "react";
import type { PublicSlyderReferral } from "@/types/backend/onboarding";
import { Button } from "@/components/ui/button";
import { ReferralStatusBadge } from "@/components/admin/referrals/referral-status-badge";

export function ReferralDetailCard({ referral }: { referral: PublicSlyderReferral }) {
  const [linkApplicationId, setLinkApplicationId] = useState("");
  const [disqualifyReason, setDisqualifyReason] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function postAction(path: string, body: Record<string, unknown>) {
    setBusy(path);
    setMessage(null);
    const response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    setBusy(null);
    if (!response.ok) {
      setMessage(payload?.error || "The action could not be completed.");
      return;
    }
    setMessage("Action completed. Refresh the page to see the latest state.");
  }

  return (
    <div className="surface-panel p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">Referral detail</p>
          <h3 className="mt-3 text-2xl font-semibold text-slate-950">{referral.referredName}</h3>
          <p className="mt-2 text-sm leading-7 text-slate-600">Referral code: {referral.referralCode}</p>
        </div>
        <ReferralStatusBadge status={referral.status} />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-surface-1 p-4 text-sm leading-7 text-slate-600">
          <p className="font-medium text-slate-950">Referrer</p>
          <p>{referral.referrerName}</p>
          <p>{referral.referrerPhone}</p>
          {referral.referrerEmail ? <p>{referral.referrerEmail}</p> : null}
        </div>
        <div className="rounded-3xl border border-slate-200 bg-surface-1 p-4 text-sm leading-7 text-slate-600">
          <p className="font-medium text-slate-950">Referred driver</p>
          <p>{referral.referredName}</p>
          {referral.referredEmail ? <p>{referral.referredEmail}</p> : null}
          <p>{referral.referredPhone}</p>
          <p>{referral.referredTown || referral.referredParish || "Location not specified"}</p>
        </div>
      </div>

      {referral.notes ? (
        <div className="mt-4 rounded-3xl border border-slate-200 bg-surface-1 p-4 text-sm leading-7 text-slate-600">
          <p className="font-medium text-slate-950">Notes</p>
          <p className="mt-2">{referral.notes}</p>
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-surface-1 p-4">
          <p className="text-sm font-semibold text-slate-950">Link to Slyder application</p>
          <input className="field-input mt-3" placeholder="Application id" value={linkApplicationId} onChange={(event) => setLinkApplicationId(event.target.value)} />
          <Button className="mt-3 w-full" onClick={() => postAction(`/api/admin/referrals/${referral.id}/link-application`, { applicationId: linkApplicationId })} disabled={!linkApplicationId.trim() || busy !== null}>
            Link application
          </Button>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-surface-1 p-4">
          <p className="text-sm font-semibold text-slate-950">Disqualify referral</p>
          <input className="field-input mt-3" placeholder="Reason" value={disqualifyReason} onChange={(event) => setDisqualifyReason(event.target.value)} />
          <Button variant="secondary" className="mt-3 w-full" onClick={() => postAction(`/api/admin/referrals/${referral.id}/disqualify`, { reason: disqualifyReason })} disabled={!disqualifyReason.trim() || busy !== null}>
            Disqualify
          </Button>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-surface-1 p-4">
          <p className="text-sm font-semibold text-slate-950">First live delivery</p>
          <p className="mt-3 text-sm leading-7 text-slate-600">Use this once the referred Slyder has completed their first real delivery so the launch reward can be created.</p>
          <Button className="mt-3 w-full" onClick={() => postAction(`/api/admin/referrals/${referral.id}/mark-first-delivery`, {})} disabled={busy !== null}>
            Mark first delivery complete
          </Button>
        </div>
      </div>

      {message ? <p className="mt-4 text-sm font-medium text-sky-700">{message}</p> : null}
    </div>
  );
}
