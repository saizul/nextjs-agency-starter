import { describe, expect, it } from "vitest";
import { isLocale } from "./config";
import { resolveSwitchPath } from "./switch";
import {
  buildAlternates,
  formatDate,
  interpolate,
  localizePath,
  negotiateLocale,
  normalizePath,
  splitLocale,
} from "./utils";

describe("path helpers", () => {
  it("normalises paths", () => {
    expect(normalizePath("blog/")).toBe("/blog");
    expect(normalizePath("//a//b/")).toBe("/a/b");
    expect(normalizePath("/")).toBe("/");
  });

  it("localizes paths", () => {
    expect(localizePath("en", "/")).toBe("/en");
    expect(localizePath("bn", "/blog")).toBe("/bn/blog");
    expect(localizePath("bn", "blog/post")).toBe("/bn/blog/post");
  });

  it("splits locale from path", () => {
    expect(splitLocale("/bn/blog/x")).toEqual({ locale: "bn", path: "/blog/x" });
    expect(splitLocale("/en")).toEqual({ locale: "en", path: "/" });
    expect(splitLocale("/blog")).toEqual({ locale: null, path: "/blog" });
    expect(splitLocale("/english")).toEqual({ locale: null, path: "/english" });
  });

  it("validates locales", () => {
    expect(isLocale("en")).toBe(true);
    expect(isLocale("fr")).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });
});

describe("negotiateLocale", () => {
  it("falls back to the default", () => {
    expect(negotiateLocale(null)).toBe("en");
    expect(negotiateLocale("")).toBe("en");
    expect(negotiateLocale("fr-FR,de;q=0.8")).toBe("en");
  });

  it("matches region subtags", () => {
    expect(negotiateLocale("bn-BD,bn;q=0.9,en;q=0.5")).toBe("bn");
  });

  it("honours q-values", () => {
    expect(negotiateLocale("en;q=0.4, bn;q=0.9")).toBe("bn");
    expect(negotiateLocale("bn;q=0, en")).toBe("en");
  });

  it("is case-insensitive and tolerant of junk", () => {
    expect(negotiateLocale("BN")).toBe("bn");
    expect(negotiateLocale("bn;q=abc, en")).toBe("en");
  });
});

describe("buildAlternates", () => {
  it("builds canonical and hreflang URLs including x-default", () => {
    const result = buildAlternates("https://example.com/", "bn", "/blog");
    expect(result.canonical).toBe("https://example.com/bn/blog");
    expect(result.languages).toEqual({
      en: "https://example.com/en/blog",
      bn: "https://example.com/bn/blog",
      "x-default": "https://example.com/en/blog",
    });
  });

  it("only lists locales that exist", () => {
    const result = buildAlternates("https://example.com", "bn", "/blog/x", ["bn"]);
    expect(Object.keys(result.languages)).toEqual(["bn", "x-default"]);
    expect(result.languages["x-default"]).toBe("https://example.com/bn/blog/x");
  });

  it("handles the home page", () => {
    expect(buildAlternates("https://example.com", "en", "/").canonical).toBe(
      "https://example.com/en",
    );
  });
});

describe("formatting", () => {
  it("formats dates per locale", () => {
    expect(formatDate("en", "2026-09-12")).toBe("12 September 2026");
    expect(formatDate("bn", "2026-09-12")).toContain("২০২৬");
  });

  it("interpolates placeholders", () => {
    expect(interpolate("{min} min read", { min: 4 })).toBe("4 min read");
    expect(interpolate("Page {page} of {total}", { page: 1, total: 3 })).toBe("Page 1 of 3");
    expect(interpolate("keep {unknown}", {})).toBe("keep {unknown}");
  });
});

describe("resolveSwitchPath", () => {
  const availability = { "/blog/a": ["en", "bn"], "/blog/b": ["en"] } as Parameters<
    typeof resolveSwitchPath
  >[2];

  it("keeps the same page when it exists", () => {
    expect(resolveSwitchPath("/blog/a", "bn", availability)).toBe("/bn/blog/a");
    expect(resolveSwitchPath("/about", "bn", availability)).toBe("/bn/about");
  });

  it("falls back to the section index when untranslated", () => {
    expect(resolveSwitchPath("/blog/b", "bn", availability)).toBe("/bn/blog");
  });

  it("sends paginated and tag pages to the blog index", () => {
    expect(resolveSwitchPath("/blog/page/2", "bn", availability)).toBe("/bn/blog");
    expect(resolveSwitchPath("/blog/tag/seo", "bn", availability)).toBe("/bn/blog");
  });
});
