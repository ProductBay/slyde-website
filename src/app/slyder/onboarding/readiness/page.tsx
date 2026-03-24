import { redirect } from "next/navigation";
import { ActivationShell } from "@/components/slyder/activation-shell";
import { ActivationStepIndicator } from "@/components/slyder/activation-step-indicator";
import { ReadinessChecklist } from "@/components/slyder/readiness-checklist";
import { EligibilityStatusBanner } from "@/components/slyder/eligibility-status-banner";
import { ZoneStatusPanel } from "@/components/slyder/zone-status-panel";
import { getSessionContext } from "@/server/auth/session";
import { getSlyderOnboardingStatus } from "@/modules/slyder-auth/services/slyder-onboarding.service";

export default async function SlyderOnboardingReadinessPage() {
  const session = await getSessionContext();
  if (!session || !session.user.roles.includes("slyder")) redirect("/slyder/login");

  const status = await getSlyderOnboardingStatus(session.user.id);
  if (!status.activationCompleted) redirect("/slyder/login");
  if (!status.contractAccepted || (status.pendingLegalDocuments?.length ?? 0) > 0) redirect("/slyder/onboarding/legal");
  if (!status.profileComplete || !status.permissionsComplete) redirect("/slyder/onboarding/setup");
  if (status.readinessChecklist.overallStatus === "passed") redirect("/slyder/onboarding/complete");

  return (
    <ActivationShell
      title="Complete readiness"
      description="This final operational checklist confirms that you understand the delivery workflow, device expectations, safety responsibilities, and communication requirements for SLYDE."
    >
      <ActivationStepIndicator current="readiness" />
      <div className="mt-8 grid gap-6">
        <EligibilityStatusBanner eligibilityState={status.eligibilityState} zoneName={status.zoneName} />
        <ZoneStatusPanel zoneName={status.zoneName} zoneStatus={status.zoneStatus} />
        <ReadinessChecklist
          initial={{
            locationPermissionConfirmed: status.readinessChecklist.locationPermissionConfirmed,
            notificationPermissionConfirmed: status.readinessChecklist.notificationPermissionConfirmed,
            equipmentConfirmed: status.readinessChecklist.equipmentConfirmed,
            trainingAcknowledged: status.readinessChecklist.trainingAcknowledged,
            emergencyContactConfirmed: status.readinessChecklist.emergencyContactConfirmed,
          }}
        />
      </div>
    </ActivationShell>
  );
}
