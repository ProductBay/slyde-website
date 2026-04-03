import type { Metadata } from "next";
import { ReferASlyderFaq } from "@/components/site/refer-a-slyder/refer-a-slyder-faq";
import { ReferASlyderForm } from "@/components/site/refer-a-slyder/refer-a-slyder-form";
import { ReferASlyderHero } from "@/components/site/refer-a-slyder/refer-a-slyder-hero";
import { ReferASlyderHowItWorks } from "@/components/site/refer-a-slyder/refer-a-slyder-how-it-works";
import { SectionHeading } from "@/components/site/section-heading";
import { LinkButton } from "@/components/ui/link-button";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata(
  "Refer A Slyder",
  "Refer a reliable driver to the SLYDE network and earn a non-cash SLYDE reward when they go live and complete their first delivery.",
  "/refer-a-slyder",
);

export default function ReferASlyderPage() {
  return (
    <>
      <ReferASlyderHero />
      <ReferASlyderForm />
      <section className="section-shell py-6">
        <div className="surface-panel p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
            <SectionHeading
              eyebrow="After You Refer"
              title="Track the referral, manage the reward, or sign in to your referrer dashboard"
              description="Use the status checker to follow a single referral, open the rewards dashboard when the referral reaches the reward stage, or sign in to the referrer dashboard to see all your referrals in one place."
            />
            <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
              <LinkButton href="/refer/login" variant="secondary">Referrer Login</LinkButton>
              <LinkButton href="/refer-a-slyder/status" variant="secondary">Check Referral Status</LinkButton>
              <LinkButton href="/refer-a-slyder/rewards">Open Rewards Dashboard</LinkButton>
            </div>
          </div>
        </div>
      </section>
      <ReferASlyderHowItWorks />
      <ReferASlyderFaq />
    </>
  );
}
