import { describe, expect, it } from "vitest";
import { isWindowExpired, nextRateWindow } from "@/lib/rate-window";

const MINUTE = 60_000;
const start = new Date("2026-01-01T10:00:00Z");

describe("nextRateWindow", () => {
  it("starts a window at one for the first hit", () => {
    expect(nextRateWindow(null, start, 15 * MINUTE)).toEqual({ count: 1, windowStartedAt: start });
  });

  it("counts hits inside the same window and keeps its start", () => {
    const first = nextRateWindow(null, start, 15 * MINUTE);
    const later = new Date(start.getTime() + 5 * MINUTE);
    expect(nextRateWindow(first, later, 15 * MINUTE)).toEqual({ count: 2, windowStartedAt: start });
  });

  it("restarts the count once the window has fully elapsed", () => {
    const current = { count: 9, windowStartedAt: start };
    const after = new Date(start.getTime() + 15 * MINUTE);
    expect(nextRateWindow(current, after, 15 * MINUTE)).toEqual({ count: 1, windowStartedAt: after });
  });
});

describe("isWindowExpired", () => {
  it("is false just before the window length and true at it", () => {
    expect(isWindowExpired(start, new Date(start.getTime() + 15 * MINUTE - 1), 15 * MINUTE)).toBe(false);
    expect(isWindowExpired(start, new Date(start.getTime() + 15 * MINUTE), 15 * MINUTE)).toBe(true);
  });
});
