import { cookies } from "next/headers";
import { findUserByEmailOrPhone } from "@/modules/onboarding/repositories/onboarding.repository";
import { normalizeEmail, normalizePhone } from "@/modules/onboarding/services/onboarding-rules.service";
import { verifyPassword } from "@/server/auth/passwords";
import { SESSION_COOKIE, hasRole } from "@/server/auth/session";
import { createStatelessSessionToken } from "@/server/auth/stateless-session";
import { readPersistenceStore } from "@/server/persistence";

export async function loginAdmin(identifier: string, password: string) {
  const store = await readPersistenceStore();
  const normalizedIdentifier = identifier.includes("@") ? normalizeEmail(identifier) : normalizePhone(identifier);
  const user = findUserByEmailOrPhone(store, normalizedIdentifier);

  if (!user || !hasRole(user, ["platform_admin", "operations_admin"])) {
    throw new Error("Admin account not found");
  }

  if (!user.isEnabled || user.accountStatus !== "active" || !user.passwordHash) {
    throw new Error("Admin account is not allowed to sign in");
  }

  const passwordMatches = await verifyPassword(password, user.passwordHash);
  if (!passwordMatches) {
    throw new Error("Invalid credentials");
  }

  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString();
  const sessionToken = createStatelessSessionToken({
    userId: user.id,
    roles: user.roles,
    expiresAt,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: false,
    expires: new Date(expiresAt),
  });

  return {
    sessionId: sessionToken,
    expiresAt,
    userId: user.id,
    nextPath: "/admin",
  };
}
