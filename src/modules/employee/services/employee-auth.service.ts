import { cookies } from "next/headers";
import { findEmployeeProfileByUserId, findUserByEmailOrPhone, findUserById, upsertEmployeeProfile, upsertUser } from "@/modules/onboarding/repositories/onboarding.repository";
import type { EmployeeOnboardingInput } from "@/modules/employee/schemas/employee.schemas";
import { ensureEmployeeProfileInStore } from "@/modules/employee/services/employee-portal.service";
import { normalizeEmail, normalizePhone } from "@/modules/onboarding/services/onboarding-rules.service";
import { hashPassword, verifyPassword } from "@/server/auth/passwords";
import { SESSION_COOKIE } from "@/server/auth/session";
import { createStatelessSessionToken } from "@/server/auth/stateless-session";
import { hashToken } from "@/server/auth/tokens";
import { appendAuditEvent } from "@/server/audit/audit.service";
import { sendEmployeeActivationCompletedNotification } from "@/server/notifications/notification.service";
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

export async function activateEmployee(token: string) {
  const store = await readPersistenceStore();
  const activation = store.activationTokens.find(
    (item) => item.tokenHash === hashToken(token) && !item.consumedAt && new Date(item.expiresAt) > new Date(),
  );

  if (!activation) {
    throw new Error("Activation token is invalid or expired");
  }

  const user = findUserById(store, activation.userId);
  if (!user || user.userType !== "employee" || !isEmployeeRole(user.roles)) {
    throw new Error("Linked employee account was not found");
  }

  return {
    userId: user.id,
    email: user.email,
    phone: user.phone,
    accountStatus: user.accountStatus,
    passwordSet: Boolean(user.passwordHash),
    activationState: user.accountStatus === "activation_pending" ? "pending" : "ready",
  };
}

export async function setEmployeePassword(token: string, password: string) {
  return withPersistenceTransaction(async (store) => {
    const activation = store.activationTokens.find(
      (item) => item.tokenHash === hashToken(token) && !item.consumedAt && new Date(item.expiresAt) > new Date(),
    );
    if (!activation) throw new Error("Activation token is invalid or expired");

    const user = findUserById(store, activation.userId);
    if (!user || user.userType !== "employee" || !isEmployeeRole(user.roles)) {
      throw new Error("Linked employee account was not found");
    }

    user.passwordHash = await hashPassword(password);
    user.accountStatus = "active";
    user.isEnabled = true;
    user.activationIssuedAt = user.activationIssuedAt || nowIso();
    user.updatedAt = nowIso();
    upsertUser(store, user);

    const profile = findEmployeeProfileByUserId(store, user.id) ?? ensureEmployeeProfileInStore(store, user.id);
    profile.updatedAt = nowIso();
    upsertEmployeeProfile(store, profile);

    activation.consumedAt = nowIso();
    activation.status = "used";
    activation.updatedAt = nowIso();

    appendAuditEvent(store, {
      entityType: "user",
      entityId: user.id,
      eventType: "employee_activation_completed",
      metadata: {
        employeeProfileId: profile.id,
      },
    });

    const application = store.employeeApplications.find((item) => item.linkedUserId === user.id);
    if (application) {
      await sendEmployeeActivationCompletedNotification(store, user.id, application.id);
    }

    return { userId: user.id, accountStatus: user.accountStatus };
  });
}

export async function completeEmployeeOnboarding(userId: string, payload: EmployeeOnboardingInput) {
  return withPersistenceTransaction(async (store) => {
    const profile = findEmployeeProfileByUserId(store, userId) ?? ensureEmployeeProfileInStore(store, userId);

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
