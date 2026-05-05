import type { Metadata } from "next";
import { SlyderReferralSuccessCard } from "@/components/site/referrals/referral-success-card";
import { SlyderReferralShareActions } from "@/components/site/referrals/referral-share-actions";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata(
  "Referral Created – SLYDE",
  "Your SLYDE referral link has been created. Share it to earn JMD $5,000.",
  "/refer-a-slyder/slyder-success",
);

export default async function SlyderReferralSuccessPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const code = typeof params.code === "string" ? params.code : "";
  const link = typeof params.link === "string" ? params.link : "";

  if (!code) {
    return (
      <main className="section-shell py-16 text-center text-slate-400">
        <p>Referral code not found.</p>
        <a href="/refer-a-slyder" className="mt-4 inline-block text-sky-600 underline">Go back</a>
      </main>
    );
  }

  const referralLink = link || `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/r/${code}`;

  return (
    <main className="section-shell py-12">
      <div className="mx-auto max-w-xl space-y-6">
        <SlyderReferralSuccessCard referralCode={code} referralLink={referralLink} />
        <SlyderReferralShareActions referralLink={referralLink} />
      </div>
    </main>
  );
}
