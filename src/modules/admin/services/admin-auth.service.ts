import { cookies } from "next/headers";
import { findUserByEmailOrPhone, upsertUser } from "@/modules/onboarding/repositories/onboarding.repository";
import { normalizeEmail, normalizePhone } from "@/modules/onboarding/services/onboarding-rules.service";
import { verifyPassword } from "@/server/auth/passwords";
import { SESSION_COOKIE, hasRole } from "@/server/auth/session";
import { generateOpaqueToken } from "@/server/auth/tokens";
import { withPersistenceTransaction } from "@/server/persistence";

function nowIso() {
  return new Date().toISOString();
}

export async function loginAdmin(identifier: string, password: string) {
  return withPersistenceTransaction(async (store) => {
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
      nextPath: "/admin",
    };
  });
}
