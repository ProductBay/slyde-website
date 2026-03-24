const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export function getTurnstileConfig() {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();
  const secretKey = process.env.TURNSTILE_SECRET_KEY?.trim();
  const mode = (process.env.PUBLIC_INTAKE_TURNSTILE_MODE?.trim().toLowerCase() || "monitor") as "off" | "monitor" | "enforce";

  return {
    siteKey,
    secretKey,
    mode,
    configured: Boolean(siteKey && secretKey),
  };
}

export async function verifyTurnstileToken(input: {
  token: string;
  remoteIp?: string;
}) {
  const config = getTurnstileConfig();
  if (!config.secretKey) {
    return {
      ok: false,
      reason: "Turnstile secret key is not configured.",
    };
  }

  const body = new URLSearchParams({
    secret: config.secretKey,
    response: input.token,
  });

  if (input.remoteIp) {
    body.set("remoteip", input.remoteIp);
  }

  const response = await fetch(TURNSTILE_VERIFY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });

  const json = (await response.json().catch(() => null)) as
    | {
        success?: boolean;
        "error-codes"?: string[];
      }
    | null;

  if (!response.ok || !json?.success) {
    return {
      ok: false,
      reason: json?.["error-codes"]?.join(", ") || `Turnstile verification failed with status ${response.status}.`,
    };
  }

  return {
    ok: true,
  };
}
