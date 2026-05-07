import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/metadata";
import { lookupReferralCode } from "@/modules/referrals/services/slyder-referral.service";

export const metadata: Metadata = buildMetadata(
  "Join SLYDE - You're Invited",
  "You've been referred to join SLYDE as a Slyder. Claim your spot today.",
  "/r",
);

export default async function ReferralLandingPage({
  params,
}: {
  params: Promise<{ referralCode: string }>;
}) {
  const { referralCode } = await params;
  const code = referralCode?.trim().toUpperCase();

  if (!code) {
    redirect("/refer-a-slyder");
  }

  const referral = await lookupReferralCode(code);
  if (!referral) {
    redirect("/refer-a-slyder");
  }

  redirect(`/join/slyder?ref=${encodeURIComponent(code)}`);
}
