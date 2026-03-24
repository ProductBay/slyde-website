import { NextResponse } from "next/server";
import { consumeRateLimit, getClientIp } from "@/server/security/rate-limit";
import { getTurnstileConfig, verifyTurnstileToken } from "@/server/security/turnstile";

function getRateLimitConfig(overrides?: {
  limit?: number;
  windowMs?: number;
}) {
  return {
    limit: overrides?.limit ?? Number(process.env.PUBLIC_RATE_LIMIT_MAX_REQUESTS || 20),
    windowMs: overrides?.windowMs ?? Number(process.env.PUBLIC_RATE_LIMIT_WINDOW_MS || 10 * 60 * 1000),
  };
}

export async function protectPublicRoute(
  request: Request,
  input: {
    routeKey: string;
    limit?: number;
    windowMs?: number;
    requireTurnstile?: boolean;
  },
) {
  const ipAddress = getClientIp(request);
  const rateLimit = getRateLimitConfig({
    limit: input.limit,
    windowMs: input.windowMs,
  });

  const rateLimitResult = consumeRateLimit({
    routeKey: input.routeKey,
    clientIp: ipAddress,
    limit: rateLimit.limit,
    windowMs: rateLimit.windowMs,
  });

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      {
        error: "Too many requests. Please wait before trying again.",
        protection: {
          type: "rate_limit",
          resetAt: new Date(rateLimitResult.resetAt).toISOString(),
        },
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000)),
        },
      },
    );
  }

  if (input.requireTurnstile) {
    const turnstile = getTurnstileConfig();
    const token = request.headers.get("x-turnstile-token")?.trim();

    if (turnstile.mode === "enforce" && !turnstile.configured) {
      return NextResponse.json(
        {
          error: "Bot protection is required but not configured on this server.",
        },
        { status: 503 },
      );
    }

    if (turnstile.mode !== "off") {
      if (!token) {
        if (turnstile.mode === "enforce") {
          return NextResponse.json(
            {
              error: "Bot protection check is required before submission.",
            },
            { status: 403 },
          );
        }

        console.warn("[public-route-protection] missing turnstile token", {
          routeKey: input.routeKey,
          ipAddress,
        });
      } else if (turnstile.configured) {
        const verification = await verifyTurnstileToken({
          token,
          remoteIp: ipAddress,
        });

        if (!verification.ok) {
          if (turnstile.mode === "enforce") {
            return NextResponse.json(
              {
                error: "Bot protection verification failed.",
                reason: verification.reason,
              },
              { status: 403 },
            );
          }

          console.warn("[public-route-protection] turnstile verification failed", {
            routeKey: input.routeKey,
            ipAddress,
            reason: verification.reason,
          });
        }
      }
    }
  }

  return null;
}
