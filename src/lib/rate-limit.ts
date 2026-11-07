export interface RateLimitOptions {
  /** Max hits per window. */
  limit: number;
  windowMs: number;
  now?: () => number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  /** Milliseconds until the window resets. */
  retryAfterMs: number;
}

/**
 * Fixed-window in-memory rate limiter.
 * Good enough for a single Node process; use Redis/Upstash when running several instances.
 */
export function createRateLimiter({ limit, windowMs, now = Date.now }: RateLimitOptions) {
  const hits = new Map<string, { count: number; resetAt: number }>();

  function sweep(current: number) {
    for (const [key, entry] of hits) {
      if (entry.resetAt <= current) hits.delete(key);
    }
  }

  return {
    check(key: string): RateLimitResult {
      const current = now();
      if (hits.size > 1000) sweep(current);
      let entry = hits.get(key);
      if (!entry || entry.resetAt <= current) {
        entry = { count: 0, resetAt: current + windowMs };
        hits.set(key, entry);
      }
      if (entry.count >= limit) {
        return { allowed: false, remaining: 0, retryAfterMs: entry.resetAt - current };
      }
      entry.count += 1;
      return {
        allowed: true,
        remaining: limit - entry.count,
        retryAfterMs: entry.resetAt - current,
      };
    },
    reset(key?: string) {
      if (key) hits.delete(key);
      else hits.clear();
    },
    get size() {
      return hits.size;
    },
  };
}

export type RateLimiter = ReturnType<typeof createRateLimiter>;
