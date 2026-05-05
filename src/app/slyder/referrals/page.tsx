import { redirect } from "next/navigation";
import { ActivationShell } from "@/components/slyder/activation-shell";
import { SlyderReferralSummary } from "@/components/slyder/referrals/slyder-referral-summary";
import { SlyderReferralLinkCard } from "@/components/slyder/referrals/slyder-referral-link-card";
import { SlyderReferralMyTable } from "@/components/slyder/referrals/slyder-referral-my-table";
import { getSessionContext } from "@/server/auth/session";
import { getSlyderReferralSummaryForSlyder } from "@/modules/referrals/repositories/slyder-referral.repository";
import { getOrCreateSlyderReferralCode } from "@/modules/referrals/services/slyder-referral.service";
import { prisma } from "@/server/db/prisma";

export default async function SlyderReferralsPage() {
  const session = await getSessionContext();
  if (!session || !session.user.roles.includes("slyder")) redirect("/slyder/login");

  const profile = await prisma.slyderProfile.findUnique({
    where: { userId: session.user.id },
    include: { application: true },
  });
  const slyderWhatsapp = profile?.application?.phone ?? session.user.email ?? session.user.id;

  const [summary, link] = await Promise.all([
    getSlyderReferralSummaryForSlyder(session.user.id),
    getOrCreateSlyderReferralCode(session.user.id, session.user.fullName, slyderWhatsapp),
  ]);

  return (
    <ActivationShell
      title="Your Referrals"
      description="Earn JMD $5,000 for each Slyder you help activate. Share your link and track your rewards below."
    >
      <div className="space-y-8">
        <SlyderReferralSummary
          stats={{
            totalReferrals: summary.totalReferrals,
            liveReferrals: summary.liveReferrals,
            totalEarned: summary.totalEarned,
            totalPaid: summary.totalPaid,
            remainingPotential: summary.remainingPotential,
          }}
        />

        <SlyderReferralLinkCard
          referralCode={link.referralCode}
          referralLink={link.referralLink}
        />

        <div>
          <h2 className="mb-4 text-base font-semibold text-slate-950">Your Referrals</h2>
          <SlyderReferralMyTable rows={summary.referrals} />
        </div>
      </div>
    </ActivationShell>
  );
}
