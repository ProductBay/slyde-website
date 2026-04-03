import { SuccessState } from "@/components/site/success-state";

export default async function ReferASlyderSuccessPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) || {};
  const code = typeof params.code === "string" ? params.code : undefined;
  const inviteSent = typeof params.invite === "string" && params.invite === "sent";
  const referredEmail = typeof params.email === "string" ? params.email : undefined;

  return (
    <section className="mx-auto max-w-shell px-4 py-16 sm:px-6 lg:px-8">
      <SuccessState
        title="Referral received"
        supportLine={code ? `Reference ${code}` : "Public referral submitted"}
        description="Thanks for referring a potential Slyder to the network. SLYDE can now review the referral and monitor whether the referred driver progresses all the way to a live first delivery."
        notice={
          inviteSent
            ? {
                eyebrow: "Invite Email Sent",
                title: "The referred driver was emailed a direct SLYDE application invite",
                description: referredEmail
                  ? `The invite was sent to ${referredEmail}. It includes the referral code and a direct onboarding link, so if they apply from that email the referral will already be attached.`
                  : "Their invite includes the referral code and a direct onboarding link, so if they apply from that email the referral will already be attached.",
              }
            : undefined
        }
        highlights={[
          "The reward is not earned at submission time.",
          "The referred Slyder must be approved, activated, complete readiness, and finish a first live delivery.",
          "If you are outside a live customer zone, you may gift the reward one time to an eligible customer account in an active zone.",
        ]}
        footerNote={inviteSent ? "Keep your referral code if you want to check the referral status later. The emailed invite link also includes the referral automatically." : "Keep your referral code if you want to check the referral status later."}
        actions={[
          { href: code ? `/refer-a-slyder/status?code=${encodeURIComponent(code)}` : "/refer-a-slyder/status", label: "Check Referral Status", variant: "primary" },
          { href: code ? `/refer-a-slyder/rewards?code=${encodeURIComponent(code)}` : "/refer-a-slyder/rewards", label: "Open Rewards Dashboard", variant: "secondary" },
          { href: "/refer-a-slyder", label: "Submit Another Referral", variant: "secondary" },
          { href: "/", label: "Return Home", variant: "secondary" },
        ]}
      />
    </section>
  );
}
