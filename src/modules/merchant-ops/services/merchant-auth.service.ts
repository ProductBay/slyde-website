import { cookies } from "next/headers";
import { findUserByEmailOrPhone, findUserById, upsertUser } from "@/modules/onboarding/repositories/onboarding.repository";
import { normalizeEmail, normalizePhone } from "@/modules/onboarding/services/onboarding-rules.service";
import { hashPassword, verifyPassword } from "@/server/auth/passwords";
import { SESSION_COOKIE } from "@/server/auth/session";
import { createStatelessSessionToken } from "@/server/auth/stateless-session";
import { hashToken } from "@/server/auth/tokens";
import { findMerchantWorkspaceByUserId } from "@/modules/merchant-ops/repositories/merchant-ops.repository";
import { sendUserRegistrationWelcomeNotification } from "@/server/notifications/notification.service";
import { readPersistenceStore, withPersistenceTransaction } from "@/server/persistence";

function isMerchantRole(role: string) {
  return role.startsWith("merchant_");
}

function nowIso() {
  return new Date().toISOString();
}

export async function loginMerchant(identifier: string, password: string) {
  const store = await readPersistenceStore();
  const normalizedIdentifier = identifier.includes("@") ? normalizeEmail(identifier) : normalizePhone(identifier);
  const user = findUserByEmailOrPhone(store, normalizedIdentifier);
  if (!user || user.userType !== "merchant" || !user.roles.some(isMerchantRole)) {
    throw new Error("Merchant account not found");
  }

  if (!user.isEnabled || user.accountStatus !== "active" || !user.passwordHash) {
    throw new Error("Merchant account is not allowed to sign in");
  }

  const workspace = await findMerchantWorkspaceByUserId(user.id);
  if (!workspace || workspace.application.activationStatus === "paused") {
    throw new Error("Merchant workspace is not active");
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

  return {
    sessionId,
    expiresAt,
    userId: user.id,
    merchantId: workspace.application.id,
    nextPath: "/merchant/dashboard",
  };
}

export async function activateMerchant(token: string) {
  const store = await readPersistenceStore();
  const activation = store.activationTokens.find(
    (item) => item.tokenHash === hashToken(token) && !item.consumedAt && new Date(item.expiresAt) > new Date(),
  );

  if (!activation) {
    throw new Error("Activation token is invalid or expired");
  }

  const user = findUserById(store, activation.userId);
  if (!user || user.userType !== "merchant" || !user.roles.some(isMerchantRole)) {
    throw new Error("Linked merchant account was not found");
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

export async function setMerchantPassword(token: string, password: string) {
  return withPersistenceTransaction(async (store) => {
    const activation = store.activationTokens.find(
      (item) => item.tokenHash === hashToken(token) && !item.consumedAt && new Date(item.expiresAt) > new Date(),
    );
    if (!activation) throw new Error("Activation token is invalid or expired");

    const user = findUserById(store, activation.userId);
    if (!user || user.userType !== "merchant" || !user.roles.some(isMerchantRole)) {
      throw new Error("Linked merchant account was not found");
    }

    user.passwordHash = await hashPassword(password);
    user.accountStatus = "active";
    user.isEnabled = true;
    user.activationIssuedAt = user.activationIssuedAt || nowIso();
    user.updatedAt = nowIso();
    upsertUser(store, user);

    activation.consumedAt = nowIso();
    activation.status = "used";
    activation.updatedAt = nowIso();

    await sendUserRegistrationWelcomeNotification(store, user.id);

    return { userId: user.id, accountStatus: user.accountStatus };
  });
}

export async function logoutMerchant() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: false,
    expires: new Date(0),
  });
}
