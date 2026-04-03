"use client";

import { useEffect, useMemo, useState } from "react";
import { CreditCard, Gift, Search } from "lucide-react";
import { TurnstileWidget } from "@/components/site/turnstile-widget";
import { Button } from "@/components/ui/button";

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

function canClaim(reward: LookupReward | null) {
  return reward && ["earned", "claim_pending"].includes(reward.status);
}

function canGift(reward: LookupReward | null) {
  return reward && reward.isTransferable && reward.transferCount < 1 && ["earned", "claim_pending", "gift_pending"].includes(reward.status);
}

export function ReferralRewardsDashboard({
  initialCode = "",
}: {
  initialCode?: string;
}) {
  const [code, setCode] = useState(initialCode);
  const [payload, setPayload] = useState<LookupPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [claimForm, setClaimForm] = useState({ customerAccountId: "", phone: "" });
  const [giftForm, setGiftForm] = useState({ recipientCustomerAccountId: "", recipientPhone: "" });
  const [submittingAction, setSubmittingAction] = useState<"claim" | "gift" | null>(null);

  const normalizedCode = useMemo(() => code.trim().toUpperCase(), [code]);

  async function loadReferral(selectedCode = normalizedCode) {
    if (!selectedCode) {
      setLookupError("Enter a referral code to load the reward dashboard.");
      setPayload(null);
      return;
    }

    setLoading(true);
    setLookupError(null);
    setActionMessage(null);
    setActionError(null);

    const response = await fetch(`/api/public/referrals/slyder/lookup?code=${encodeURIComponent(selectedCode)}`, {
      cache: "no-store",
    });
    const json = (await response.json().catch(() => null)) as { error?: string } & LookupPayload | null;

    if (!response.ok || !json || "error" in json) {
      setPayload(null);
      setLookupError(typeof json?.error === "string" ? json.error : "We could not load that referral.");
      setLoading(false);
      return;
    }

    setPayload(json);
    setLoading(false);
  }

  useEffect(() => {
    if (initialCode) {
      void loadReferral(initialCode.trim().toUpperCase());
    }
  }, [initialCode]);

  async function onAction(
    action: "claim" | "gift",
    body: Record<string, string>,
  ) {
    if (!payload?.reward) {
      setActionError("No earned reward is available for this referral yet.");
      return;
    }

    if (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && !turnstileToken) {
      setActionError("Complete the bot protection check before continuing.");
      return;
    }

    setSubmittingAction(action);
    setActionError(null);
    setActionMessage(null);

    const route = action === "claim" ? "/api/public/referrals/rewards/claim" : "/api/public/referrals/rewards/gift";
    const response = await fetch(route, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(turnstileToken ? { "x-turnstile-token": turnstileToken } : {}),
      },
      body: JSON.stringify({
        referralCode: payload.referralCode,
        ...body,
      }),
    });

    const json = (await response.json().catch(() => null)) as { error?: string } | null;

    if (!response.ok) {
      setActionError(typeof json?.error === "string" ? json.error : "The reward action could not be completed.");
      setSubmittingAction(null);
      return;
    }

    setActionMessage(action === "claim" ? "Reward claimed successfully." : "Reward gifted successfully.");
    setSubmittingAction(null);
    await loadReferral(payload.referralCode);
  }

  return (
    <section className="section-shell py-14">
      <div className="grid gap-8 lg:grid-cols-[0.84fr_1.16fr]">
        <div className="space-y-6">
          <div className="surface-panel p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">My Referral Rewards</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">Claim or gift an earned referral reward</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              This dashboard is for public referral rewards only. It tracks the non-cash SLYDE credit attached to a referral code after the referred Slyder completes the required milestone.
            </p>

            <form
              className="mt-8 grid gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                void loadReferral();
              }}
            >
              <label className="field-shell">
                <span className="field-label">Referral code</span>
                <input
                  className="field-input"
                  placeholder="SLY-XXXXXX"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                />
              </label>
              {lookupError ? <p className="text-sm font-medium text-rose-600">{lookupError}</p> : null}
              <Button type="submit" disabled={loading} leadingIcon={<Search className="h-4 w-4" />}>
                {loading ? "Loading..." : "Load Reward Dashboard"}
              </Button>
            </form>
          </div>

          <div className="surface-panel p-8">
            <p className="text-sm font-semibold text-slate-950">How this works</p>
            <div className="mt-4 grid gap-3 text-sm leading-7 text-slate-600">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">Referral submission alone does not create a reward.</div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">The referred Slyder must reach the first live delivery milestone.</div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">Claiming binds the reward to a customer account. Gifting transfers it one time only.</div>
            </div>
          </div>
        </div>

        <div className="surface-panel p-8">
          {payload ? (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Reward dashboard</p>
                  <h3 className="mt-2 text-2xl font-semibold text-slate-950">{payload.referralCode}</h3>
                </div>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700">
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

              {payload.reward ? (
                <div className="grid gap-4 xl:grid-cols-2">
                  <div className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50 px-5 py-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Reward value</p>
                    <p className="mt-3 text-3xl font-semibold text-slate-950">
                      {payload.reward.currency} {payload.reward.rewardValue}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-slate-700">
                      Minimum order: {payload.reward.minOrderValue ? `${payload.reward.currency} ${payload.reward.minOrderValue}` : "Not set"}
                    </p>
                  </div>

                  <div className="rounded-[1.75rem] border border-slate-200 bg-white px-5 py-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Reward state</p>
                    <div className="mt-3 grid gap-2 text-sm leading-7 text-slate-700">
                      <p><span className="font-medium text-slate-950">Status:</span> {payload.reward.status.replaceAll("_", " ")}</p>
                      <p><span className="font-medium text-slate-950">Expires:</span> {formatDate(payload.reward.expiresAt)}</p>
                      <p><span className="font-medium text-slate-950">Transfer count:</span> {payload.reward.transferCount}</p>
                      <p><span className="font-medium text-slate-950">Transferable:</span> {payload.reward.isTransferable ? "Yes" : "No"}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-[1.75rem] border border-sky-100 bg-sky-50 px-5 py-5 text-sm leading-7 text-slate-700">
                  No reward is ready yet. This dashboard will become actionable after the referred Slyder reaches the first live delivery milestone.
                </div>
              )}

              {actionError ? <p className="text-sm font-medium text-rose-600">{actionError}</p> : null}
              {actionMessage ? <p className="text-sm font-medium text-emerald-700">{actionMessage}</p> : null}

              {payload.reward ? <TurnstileWidget onToken={setTurnstileToken} /> : null}

              <div className="grid gap-6 xl:grid-cols-2">
                <form
                  className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void onAction("claim", claimForm);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-sky-700" />
                    <p className="text-lg font-semibold text-slate-950">Claim for yourself</p>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    Attach the reward to your own SLYDE customer account if the reward is already earned and available.
                  </p>
                  <div className="mt-5 grid gap-4">
                    <input
                      className="field-input"
                      placeholder="Customer account id"
                      value={claimForm.customerAccountId}
                      onChange={(event) => setClaimForm((current) => ({ ...current, customerAccountId: event.target.value }))}
                    />
                    <input
                      className="field-input"
                      placeholder="Customer phone"
                      value={claimForm.phone}
                      onChange={(event) => setClaimForm((current) => ({ ...current, phone: event.target.value }))}
                    />
                    <Button type="submit" variant="secondary" disabled={!canClaim(payload.reward) || submittingAction === "gift" || submittingAction === "claim"}>
                      {submittingAction === "claim" ? "Claiming..." : "Claim Reward"}
                    </Button>
                  </div>
                </form>

                <form
                  className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void onAction("gift", giftForm);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Gift className="h-5 w-5 text-sky-700" />
                    <p className="text-lg font-semibold text-slate-950">Gift once to another customer</p>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    Use this when the reward should be transferred to a friend or family member with an eligible customer account.
                  </p>
                  <div className="mt-5 grid gap-4">
                    <input
                      className="field-input"
                      placeholder="Recipient customer account id"
                      value={giftForm.recipientCustomerAccountId}
                      onChange={(event) => setGiftForm((current) => ({ ...current, recipientCustomerAccountId: event.target.value }))}
                    />
                    <input
                      className="field-input"
                      placeholder="Recipient phone"
                      value={giftForm.recipientPhone}
                      onChange={(event) => setGiftForm((current) => ({ ...current, recipientPhone: event.target.value }))}
                    />
                    <Button type="submit" variant="secondary" disabled={!canGift(payload.reward) || submittingAction === "claim" || submittingAction === "gift"}>
                      {submittingAction === "gift" ? "Gifting..." : "Gift Reward"}
                    </Button>
                  </div>
                </form>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white px-5 py-5 text-sm leading-7 text-slate-700">
                <p><span className="font-medium text-slate-950">Created:</span> {formatDate(payload.createdAt)}</p>
                <p><span className="font-medium text-slate-950">Updated:</span> {formatDate(payload.updatedAt)}</p>
                {payload.reward?.transferredAt ? <p><span className="font-medium text-slate-950">Transferred:</span> {formatDate(payload.reward.transferredAt)}</p> : null}
                {payload.reward?.redeemedAt ? <p><span className="font-medium text-slate-950">Redeemed:</span> {formatDate(payload.reward.redeemedAt)}</p> : null}
              </div>
            </div>
          ) : (
            <div className="flex min-h-[34rem] flex-col justify-center rounded-[1.75rem] border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Rewards view</p>
              <h3 className="mt-4 text-2xl font-semibold text-slate-950">Load a referral code to manage the reward</h3>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                This page will show whether the reward exists yet, whether it is claimable, and whether it can still be gifted.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
