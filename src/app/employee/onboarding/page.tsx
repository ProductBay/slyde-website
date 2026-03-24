import { redirect } from "next/navigation";
import { EmployeeOnboardingForm } from "@/components/employee/employee-onboarding-form";
import { findEmployeeProfileByUserId } from "@/modules/onboarding/repositories/onboarding.repository";
import { readPersistenceStore } from "@/server/persistence";
import { getEmployeeSessionOrRedirect } from "@/server/employee/context";

export default async function EmployeeOnboardingPage() {
  const session = await getEmployeeSessionOrRedirect();
  const store = await readPersistenceStore();
  const profile = findEmployeeProfileByUserId(store, session.user.id);
  if (!profile) redirect("/employee/login");
  if (profile.isOnboarded) redirect("/employee/portal");

  return (
    <section className="section-shell py-10 sm:py-12">
      <EmployeeOnboardingForm
        defaultEmergencyName={profile.emergencyContactName}
        defaultEmergencyPhone={profile.emergencyContactPhone}
        defaultPayoutMethod={profile.payoutMethod}
        defaultPayoutMasked={profile.payoutAccountMasked}
      />
    </section>
  );
}
