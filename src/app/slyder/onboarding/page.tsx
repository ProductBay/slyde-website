import { redirect } from "next/navigation";
import { getSessionContext } from "@/server/auth/session";
import { getSlyderOnboardingStatus } from "@/modules/slyder-auth/services/slyder-onboarding.service";

export default async function SlyderOnboardingIndexPage() {
  const session = await getSessionContext();
  if (!session || !session.user.roles.includes("slyder")) {
    redirect("/slyder/login");
  }

  const status = await getSlyderOnboardingStatus(session.user.id);

  if (!status.activationCompleted) redirect("/slyder/login");
  if (!status.contractAccepted || (status.pendingLegalDocuments?.length ?? 0) > 0) redirect("/slyder/onboarding/legal");
  if (!status.profileComplete || !status.permissionsComplete) redirect("/slyder/onboarding/setup");
  if (status.readinessChecklist.overallStatus !== "passed") redirect("/slyder/onboarding/readiness");
  redirect("/slyder/onboarding/complete");
}
