import { cookies } from "next/headers";
import { findProfileByUserId, findUserByEmailOrPhone, findUserById, upsertSlyderProfile, upsertUser } from "@/modules/onboarding/repositories/onboarding.repository";
import type { CompleteSetupInput } from "@/modules/onboarding/schemas/onboarding.schemas";
import { evaluateReadinessForProfile } from "@/modules/onboarding/services/readiness.service";
import { normalizeEmail, normalizePhone, userCanAuthenticate } from "@/modules/onboarding/services/onboarding-rules.service";
import { appendAuditEvent } from "@/server/audit/audit.service";
import { verifyPassword, hashPassword } from "@/server/auth/passwords";
import { SESSION_COOKIE } from "@/server/auth/session";
import { generateOpaqueToken, generateOtpCode, hashToken } from "@/server/auth/tokens";
import { sendSlyderActivationCompletedNotification, sendSlyderOtpNotification } from "@/server/notifications/notification.service";
import { readPersistenceStore, withPersistenceTransaction } from "@/server/persistence";
import { completeSlyderOnboardingSetup, getSlyderOnboardingStatus } from "@/modules/slyder-auth/services/slyder-onboarding.service";

function nowIso() {
  return new Date().toISOString();
}

function otpDeliveryChannel() {
  return process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN ? "sms" : "email";
}

async function issueOtpChallenge(
  store: Awaited<ReturnType<typeof readPersistenceStore>>,
  userId: string,
) {
  const code = generateOtpCode();
  const challengeId = crypto.randomUUID();
  store.otpChallenges.push({
    id: challengeId,
    userId,
    codeHash: hashToken(code),
    expiresAt: new Date(Date.now() + 1000 * 60 * 10).toISOString(),
    createdAt: nowIso(),
  });

  await sendSlyderOtpNotification(store, userId, code);
  appendAuditEvent(store, {
    entityType: "user",
    entityId: userId,
    eventType: "otp_challenge_created",
    metadata: { challengeId },
  });

  return {
    challengeId,
    delivery: otpDeliveryChannel(),
    expiresInSeconds: 600,
  } as const;
}

