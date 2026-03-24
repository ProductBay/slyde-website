import { redirect } from "next/navigation";
import { ActivationShell } from "@/components/slyder/activation-shell";
import { ActivationStepIndicator } from "@/components/slyder/activation-step-indicator";
import { LegalAcceptancePanel } from "@/components/slyder/legal-acceptance-panel";
import { getSessionContext } from "@/server/auth/session";
import { getSlyderOnboardingRequiredLegalDocs, getSlyderOnboardingStatus } from "@/modules/slyder-auth/services/slyder-onboarding.service";

export default async function SlyderOnboardingLegalPage() {
  const session = await getSessionContext();
  if (!session || !session.user.roles.includes("slyder")) redirect("/slyder/login");

  const [status, docs] = await Promise.all([
    getSlyderOnboardingStatus(session.user.id),
    getSlyderOnboardingRequiredLegalDocs(session.user.id),
  ]);

  if (!status.activationCompleted) redirect("/slyder/login");
  if (status.contractAccepted && docs.length === 0) redirect("/slyder/onboarding/setup");

  return (
    <ActivationShell
      title="Accept final courier terms"
      description="Before your account can move into operational setup, SLYDE must record acceptance of the current post-approval courier documents and acknowledgements."
    >
      <ActivationStepIndicator current="legal" />
      <div className="mt-8">
        <LegalAcceptancePanel documents={docs} />
      </div>
    </ActivationShell>
  );
}
