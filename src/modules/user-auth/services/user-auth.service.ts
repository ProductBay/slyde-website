import { cookies } from "next/headers";
import { findUserByEmailOrPhone } from "@/modules/onboarding/repositories/onboarding.repository";
import { normalizeEmail, normalizePhone } from "@/modules/onboarding/services/onboarding-rules.service";
import { hashPassword, verifyPassword } from "@/server/auth/passwords";
import { SESSION_COOKIE, hasRole } from "@/server/auth/session";
import { createStatelessSessionToken } from "@/server/auth/stateless-session";
import { sendUserRegistrationWelcomeNotification } from "@/server/notifications/notification.service";
import { readPersistenceStore, withPersistenceTransaction } from "@/server/persistence";
import type { RegisterUserInput, LoginUserInput } from "@/modules/user-auth/schemas/user-auth.schemas";

function nowIso() {
  return new Date().toISOString();
}

function setSessionCookie(token: string, expiresAt: string) {
  return cookies().then((cookieStore) => {
    cookieStore.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
      expires: new Date(expiresAt),
    });
  });
}

export async function registerUser(input: RegisterUserInput) {
  const { fullName, email, phone, password } = input;
  const normalizedEmail = normalizeEmail(email);
  const normalizedPhone = normalizePhone(phone);

  const passwordHash = await hashPassword(password);

  const result = await withPersistenceTransaction(async (store) => {
    const existing = findUserByEmailOrPhone(store, normalizedEmail) ?? findUserByEmailOrPhone(store, normalizedPhone);
    if (existing) {
      throw new Error("An account with that email or phone already exists");
    }

    const userId = crypto.randomUUID();
    const now = nowIso();
    store.users.push({
      id: userId,
      email: normalizedEmail,
      phone: normalizedPhone,
      fullName: fullName.trim(),
      passwordHash,
      roles: [],
      userType: "platform",
      accountStatus: "active",
      isEnabled: true,
      activationIssuedAt: now,
      lastLoginAt: now,
      createdAt: now,
      updatedAt: now,
    });

    await sendUserRegistrationWelcomeNotification(store, userId);

    return { userId, now };
  });

  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();
  const sessionToken = createStatelessSessionToken({
    userId: result.userId,
    roles: [],
    expiresAt,
  });

  await setSessionCookie(sessionToken, expiresAt);

  return { userId: result.userId, expiresAt, nextPath: "/account" };
}

export async function loginUser(input: LoginUserInput) {
  const { email, password } = input;
  const store = await readPersistenceStore();
  const normalizedEmail = normalizeEmail(email);
  const user = findUserByEmailOrPhone(store, normalizedEmail);

  if (!user || user.userType !== "platform" || hasRole(user, ["platform_admin", "operations_admin"])) {
    throw new Error("No account found with those credentials");
  }

  if (!user.isEnabled || user.accountStatus !== "active") {
    throw new Error("This account is not active. Please contact support.");
  }

  const passwordMatches = await verifyPassword(password, user.passwordHash);
  if (!passwordMatches) {
    throw new Error("Invalid email or password");
  }

  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();
  const sessionToken = createStatelessSessionToken({
    userId: user.id,
    roles: [],
    expiresAt,
  });

  await setSessionCookie(sessionToken, expiresAt);

  return { userId: user.id, expiresAt, nextPath: "/account" };
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
