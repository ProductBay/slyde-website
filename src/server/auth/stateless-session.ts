import { createHmac, timingSafeEqual } from "node:crypto";

type StatelessSessionPayload = {
  userId: string;
  roles: string[];
  exp: number;
};

const STATELESS_SESSION_PREFIX = "stateless:";

function getSessionSecret() {
  return process.env.JWT_SECRET || process.env.SLYDE_SESSION_SECRET || "slyde-dev-session-secret";
}

function toBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value: string) {
  return createHmac("sha256", getSessionSecret()).update(value).digest("base64url");
}

export function createStatelessSessionToken(input: { userId: string; roles: string[]; expiresAt: string }) {
  const payload: StatelessSessionPayload = {
    userId: input.userId,
    roles: input.roles,
    exp: Math.floor(new Date(input.expiresAt).getTime() / 1000),
  };

  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = sign(encodedPayload);
  return `${STATELESS_SESSION_PREFIX}${encodedPayload}.${signature}`;
}

export function verifyStatelessSessionToken(token: string): StatelessSessionPayload | null {
  if (!token.startsWith(STATELESS_SESSION_PREFIX)) {
    return null;
  }

  const raw = token.slice(STATELESS_SESSION_PREFIX.length);
  const [encodedPayload, providedSignature] = raw.split(".");
  if (!encodedPayload || !providedSignature) {
    return null;
  }

  const expectedSignature = sign(encodedPayload);
  const provided = Buffer.from(providedSignature, "utf8");
  const expected = Buffer.from(expectedSignature, "utf8");
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return null;
  }

  try {
    const payload = JSON.parse(fromBase64Url(encodedPayload)) as StatelessSessionPayload;
    if (!payload.userId || !Array.isArray(payload.roles) || typeof payload.exp !== "number") {
      return null;
    }
    if (payload.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
