import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type { UserRoleCode } from "@/types/backend/onboarding";
import type { SessionContext } from "@/server/auth/session";
import { getSessionContext, hasRole } from "@/server/auth/session";
import { readPersistenceStore } from "@/server/persistence";

const devAdminKey = process.env.SLYDE_ADMIN_DEV_KEY || "dev-admin-key";
type MinimalActorContext = { user: { id: string; fullName: string; roles: UserRoleCode[] } };

function allowLocalAdminFallback() {
  return process.env.SLYDE_ADMIN_UI_DEV_FALLBACK !== "false";
}

export async function getLocalAdminFallbackContext(providedKey: string | null | undefined) {
  if (!allowLocalAdminFallback() || providedKey !== devAdminKey) {
    return null;
  }

  const store = await readPersistenceStore();
  const adminUser = store.users.find((user) => hasRole(user, ["platform_admin"]));
  if (!adminUser) {
    return null;
  }

  return {
    user: { id: adminUser.id, fullName: adminUser.fullName, roles: adminUser.roles },
  } satisfies MinimalActorContext;
}

export async function requireAdminContext(): Promise<SessionContext | MinimalActorContext | NextResponse> {
  const sessionContext = await getSessionContext();
  if (
    sessionContext &&
    sessionContext.user.isEnabled &&
    hasRole(sessionContext.user, ["platform_admin", "operations_admin"])
  ) {
    return sessionContext;
  }

  const headerStore = await headers();
  const providedKey = headerStore.get("x-slyde-admin-key");
  const fallbackContext = await getLocalAdminFallbackContext(providedKey);

  if (fallbackContext) {
    return fallbackContext;
  }

  return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
}

export async function requireSlyderContext() {
  const sessionContext = await getSessionContext();
  if (
    sessionContext &&
    sessionContext.user.isEnabled &&
    sessionContext.user.accountStatus === "active" &&
    hasRole(sessionContext.user, ["slyder"])
  ) {
    return sessionContext;
  }

  return NextResponse.json({ error: "Slyder authentication required" }, { status: 401 });
}

export async function requireEmployeeContext() {
  const sessionContext = await getSessionContext();
  if (
    sessionContext &&
    sessionContext.user.isEnabled &&
    sessionContext.user.accountStatus === "active" &&
    sessionContext.user.userType === "employee" &&
    hasRole(sessionContext.user, [
      "employee_staff",
      "employee_logistics",
      "employee_supervisor",
      "employee_manager",
      "employee_hr",
      "employee_payroll",
    ])
  ) {
    return sessionContext;
  }

  return NextResponse.json({ error: "Employee authentication required" }, { status: 401 });
}
