import { describe, expect, it } from "vitest";
import { locales } from "./config";
import { flattenKeys, getDictionary } from "./dictionaries";

describe("dictionaries", () => {
  it("have identical key structure in every locale", () => {
    const base = flattenKeys(getDictionary("en")).sort();
    for (const locale of locales) {
      expect(flattenKeys(getDictionary(locale)).sort()).toEqual(base);
    }
  });

  it("contain no empty strings", () => {
    for (const locale of locales) {
      const dict = getDictionary(locale);
      const walk = (value: unknown): void => {
        if (typeof value === "string") expect(value.trim()).not.toBe("");
        else if (Array.isArray(value)) value.forEach(walk);
        else if (value && typeof value === "object") Object.values(value).forEach(walk);
      };
      walk(dict);
    }
  });

  it("share the same service slugs in the same order", () => {
    const slugs = (l: "en" | "bn") => getDictionary(l).services.items.map((s) => s.slug);
    expect(slugs("bn")).toEqual(slugs("en"));
  });

  it("keep the same placeholders in translated strings", () => {
    const placeholders = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join(",");
    const en = getDictionary("en");
    const bn = getDictionary("bn");
    for (const key of ["minRead", "pageOf"] as const) {
      expect(placeholders(bn.common[key])).toBe(placeholders(en.common[key]));
    }
    expect(placeholders(bn.footer.copyright)).toBe(placeholders(en.footer.copyright));
    expect(placeholders(bn.blog.tagTitle)).toBe(placeholders(en.blog.tagTitle));
  });

  it("mark testimonials as sample content", () => {
    for (const locale of locales) {
      expect(getDictionary(locale).home.testimonials.sampleNote.length).toBeGreaterThan(10);
    }
  });

  it("provide contact validation messages for every schema message", () => {
    const keys = Object.keys(getDictionary("en").contact.form.validation).sort();
    expect(keys).toEqual([
      "budgetInvalid",
      "emailInvalid",
      "messageLong",
      "messageShort",
      "nameRequired",
    ]);
  });
});
