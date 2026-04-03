import type { Metadata } from "next";
import { ReferralRewardsDashboard } from "@/components/site/refer-a-slyder/referral-rewards-dashboard";
import { SectionHeading } from "@/components/site/section-heading";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata(
  "My Referral Rewards",
  "View, claim, or gift an earned public SLYDE referral reward using your referral code.",
  "/refer-a-slyder/rewards",
);

export default async function ReferralRewardsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) || {};
  const code = typeof params.code === "string" ? params.code : "";

  return (
    <>
      <section className="section-shell pt-12">
        <SectionHeading
          eyebrow="Referral Rewards"
          title="A customer-facing reward dashboard is now in place"
          description="Load a referral code to review the reward state, then claim it for yourself or gift it once to another eligible customer account."
        />
      </section>
      <ReferralRewardsDashboard initialCode={code} />
    </>
  );
}
