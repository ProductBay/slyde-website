type RateLimitBucket = {
  count: number;
  resetAt: number;
};

declare global {
  // eslint-disable-next-line no-var
  var __slydeRateLimitBuckets: Map<string, RateLimitBucket> | undefined;
}

function getBuckets() {
  globalThis.__slydeRateLimitBuckets ??= new Map<string, RateLimitBucket>();
  return globalThis.__slydeRateLimitBuckets;
}

export function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export function consumeRateLimit(input: {
  routeKey: string;
  clientIp: string;
  limit: number;
  windowMs: number;
}) {
  const now = Date.now();
  const key = `${input.routeKey}:${input.clientIp}`;
  const buckets = getBuckets();
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    const next: RateLimitBucket = {
      count: 1,
      resetAt: now + input.windowMs,
    };
    buckets.set(key, next);

    return {
      allowed: true,
      remaining: Math.max(0, input.limit - 1),
      resetAt: next.resetAt,
    };
  }

  current.count += 1;
  buckets.set(key, current);

  return {
    allowed: current.count <= input.limit,
    remaining: Math.max(0, input.limit - current.count),
    resetAt: current.resetAt,
  };
}
