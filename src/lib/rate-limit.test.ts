import { describe, expect, it } from "vitest";
import { createRateLimiter } from "./rate-limit";

function setup(limit = 3, windowMs = 1000) {
  let time = 0;
  const limiter = createRateLimiter({ limit, windowMs, now: () => time });
  return { limiter, advance: (ms: number) => (time += ms) };
}

describe("rate limiter", () => {
  it("allows requests up to the limit", () => {
    const { limiter } = setup();
    expect(limiter.check("a").allowed).toBe(true);
    expect(limiter.check("a").allowed).toBe(true);
    const third = limiter.check("a");
    expect(third.allowed).toBe(true);
    expect(third.remaining).toBe(0);
  });

  it("blocks once the limit is exceeded and reports retry time", () => {
    const { limiter, advance } = setup();
    for (let i = 0; i < 3; i++) limiter.check("a");
    advance(400);
    const blocked = limiter.check("a");
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterMs).toBe(600);
  });

  it("tracks keys independently", () => {
    const { limiter } = setup(1);
    expect(limiter.check("a").allowed).toBe(true);
    expect(limiter.check("b").allowed).toBe(true);
    expect(limiter.check("a").allowed).toBe(false);
  });

  it("resets after the window passes", () => {
    const { limiter, advance } = setup(1);
    limiter.check("a");
    expect(limiter.check("a").allowed).toBe(false);
    advance(1000);
    expect(limiter.check("a").allowed).toBe(true);
  });

  it("can reset one key or everything", () => {
    const { limiter } = setup(1);
    limiter.check("a");
    limiter.check("b");
    limiter.reset("a");
    expect(limiter.check("a").allowed).toBe(true);
    expect(limiter.check("b").allowed).toBe(false);
    limiter.reset();
    expect(limiter.size).toBe(0);
  });

  it("sweeps expired entries when the map grows large", () => {
    const { limiter, advance } = setup(1, 10);
    for (let i = 0; i < 1001; i++) limiter.check(`k${i}`);
    advance(20);
    limiter.check("fresh");
    expect(limiter.size).toBe(1);
  });
});
