import { createHmac, timingSafeEqual } from "node:crypto";
import { getAppBaseUrl } from "@/lib/app-base-url";

function getWebsiteBaseUrl() {
  return getAppBaseUrl();
}

function getStatusTokenSecret() {
  return process.env.SLYDE_MERCHANT_STATUS_TOKEN_SECRET || process.env.SLYDE_APP_SYNC_SECRET || "slyde-merchant-status-dev-secret";
}

function base64UrlEncode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signStatusTokenPayload(payload: string) {
  return createHmac("sha256", getStatusTokenSecret()).update(payload).digest("base64url");
}

export function createMerchantStatusToken(leadId: string, applicationId?: string, expiresInDays = 30) {
  const payload = JSON.stringify({
    leadId,
    applicationId: applicationId ?? null,
    exp: Date.now() + expiresInDays * 24 * 60 * 60 * 1000,
  });
  const encodedPayload = base64UrlEncode(payload);
  const signature = signStatusTokenPayload(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function verifyMerchantStatusToken(token: string) {
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) {
    throw new Error("Status link is invalid or expired.");
  }

  const expectedSignature = signStatusTokenPayload(encodedPayload);
  const provided = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    throw new Error("Status link is invalid or expired.");
  }

  const parsed = JSON.parse(base64UrlDecode(encodedPayload)) as {
    leadId: string;
    applicationId?: string | null;
    exp: number;
  };

  if (!parsed.leadId || !parsed.exp || parsed.exp < Date.now()) {
    throw new Error("Status link is invalid or expired.");
  }

  return parsed;
}

export function buildMerchantStatusUrl(leadId: string, applicationId?: string) {
  const token = createMerchantStatusToken(leadId, applicationId);
  return `${getWebsiteBaseUrl()}/for-businesses/status?token=${encodeURIComponent(token)}`;
}
