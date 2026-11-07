import { afterEach, describe, expect, it, vi } from "vitest";
import { absoluteUrl, getSiteUrl } from "./site";

afterEach(() => vi.unstubAllEnvs());

describe("site url helpers", () => {
  it("defaults to localhost", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    expect(getSiteUrl()).toBe("http://localhost:3000");
  });

  it("strips trailing slashes from the configured URL", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://example.com//");
    expect(getSiteUrl()).toBe("https://example.com");
  });

  it("builds absolute URLs", () => {
    expect(absoluteUrl("/en/blog", "https://example.com/")).toBe("https://example.com/en/blog");
    expect(absoluteUrl("en", "https://example.com")).toBe("https://example.com/en");
    expect(absoluteUrl("/", "https://example.com/")).toBe("https://example.com");
  });
});
