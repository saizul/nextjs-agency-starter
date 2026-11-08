import { describe, expect, it } from "vitest";
import { buildContentSecurityPolicy, buildSecurityHeaders } from "./security-headers";

const get = (headers: { key: string; value: string }[], key: string) =>
  headers.find((h) => h.key === key)?.value;

describe("security headers", () => {
  it("includes the baseline headers in every mode", () => {
    for (const dev of [true, false]) {
      const headers = buildSecurityHeaders({ dev });
      expect(get(headers, "X-Content-Type-Options")).toBe("nosniff");
      expect(get(headers, "Referrer-Policy")).toBe("strict-origin-when-cross-origin");
      expect(get(headers, "Cross-Origin-Opener-Policy")).toBe("same-origin");
    }
  });

  it("adds HSTS and CSP only outside development", () => {
    const dev = buildSecurityHeaders({ dev: true });
    expect(get(dev, "Strict-Transport-Security")).toBeUndefined();
    expect(get(dev, "Content-Security-Policy")).toBeUndefined();
    const prod = buildSecurityHeaders();
    expect(get(prod, "Strict-Transport-Security")).toContain("max-age=");
    expect(get(prod, "Content-Security-Policy")).toBe(buildContentSecurityPolicy());
  });

  it("has unique header names", () => {
    const keys = buildSecurityHeaders().map((h) => h.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("builds a restrictive CSP", () => {
    const csp = buildContentSecurityPolicy();
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("frame-ancestors 'self'");
    expect(csp).toContain("form-action 'self'");
    expect(csp).not.toContain("'unsafe-eval'");
    expect(csp).not.toMatch(/\*/);
  });
});
