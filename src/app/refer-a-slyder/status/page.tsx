import type { Metadata } from "next";
import { ReferralStatusChecker } from "@/components/site/refer-a-slyder/referral-status-checker";
import { SectionHeading } from "@/components/site/section-heading";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata(
  "Referral Status Checker",
  "Check the status of a public SLYDE referral and see whether it has moved into application, approval, and reward milestones.",
  "/refer-a-slyder/status",
);

export default async function ReferralStatusPage({
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
          eyebrow="Public Referral Tracking"
          title="Track your referral without contacting support"
          description="Use the referral code from your confirmation screen to see progress from submission through reward readiness."
        />
      </section>
      <ReferralStatusChecker initialCode={code} />
    </>
  );
}
