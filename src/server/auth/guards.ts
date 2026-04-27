import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type { UserRoleCode } from "@/types/backend/onboarding";
import type { SessionContext } from "@/server/auth/session";
import type { ReferrerSessionContext } from "@/server/auth/referrer-session";
import { getSessionContext, hasRole } from "@/server/auth/session";
import { getReferrerSessionContext } from "@/server/auth/referrer-session";
import { readPersistenceStore } from "@/server/persistence";
import { enforceMerchantBusinessLicenseCompliance } from "@/modules/merchant-ops/services/merchant-business-license.service";

const devAdminKey = process.env.SLYDE_ADMIN_DEV_KEY || "dev-admin-key";
type MinimalActorContext = { user: { id: string; fullName: string; roles: UserRoleCode[] } };
type ReferrerActorContext = ReferrerSessionContext;

function allowLocalAdminFallback() {
  return process.env.SLYDE_ADMIN_UI_DEV_FALLBACK !== "false";
}

export async function getLocalAdminFallbackContext(providedKey: string | null | undefined) {
  if (!allowLocalAdminFallback() || providedKey !== devAdminKey) {
    return null;
  }

  const store = await readPersistenceStore();
  // Use the LAST platform_admin in the store. The seed store prepends an admin with a random UUID
  // on every createSeedStore() call. The DB-persisted admin (with a stable UUID) is appended later
  // by the Prisma overlay, so it sits at the end of the array. Using the last admin ensures the
  // actor ID matches the user that survives dedupeUsersForPrisma during the write transaction,
  // preventing SlyderApplication_reviewedBy_fkey FK constraint violations.
  const platformAdmins = store.users.filter((user) => hasRole(user, ["platform_admin"]));
  const adminUser = platformAdmins.at(-1);
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

export async function requireMerchantContext(options?: { allowRestricted?: boolean }) {
  const sessionContext = await getSessionContext();
  if (
    sessionContext &&
    sessionContext.user.isEnabled &&
    sessionContext.user.accountStatus === "active" &&
    sessionContext.user.userType === "merchant" &&
    hasRole(sessionContext.user, [
      "merchant_owner",
      "merchant_manager",
      "merchant_dispatcher",
      "merchant_staff",
      "merchant_viewer",
    ])
  ) {
    const store = await readPersistenceStore();
    const membership = store.merchantTeamMembers.find(
      (item) => item.userId === sessionContext.user.id && item.status === "active",
    );
    if (membership) {
      const compliance = await enforceMerchantBusinessLicenseCompliance(membership.merchantId);
      if (compliance.isRestricted && !options?.allowRestricted) {
        return NextResponse.json(
          {
            error:
              "Merchant operations are restricted until COJ business license credentials are submitted in workspace settings.",
          },
          { status: 403 },
        );
      }

      return {
        ...sessionContext,
        merchantMembership: membership,
        merchantCompliance: compliance,
      };
    }
  }

  return NextResponse.json({ error: "Merchant authentication required" }, { status: 401 });
}

export async function requireReferrerContext(): Promise<ReferrerActorContext | NextResponse> {
  const sessionContext = await getReferrerSessionContext();
  if (sessionContext) {
    return sessionContext;
  }

  return NextResponse.json({ error: "Referrer authentication required" }, { status: 401 });
}
