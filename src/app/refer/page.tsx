import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LinkButton } from "@/components/ui/link-button";
import { buildMetadata } from "@/lib/metadata";
import { getReferrerSessionContext } from "@/server/auth/referrer-session";

export const metadata: Metadata = buildMetadata(
  "Referral Dashboard",
  "Sign in to the authenticated SLYDE referrer dashboard to track referral progress, onboarding milestones, and reward state.",
  "/refer",
);

export default async function ReferPage() {
  const session = await getReferrerSessionContext();
  if (session) {
    redirect("/refer/dashboard");
  }

  return (
    <section className="section-shell py-12">
      <div className="surface-panel p-8 sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Referrer Dashboard</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">A proper home for every referral you send</h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">
          Sign in with your referral email to see every referred driver, where they are in the pipeline, whether they are approved or live, and what happened to each reward.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <LinkButton href="/refer/login">Open Referrer Login</LinkButton>
          <LinkButton href="/refer-a-slyder" variant="secondary">Submit A New Referral</LinkButton>
        </div>
      </div>
    </section>
  );
}
