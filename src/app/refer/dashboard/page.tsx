import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ReferrerLogoutButton } from "@/components/site/referrer-logout-button";
import { buildMetadata } from "@/lib/metadata";
import { getReferrerReferrals, getReferrerSummary } from "@/modules/referrals/services/referrer-dashboard.service";
import { getReferrerSessionContext } from "@/server/auth/referrer-session";

export const metadata: Metadata = buildMetadata(
  "Referrer Dashboard",
  "View all your SLYDE referrals, milestone progress, and reward state in one authenticated dashboard.",
  "/refer/dashboard",
);

const milestoneFields: Array<{ key: string; label: string }> = [
  { key: "applicationStartedAt", label: "Application started" },
  { key: "applicationCompletedAt", label: "Application completed" },
  { key: "approvedAt", label: "Approved" },
  { key: "activatedAt", label: "Activated" },
  { key: "readyAt", label: "Ready" },
  { key: "firstDeliveryCompletedAt", label: "First delivery" },
  { key: "rewardEarnedAt", label: "Reward earned" },
  { key: "rewardClaimedAt", label: "Reward claimed" },
  { key: "rewardGiftedAt", label: "Reward gifted" },
  { key: "rewardRedeemedAt", label: "Reward redeemed" },
];

const progressStages = [
  { key: "createdAt", label: "Referral submitted" },
  ...milestoneFields,
] as const;

function formatDate(value?: string) {
  if (!value) return "Not yet";
  return new Date(value).toLocaleString("en-JM");
}

function formatStatus(value: string) {
  return value.replaceAll("_", " ");
}

function getReferralProgress(referral: Record<string, unknown>) {
  const completedCount = progressStages.filter((stage) => {
    const value = referral[stage.key as keyof typeof referral];
    return typeof value === "string" && value.length > 0;
  }).length;
  const percent = Math.max(8, Math.round((completedCount / progressStages.length) * 100));
  const latestCompleted = [...progressStages]
    .reverse()
    .find((stage) => {
      const value = referral[stage.key as keyof typeof referral];
      return typeof value === "string" && value.length > 0;
    });
  const nextStage = progressStages[completedCount];

  return {
    completedCount,
    percent: completedCount >= progressStages.length ? 100 : percent,
    latestCompletedLabel: latestCompleted?.label || "Referral submitted",
    nextStageLabel: nextStage?.label || "Complete",
  };
}

export default async function ReferrerDashboardPage() {
  const session = await getReferrerSessionContext();
  if (!session) {
    redirect("/refer/login");
  }

  const [summary, referrals] = await Promise.all([
    getReferrerSummary(session.account.id),
    getReferrerReferrals(session.account.id),
  ]);

  return (
    <section className="section-shell py-10">
      <div className="grid gap-6">
        <div className="surface-panel p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Authenticated Referrer Dashboard</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                {session.account.fullName || session.account.email}
              </h1>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Track every referral linked to {session.account.email}, including onboarding milestones, live progress, and reward outcomes.
              </p>
            </div>
            <ReferrerLogoutButton />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {[
            { label: "Total referrals", value: summary.totalReferrals },
            { label: "Applications completed", value: summary.applicationCompleted },
            { label: "Approved", value: summary.approved },
            { label: "Ready or live", value: summary.ready + summary.firstDeliveryCompleted },
            { label: "Active rewards", value: summary.activeRewards },
          ].map((item) => (
            <div key={item.label} className="surface-panel p-6">
              <p className="text-sm text-slate-500">{item.label}</p>
              <p className="mt-3 text-3xl font-semibold text-slate-950">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="surface-panel overflow-hidden">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-xl font-semibold text-slate-950">Your referrals</h2>
          </div>
          {referrals.length === 0 ? (
            <div className="px-6 py-8 text-sm leading-7 text-slate-600">
              No referrals are linked to this account yet. Use the same email on the public referral form, then request a fresh login code.
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {referrals.map((referral) => {
                const progress = getReferralProgress(referral);

                return (
                <div key={referral.id} className="grid gap-5 px-6 py-6 lg:grid-cols-[1.15fr_1.15fr_1.2fr_auto] lg:items-start">
                  <div className="min-w-0">
                    <p className="text-lg font-semibold text-slate-950">{referral.referredName}</p>
                    <p className="mt-1 text-sm text-slate-600">{referral.referredEmail || referral.referredPhone}</p>
                    <p className="mt-1 text-sm text-slate-500">Code {referral.referralCode}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Current status</p>
                    <p className="mt-2 text-sm font-semibold text-slate-950">{formatStatus(referral.status)}</p>
                    <p className="mt-2 text-sm text-slate-500">Updated {formatDate(referral.updatedAt)}</p>
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Progress</p>
                        <p className="text-sm font-semibold text-slate-950">{progress.percent}%</p>
                      </div>
                      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200/90">
                        <div
                          className="relative h-full rounded-full bg-[linear-gradient(90deg,#0f172a_0%,#0369a1_55%,#38bdf8_100%)] shadow-[0_0_18px_rgba(56,189,248,0.28)] transition-all duration-700 ease-out"
                          style={{ width: `${progress.percent}%` }}
                        >
                          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.38)_40%,transparent_80%)] animate-[pulse_2.6s_ease-in-out_infinite]" />
                        </div>
                      </div>
                      <div className="mt-3 flex items-start justify-between gap-4 text-xs leading-6 text-slate-500">
                        <p>Latest: <span className="font-medium text-slate-700">{progress.latestCompletedLabel}</span></p>
                        <p className="text-right">Next: <span className="font-medium text-slate-700">{progress.nextStageLabel}</span></p>
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    {milestoneFields.slice(0, 4).map((milestone) => (
                      <p key={milestone.key} className="text-sm text-slate-600">
                        <span className="font-medium text-slate-950">{milestone.label}:</span>{" "}
                        {formatDate(referral[milestone.key as keyof typeof referral] as string | undefined)}
                      </p>
                    ))}
                    {referral.reward ? (
                      <p className="text-sm text-slate-600">
                        <span className="font-medium text-slate-950">Reward:</span> {formatStatus(referral.reward.status)}
                      </p>
                    ) : null}
                  </div>
                  <div>
                    <Link href={`/refer/dashboard/${referral.id}`} className="inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5">
                      View detail
                    </Link>
                  </div>
                </div>
              )})}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
