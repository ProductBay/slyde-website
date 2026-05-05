import type { Metadata } from "next";
import { ReferASlyderFaq } from "@/components/site/refer-a-slyder/refer-a-slyder-faq";
import { SlyderReferralHero } from "@/components/site/referrals/referral-hero";
import { SlyderNetworkReferralForm } from "@/components/site/referrals/referral-form";
import { SlyderReferralHowItWorks } from "@/components/site/referrals/referral-how-it-works";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata(
  "Refer A Slyder – Earn JMD $5,000",
  "Refer a reliable driver to join SLYDE and earn JMD $5,000 over 5 weekly payouts when they go live and start paying rent.",
  "/refer-a-slyder",
);

export default function ReferASlyderPage() {
  return (
    <>
      <SlyderReferralHero />
      <div id="referral-form">
        <SlyderNetworkReferralForm />
      </div>
      <SlyderReferralHowItWorks />
      <ReferASlyderFaq />
    </>
  );
}
