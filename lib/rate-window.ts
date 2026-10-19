// Pure fixed-window rate limit rule. Shared by the database limiter and its tests.
// The SQL upsert in features/auth/rate-limit.ts applies the same rule atomically.

export type RateWindow = { count: number; windowStartedAt: Date };

/** True once a window has run its full length. */
export function isWindowExpired(windowStartedAt: Date, now: Date, windowMs: number): boolean {
  return now.getTime() - windowStartedAt.getTime() >= windowMs;
}

/** Counts one more hit. An expired (or missing) window starts again at one. */
export function nextRateWindow(current: RateWindow | null, now: Date, windowMs: number): RateWindow {
  if (!current || isWindowExpired(current.windowStartedAt, now, windowMs)) {
    return { count: 1, windowStartedAt: now };
  }
  return { count: current.count + 1, windowStartedAt: current.windowStartedAt };
}
