import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ReferrerLogoutButton } from "@/components/site/referrer-logout-button";
import { buildMetadata } from "@/lib/metadata";
import { getReferrerReferralDetail } from "@/modules/referrals/services/referrer-dashboard.service";
import { getReferrerSessionContext } from "@/server/auth/referrer-session";

export const metadata: Metadata = buildMetadata(
  "Referral Detail",
  "Inspect the full milestone trail and reward state for a single authenticated SLYDE referral.",
  "/refer/dashboard",
);

function formatDate(value?: string) {
  if (!value) return "Not yet";
  return new Date(value).toLocaleString("en-JM");
}

export default async function ReferrerReferralDetailPage({
  params,
}: {
  params: Promise<{ referralId: string }>;
}) {
  const session = await getReferrerSessionContext();
  if (!session) {
    redirect("/refer/login");
  }

  const { referralId } = await params;
  const detail = await getReferrerReferralDetail(session.account.id, referralId);
  if (!detail) {
    notFound();
  }

  const milestones = [
    ["Submitted", detail.referral.createdAt],
    ["Invite email sent", detail.referral.inviteEmailSentAt],
    ["Application started", detail.referral.applicationStartedAt],
    ["Application completed", detail.referral.applicationCompletedAt],
    ["Approved", detail.referral.approvedAt],
    ["Activated", detail.referral.activatedAt],
    ["Ready", detail.referral.readyAt],
    ["First delivery completed", detail.referral.firstDeliveryCompletedAt],
    ["Reward earned", detail.referral.rewardEarnedAt],
    ["Reward claimed", detail.referral.rewardClaimedAt],
    ["Reward gifted", detail.referral.rewardGiftedAt],
    ["Reward redeemed", detail.referral.rewardRedeemedAt],
  ] as const;

  return (
    <section className="section-shell py-10">
      <div className="grid gap-6">
        <div className="surface-panel p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Referral Detail</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{detail.referral.referredName}</h1>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Referral code {detail.referral.referralCode}. Current status: {detail.referral.status.replaceAll("_", " ")}.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/refer/dashboard" className="inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 transition hover:-translate-y-0.5">
                Back to dashboard
              </Link>
              <ReferrerLogoutButton />
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="surface-panel p-8">
            <h2 className="text-xl font-semibold text-slate-950">Milestones</h2>
            <div className="mt-6 grid gap-4">
              {milestones.map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4 text-sm">
                  <span className="font-medium text-slate-950">{label}</span>
                  <span className="text-right text-slate-600">{formatDate(value || undefined)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6">
            <div className="surface-panel p-8">
              <h2 className="text-xl font-semibold text-slate-950">Reward state</h2>
              {detail.reward ? (
                <div className="mt-5 grid gap-3 text-sm text-slate-600">
                  <p><span className="font-medium text-slate-950">Status:</span> {detail.reward.status.replaceAll("_", " ")}</p>
                  <p><span className="font-medium text-slate-950">Value:</span> {detail.reward.currency} {detail.reward.rewardValue}</p>
                  <p><span className="font-medium text-slate-950">Expires:</span> {formatDate(detail.reward.expiresAt)}</p>
                  <p><span className="font-medium text-slate-950">Transfer count:</span> {detail.reward.transferCount}</p>
                </div>
              ) : (
                <p className="mt-5 text-sm leading-7 text-slate-600">This referral has not earned a reward yet.</p>
              )}
            </div>

            <div className="surface-panel p-8">
              <h2 className="text-xl font-semibold text-slate-950">Event trail</h2>
              {detail.events.length ? (
                <div className="mt-5 grid gap-4">
                  {detail.events.map((event) => (
                    <div key={event.id} className="border-b border-slate-100 pb-4 text-sm">
                      <p className="font-medium text-slate-950">{event.title}</p>
                      <p className="mt-1 text-slate-500">{formatDate(event.createdAt)}</p>
                      {event.description ? <p className="mt-2 leading-7 text-slate-600">{event.description}</p> : null}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-5 text-sm leading-7 text-slate-600">No explicit referral events have been recorded yet for this referral.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
