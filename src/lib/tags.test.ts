import { describe, expect, it } from "vitest";
import { collectTags, hasTag, slugifyTag } from "./tags";

describe("tags", () => {
  it("slugifies Latin tags", () => {
    expect(slugifyTag("Technical SEO")).toBe("technical-seo");
    expect(slugifyTag("  Web   Performance! ")).toBe("web-performance");
  });

  it("keeps Bangla letters in slugs", () => {
    expect(slugifyTag("টেকনিক্যাল SEO")).toBe("টেকনিক্যাল-seo");
  });

  it("counts and sorts tags", () => {
    const result = collectTags([["SEO", "Performance"], ["SEO"], ["Automation", "SEO"]]);
    expect(result[0]).toEqual({ tag: "SEO", slug: "seo", count: 3 });
    expect(result.map((t) => t.slug)).toEqual(["seo", "automation", "performance"]);
  });

  it("does not double count duplicate tags on one item", () => {
    expect(collectTags([["SEO", "SEO", "seo"]])[0]?.count).toBe(1);
  });

  it("matches tags by slug", () => {
    expect(hasTag(["Technical SEO"], "technical-seo")).toBe(true);
    expect(hasTag(["Technical SEO"], "seo")).toBe(false);
  });

  it("ignores tags that slugify to nothing", () => {
    expect(collectTags([["!!!"]])).toEqual([]);
  });
});
