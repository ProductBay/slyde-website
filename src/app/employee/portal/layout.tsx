import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { EmployeePortalShell } from "@/components/employee/employee-portal-shell";
import { getEmployeePortalData } from "@/modules/employee/services/employee-portal.service";
import { getEmployeeSessionOrRedirect } from "@/server/employee/context";

export default async function EmployeePortalLayout({ children }: { children: ReactNode }) {
  const session = await getEmployeeSessionOrRedirect();
  const portal = await getEmployeePortalData(session.user.id);

  if (!portal.profile.isOnboarded) {
    redirect("/employee/onboarding");
  }

  return (
    <EmployeePortalShell employeeName={portal.profile.displayName} title={portal.profile.title} department={portal.profile.department}>
      {children}
    </EmployeePortalShell>
  );
}
