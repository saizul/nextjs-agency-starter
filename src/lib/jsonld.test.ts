import { describe, expect, it } from "vitest";
import {
  articleJsonLd,
  breadcrumbJsonLd,
  faqJsonLd,
  organizationJsonLd,
  serializeJsonLd,
  serviceJsonLd,
  websiteJsonLd,
} from "./jsonld";

describe("JSON-LD builders", () => {
  it("builds an Organization", () => {
    const data = organizationJsonLd({
      name: "Acme",
      url: "https://x.test",
      logo: "https://x.test/l.svg",
    });
    expect(data["@context"]).toBe("https://schema.org");
    expect(data["@type"]).toBe("Organization");
    expect(data).not.toHaveProperty("sameAs");
  });

  it("includes optional organization fields when provided", () => {
    const data = organizationJsonLd({
      name: "Acme",
      url: "https://x.test",
      logo: "l",
      email: "a@b.test",
      sameAs: ["https://example.org/acme"],
    });
    expect(data.email).toBe("a@b.test");
    expect(data.sameAs).toEqual(["https://example.org/acme"]);
  });

  it("builds a WebSite with language", () => {
    const data = websiteJsonLd({ name: "Acme", url: "https://x.test/en", inLanguage: "en" });
    expect(data["@type"]).toBe("WebSite");
    expect(data.inLanguage).toBe("en");
  });

  it("numbers breadcrumb items and makes URLs absolute", () => {
    const data = breadcrumbJsonLd(
      [
        { name: "Home", path: "/en" },
        { name: "Blog", path: "/en/blog" },
      ],
      "https://x.test",
    );
    const items = data.itemListElement as { position: number; item: string }[];
    expect(items.map((i) => i.position)).toEqual([1, 2]);
    expect(items[1]?.item).toBe("https://x.test/en/blog");
  });

  it("keeps absolute breadcrumb URLs untouched", () => {
    const data = breadcrumbJsonLd([{ name: "X", path: "https://other.test/x" }], "https://x.test");
    expect((data.itemListElement as { item: string }[])[0]?.item).toBe("https://other.test/x");
  });

  it("builds an Article", () => {
    const data = articleJsonLd({
      title: "T",
      description: "D",
      url: "https://x.test/p",
      image: "https://x.test/i.png",
      datePublished: "2026-01-01",
      author: "Jane",
      publisher: { name: "Acme", logo: "https://x.test/l.svg" },
      inLanguage: "en",
      keywords: ["a", "b"],
    });
    expect(data["@type"]).toBe("Article");
    expect(data.dateModified).toBe("2026-01-01");
    expect(data.keywords).toBe("a, b");
    expect((data.author as { name: string }).name).toBe("Jane");
  });

  it("builds a FAQPage", () => {
    const data = faqJsonLd([{ q: "Why?", a: "Because." }]);
    const [q] = data.mainEntity as { name: string; acceptedAnswer: { text: string } }[];
    expect(data["@type"]).toBe("FAQPage");
    expect(q?.name).toBe("Why?");
    expect(q?.acceptedAnswer.text).toBe("Because.");
  });

  it("builds a Service with provider", () => {
    const data = serviceJsonLd({
      name: "SEO",
      description: "d",
      url: "https://x.test/s",
      provider: { name: "Acme", url: "https://x.test" },
      areaServed: "Worldwide",
    });
    expect(data["@type"]).toBe("Service");
    expect(data.areaServed).toBe("Worldwide");
    expect((data.provider as { name: string }).name).toBe("Acme");
  });

  it("escapes < so inline scripts cannot be closed early", () => {
    const out = serializeJsonLd({ name: "</script><script>alert(1)</script>" });
    expect(out).not.toContain("</script>");
    expect(JSON.parse(out)).toEqual({ name: "</script><script>alert(1)</script>" });
  });
});
