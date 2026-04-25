type BucketEntry = {
  count: number;
  resetAt: number;
};

const bucket = new Map<string, BucketEntry>();

export function simpleRateLimit(params: {
  key: string;
  limit: number;
  windowMs: number;
}):
  | {
      ok: true;
      remaining: number;
      resetAt: number;
    }
  | {
      ok: false;
      remaining: 0;
      resetAt: number;
      retryAfterMs: number;
    } {
  const now = Date.now();
  const current = bucket.get(params.key);

  if (!current || current.resetAt <= now) {
    const resetAt = now + params.windowMs;
    bucket.set(params.key, {
      count: 1,
      resetAt,
    });

    return {
      ok: true,
      remaining: params.limit - 1,
      resetAt,
    };
  }

  if (current.count >= params.limit) {
    return {
      ok: false,
      remaining: 0,
      resetAt: current.resetAt,
      retryAfterMs: Math.max(0, current.resetAt - now),
    };
  }

  current.count += 1;
  bucket.set(params.key, current);

  return {
    ok: true,
    remaining: params.limit - current.count,
    resetAt: current.resetAt,
  };
}
