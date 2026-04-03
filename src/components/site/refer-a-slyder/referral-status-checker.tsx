"use client";

import { useMemo, useState } from "react";
import { Search, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";

type LookupReward = {
  status: string;
  rewardType: string;
  rewardValue: number;
  currency: string;
  minOrderValue?: number;
  expiresAt: string;
  isTransferable: boolean;
  transferCount: number;
  transferredAt?: string;
  redeemedAt?: string;
  claimedByReferrer: boolean;
  giftedToRecipient: boolean;
};

type LookupPayload = {
  referralCode: string;
  referrerName: string;
  referredName: string;
  status: string;
  statusReason?: string;
  rewardStatus?: string;
  createdAt: string;
  updatedAt: string;
  reward: LookupReward | null;
};

function formatDate(value?: string) {
  if (!value) return "Not available";
  return new Date(value).toLocaleString("en-JM");
}

function statusTone(status: string) {
  if (["reward_earned", "reward_claimed", "reward_gifted", "reward_redeemed", "ready", "approved"].includes(status)) {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }
  if (["duplicate_flagged", "disqualified", "expired"].includes(status)) {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }
  return "border-sky-200 bg-sky-50 text-sky-800";
}

function rewardHeadline(payload: LookupPayload | null) {
  if (!payload?.reward) return "No reward has been earned yet.";
  if (payload.reward.status === "claimed_by_referrer") return "Reward claimed by the referrer.";
  if (payload.reward.status === "gifted") return "Reward gifted to another customer account.";
  if (payload.reward.status === "redeemed") return "Reward already redeemed.";
  if (payload.reward.status === "expired") return "Reward expired before redemption.";
  return "Reward is available or in progress.";
}

export function ReferralStatusChecker({
  initialCode = "",
}: {
  initialCode?: string;
}) {
  const [code, setCode] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payload, setPayload] = useState<LookupPayload | null>(null);

  const normalizedCode = useMemo(() => code.trim().toUpperCase(), [code]);

  async function onLookup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!normalizedCode) {
      setError("Enter your referral code to check the status.");
      setPayload(null);
      return;
    }

    setLoading(true);
    setError(null);

    const response = await fetch(`/api/public/referrals/slyder/lookup?code=${encodeURIComponent(normalizedCode)}`, {
      cache: "no-store",
    });
    const json = (await response.json().catch(() => null)) as { error?: string } & LookupPayload | null;

    if (!response.ok || !json || "error" in json) {
      setPayload(null);
      setError(typeof json?.error === "string" ? json.error : "We could not find a referral for that code.");
      setLoading(false);
      return;
    }

    setPayload(json);
    setLoading(false);
  }

  return (
    <section className="section-shell py-14">
      <div className="grid gap-8 lg:grid-cols-[0.86fr_1.14fr]">
        <div className="surface-panel p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">Referral Status Checker</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">Check where your referral stands</h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            Enter the referral code from your confirmation screen to see whether the referral has moved into application,
            approval, readiness, and reward stages.
          </p>

          <form className="mt-8 grid gap-4" onSubmit={onLookup}>
            <label className="field-shell">
              <span className="field-label">Referral code</span>
              <input
                className="field-input"
                placeholder="SLY-XXXXXX"
                value={code}
                onChange={(event) => setCode(event.target.value)}
              />
            </label>
            {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}
            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={loading} leadingIcon={<Search className="h-4 w-4" />}>
                {loading ? "Checking..." : "Check Referral"}
              </Button>
              <LinkButton href={normalizedCode ? `/refer-a-slyder/rewards?code=${encodeURIComponent(normalizedCode)}` : "/refer-a-slyder/rewards"} variant="secondary">
                Open Rewards Dashboard
              </LinkButton>
            </div>
          </form>
        </div>

        <div className="surface-panel p-8">
          {payload ? (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Live status</p>
                  <h3 className="mt-2 text-2xl font-semibold text-slate-950">{payload.referralCode}</h3>
                </div>
                <span className={`rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] ${statusTone(payload.status)}`}>
                  {payload.status.replaceAll("_", " ")}
                </span>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Referrer</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{payload.referrerName}</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Referred driver</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{payload.referredName}</p>
                </div>
              </div>

              {payload.statusReason ? (
                <div className="rounded-3xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-7 text-amber-900">
                  {payload.statusReason}
                </div>
              ) : null}

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 bg-white px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Created</p>
                  <p className="mt-2 text-sm text-slate-700">{formatDate(payload.createdAt)}</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Last updated</p>
                  <p className="mt-2 text-sm text-slate-700">{formatDate(payload.updatedAt)}</p>
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-sky-100 bg-sky-50 px-5 py-5">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 text-sky-700" />
                  <div>
                    <p className="text-sm font-semibold text-slate-950">Reward state</p>
                    <p className="mt-2 text-sm leading-7 text-slate-700">{rewardHeadline(payload)}</p>
                    {payload.reward ? (
                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        <p className="text-sm text-slate-700">
                          <span className="font-medium text-slate-950">Reward:</span> {payload.reward.currency} {payload.reward.rewardValue}
                        </p>
                        <p className="text-sm text-slate-700">
                          <span className="font-medium text-slate-950">Reward status:</span> {payload.reward.status.replaceAll("_", " ")}
                        </p>
                        <p className="text-sm text-slate-700">
                          <span className="font-medium text-slate-950">Minimum order:</span>{" "}
                          {payload.reward.minOrderValue ? `${payload.reward.currency} ${payload.reward.minOrderValue}` : "Not set"}
                        </p>
                        <p className="text-sm text-slate-700">
                          <span className="font-medium text-slate-950">Expires:</span> {formatDate(payload.reward.expiresAt)}
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-[22rem] flex-col justify-center rounded-[1.75rem] border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Awaiting lookup</p>
              <h3 className="mt-4 text-2xl font-semibold text-slate-950">Your referral timeline will show here</h3>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                Once a code is entered, this section will show progress, reward state, and whether the referral has moved into the next milestone.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
