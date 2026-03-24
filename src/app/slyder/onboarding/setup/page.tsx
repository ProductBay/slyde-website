import { redirect } from "next/navigation";
import { ActivationShell } from "@/components/slyder/activation-shell";
import { ActivationStepIndicator } from "@/components/slyder/activation-step-indicator";
import { SetupChecklistForm } from "@/components/slyder/setup-checklist-form";
import { ZoneStatusPanel } from "@/components/slyder/zone-status-panel";
import { getSessionContext } from "@/server/auth/session";
import { getSlyderOnboardingStatus } from "@/modules/slyder-auth/services/slyder-onboarding.service";

export default async function SlyderOnboardingSetupPage() {
  const session = await getSessionContext();
  if (!session || !session.user.roles.includes("slyder")) redirect("/slyder/login");

  const status = await getSlyderOnboardingStatus(session.user.id);
  if (!status.activationCompleted) redirect("/slyder/login");
  if (!status.contractAccepted || (status.pendingLegalDocuments?.length ?? 0) > 0) redirect("/slyder/onboarding/legal");
  if (status.profileComplete && status.permissionsComplete && status.payoutSetupComplete) redirect("/slyder/onboarding/readiness");

  return (
    <ActivationShell
      title="Finish setup"
      description="Confirm your approved account details, account controls, emergency-contact information, and the setup items SLYDE requires before readiness can begin."
    >
      <ActivationStepIndicator current="setup" />
      <div className="mt-8 grid gap-6">
        <ZoneStatusPanel zoneName={status.zoneName} zoneStatus={status.zoneStatus} />
        <SetupChecklistForm
          initial={{
            profileComplete: status.profileComplete,
            payoutSetupComplete: status.payoutSetupComplete,
            vehicleVerified: status.vehicleVerified,
            permissionsComplete: status.permissionsComplete,
            requiredAgreementsAccepted: status.requiredAgreementsAccepted,
            emergencyContactConfirmed: status.readinessChecklist.emergencyContactConfirmed,
          }}
        />
      </div>
    </ActivationShell>
  );
}
