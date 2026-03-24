import { redirect } from "next/navigation";
import { ActivationShell } from "@/components/slyder/activation-shell";
import { ActivationStepIndicator } from "@/components/slyder/activation-step-indicator";
import { CompletionSummaryCard } from "@/components/slyder/completion-summary-card";
import { EligibilityStatusBanner } from "@/components/slyder/eligibility-status-banner";
import { ResendInvitePanel } from "@/components/slyder/resend-invite-panel";
import { ZoneStatusPanel } from "@/components/slyder/zone-status-panel";
import { getSessionContext } from "@/server/auth/session";
import { getSlyderOnboardingStatus } from "@/modules/slyder-auth/services/slyder-onboarding.service";

function getNextAction(status: Awaited<ReturnType<typeof getSlyderOnboardingStatus>>) {
  if (!status.activationCompleted) {
    return { href: "/slyder/login", label: "Return to sign in" };
  }

  if (!status.contractAccepted || (status.pendingLegalDocuments?.length ?? 0) > 0) {
    return { href: "/slyder/onboarding/legal", label: "Continue to legal" };
  }

  if (!status.profileComplete || !status.permissionsComplete || !status.payoutSetupComplete) {
    return { href: "/slyder/onboarding/setup", label: "Continue setup" };
  }

  if (status.readinessChecklist.overallStatus !== "passed") {
    return { href: "/slyder/onboarding/readiness", label: "Continue readiness" };
  }

  return null;
}

function getWorkflowState(status: Awaited<ReturnType<typeof getSlyderOnboardingStatus>>) {
  const documentSteps = status.remainingSteps.filter((step) => step.startsWith("document_"));
  const nonDocumentSteps = status.remainingSteps.filter((step) => !step.startsWith("document_"));

  if (nonDocumentSteps.length > 0) {
    return {
      title: "Action required from Slyder",
      body: "You still have onboarding items to complete yourself. Use the next-step button below to continue your setup or readiness flow.",
      tone: "action" as const,
    };
  }

  if (documentSteps.length > 0) {
    return {
      title: "Waiting on SLYDE review",
      body: "Your uploaded documents are still being reviewed by SLYDE ops. No action is required from you right now unless our team requests a re-upload.",
      tone: "review" as const,
    };
  }

  if (status.eligibilityState === "eligible_offline" && status.zoneStatus !== "live") {
    return {
      title: "Ready for zone launch waiting state",
      body: "Your onboarding is complete. Your account is ready, and SLYDE will enable deliveries once your zone goes live.",
      tone: "ready" as const,
    };
  }

  return {
    title: "Onboarding complete",
    body: "There are no remaining onboarding actions on your account.",
    tone: "ready" as const,
  };
}

export default async function SlyderOnboardingCompletePage() {
  const session = await getSessionContext();
  if (!session || !session.user.roles.includes("slyder")) redirect("/slyder/login");

  const status = await getSlyderOnboardingStatus(session.user.id);
  const nextAction = getNextAction(status);
  const workflowState = getWorkflowState(status);

  return (
    <ActivationShell
      title="Your onboarding status"
      description="This summary shows whether your SLYDE activation is complete, whether your area is live, and whether any final setup items are still blocking operations."
    >
      <ActivationStepIndicator current="complete" />
      <div className="mt-8 grid gap-6">
        <EligibilityStatusBanner eligibilityState={status.eligibilityState} zoneName={status.zoneName} />
        <ZoneStatusPanel zoneName={status.zoneName} zoneStatus={status.zoneStatus} />
        <CompletionSummaryCard
          summary={status.completionSummary}
          remainingSteps={status.remainingSteps}
          nextAction={nextAction}
          workflowState={workflowState}
        />
        <ResendInvitePanel allowStatusUpdate />
      </div>
    </ActivationShell>
  );
}
