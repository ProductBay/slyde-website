import { cookies } from "next/headers";
import { findEmployeeProfileByUserId, findUserByEmailOrPhone, upsertEmployeeProfile } from "@/modules/onboarding/repositories/onboarding.repository";
import type { EmployeeOnboardingInput } from "@/modules/employee/schemas/employee.schemas";
import { normalizeEmail, normalizePhone } from "@/modules/onboarding/services/onboarding-rules.service";
import { verifyPassword } from "@/server/auth/passwords";
import { SESSION_COOKIE } from "@/server/auth/session";
import { createStatelessSessionToken } from "@/server/auth/stateless-session";
import { readPersistenceStore, withPersistenceTransaction } from "@/server/persistence";

function nowIso() {
  return new Date().toISOString();
}

function isEmployeeRole(roles: string[]) {
  return roles.some((role) => role.startsWith("employee_"));
}

export async function loginEmployee(identifier: string, password: string) {
  const store = await readPersistenceStore();
  const normalizedIdentifier = identifier.includes("@") ? normalizeEmail(identifier) : normalizePhone(identifier);
  const user = findUserByEmailOrPhone(store, normalizedIdentifier);
  if (!user || user.userType !== "employee" || !isEmployeeRole(user.roles)) {
    throw new Error("Employee account not found");
  }

  if (!user.isEnabled || user.accountStatus !== "active" || !user.passwordHash) {
    throw new Error("Employee account is not allowed to sign in");
  }

  const passwordMatches = await verifyPassword(password, user.passwordHash);
  if (!passwordMatches) {
    throw new Error("Invalid credentials");
  }

  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString();
  const sessionId = createStatelessSessionToken({
    userId: user.id,
    roles: user.roles,
    expiresAt,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: false,
    expires: new Date(expiresAt),
  });

  const profile = findEmployeeProfileByUserId(store, user.id);

  return {
    sessionId,
    expiresAt,
    userId: user.id,
    nextPath: profile?.isOnboarded ? "/employee/portal" : "/employee/onboarding",
  };
}

export async function completeEmployeeOnboarding(userId: string, payload: EmployeeOnboardingInput) {
  return withPersistenceTransaction(async (store) => {
    const profile = findEmployeeProfileByUserId(store, userId);
    if (!profile) {
      throw new Error("Employee profile not found");
    }

    profile.emergencyContactName = payload.emergencyContactName;
    profile.emergencyContactPhone = payload.emergencyContactPhone;
    profile.payoutMethod = payload.payoutMethod;
    profile.payoutAccountMasked = payload.payoutAccountMasked;
    profile.isOnboarded = true;
    profile.onboardingCompletedAt = nowIso();
    profile.updatedAt = nowIso();
    upsertEmployeeProfile(store, profile);

    return {
      employeeProfileId: profile.id,
      onboardingCompletedAt: profile.onboardingCompletedAt,
    };
  });
}