export async function activateSlyder(token: string) {
  const store = await readPersistenceStore();
  const activation = store.activationTokens.find(
    (item) => item.tokenHash === hashToken(token) && !item.consumedAt && new Date(item.expiresAt) > new Date(),
  );

  if (!activation) {
    throw new Error("Activation token is invalid or expired");
  }

  const user = findUserById(store, activation.userId);
  if (!user) {
    throw new Error("Linked user was not found");
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

export async function setSlyderPassword(token: string, password: string) {
  return withPersistenceTransaction(async (store) => {
    const activation = store.activationTokens.find(
      (item) => item.tokenHash === hashToken(token) && !item.consumedAt && new Date(item.expiresAt) > new Date(),
    );
    if (!activation) throw new Error("Activation token is invalid or expired");

    const user = findUserById(store, activation.userId);
    if (!user) throw new Error("Linked user was not found");

    user.passwordHash = await hashPassword(password);
    user.accountStatus = "active";
    user.isEnabled = true;
    user.activationIssuedAt = user.activationIssuedAt || nowIso();
    user.updatedAt = nowIso();
    upsertUser(store, user);

    const profile = findProfileByUserId(store, user.id);
    if (profile) {
      profile.accountStatus = "active";
      profile.activatedAt = nowIso();
      profile.onboardingStatus = "contract_pending";
      profile.updatedAt = nowIso();
      upsertSlyderProfile(store, profile);
      evaluateReadinessForProfile(store, profile.id);
    }

    activation.consumedAt = nowIso();
    activation.status = "used";
    activation.updatedAt = nowIso();

    appendAuditEvent(store, {
      entityType: "user",
      entityId: user.id,
      eventType: "activation_completed",
      metadata: {},
    });

    if (profile) {
      await sendSlyderActivationCompletedNotification(store, user.id, profile.applicationId);
    }

    return { userId: user.id, accountStatus: user.accountStatus };
  });
}

export async function loginSlyder(identifier: string, password: string) {
  return withPersistenceTransaction(async (store) => {
    const normalizedIdentifier = identifier.includes("@")
      ? normalizeEmail(identifier)
      : normalizePhone(identifier);
    const user = findUserByEmailOrPhone(store, normalizedIdentifier);
    if (!user || !user.roles.includes("slyder")) {
      throw new Error("Slyder account not found");
    }

    if (!userCanAuthenticate(user)) {
      throw new Error("Account is not allowed to sign in");
    }

    if (user.accountStatus === "activation_pending" || !user.passwordHash) {
      throw new Error("Activation must be completed before sign-in");
    }

    const passwordMatches = await verifyPassword(password, user.passwordHash);
    if (!passwordMatches) {
      throw new Error("Invalid credentials");
    }

    return issueOtpChallenge(store, user.id);
  });
}

export async function resendSlyderOtp(challengeId: string) {
  return withPersistenceTransaction(async (store) => {
    const challenge = store.otpChallenges.find(
      (item) => item.id === challengeId && !item.consumedAt && new Date(item.expiresAt) > new Date(),
    );
    if (!challenge) {
      throw new Error("OTP challenge is invalid or expired. Start sign-in again.");
    }

    const user = findUserById(store, challenge.userId);
    if (!user || !user.roles.includes("slyder")) {
      throw new Error("Linked Slyder account not found");
    }

    challenge.consumedAt = nowIso();

    appendAuditEvent(store, {
      entityType: "user",
      entityId: user.id,
      eventType: "otp_challenge_resent",
      metadata: { priorChallengeId: challengeId },
    });

    return issueOtpChallenge(store, user.id);
  });
}

export async function verifySlyderOtp(challengeId: string, code: string) {
  return withPersistenceTransaction(async (store) => {
    const challenge = store.otpChallenges.find(
      (item) => item.id === challengeId && !item.consumedAt && new Date(item.expiresAt) > new Date(),
    );
    if (!challenge || challenge.codeHash !== hashToken(code)) {
      throw new Error("OTP is invalid or expired");
    }

    challenge.consumedAt = nowIso();
    const user = findUserById(store, challenge.userId);
    if (!user) throw new Error("Linked user not found");

    const sessionId = generateOpaqueToken(18);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString();
    store.sessions.push({
      id: sessionId,
      userId: user.id,
      roles: user.roles,
      createdAt: nowIso(),
      expiresAt,
    });

    user.lastLoginAt = nowIso();
    user.updatedAt = nowIso();
    upsertUser(store, user);

    const profile = findProfileByUserId(store, user.id);
    if (profile) {
      appendAuditEvent(store, {
        entityType: "slyder_profile",
        entityId: profile.id,
        eventType: "first_login",
        metadata: { sessionId },
      });
    }

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, sessionId, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: false,
      expires: new Date(expiresAt),
    });

    return {
      sessionId,
      expiresAt,
      userId: user.id,
    };
  });
}

export async function getSlyderSetupStatus(userId: string) {
  return getSlyderOnboardingStatus(userId);
}

export async function completeSlyderSetup(
  userId: string,
  payload: CompleteSetupInput,
) {
  if (payload.readinessCheckPassed === false) {
    return withPersistenceTransaction(async (store) => {
      const profile = findProfileByUserId(store, userId);
      if (!profile) throw new Error("Slyder profile not found");
      profile.readinessStatus = "failed";
      profile.operationalStatus = "blocked";
      profile.canGoOnline = false;
      profile.canReceiveOrders = false;
      profile.updatedAt = nowIso();
      appendAuditEvent(store, {
        entityType: "slyder_profile",
        entityId: profile.id,
        eventType: "readiness_failed",
        actorUserId: userId,
        metadata: payload,
      });
      return evaluateReadinessForProfile(store, profile.id);
    });
  }

  return completeSlyderOnboardingSetup(userId);
}
