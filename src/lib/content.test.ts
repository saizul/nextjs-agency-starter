import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildAvailability } from "./availability";
import {
  getCaseStudies,
  getCaseStudy,
  getPost,
  getPosts,
  getPostsByTag,
  loadCollection,
} from "./content";
import { postSchema } from "./content-schemas";

let root: string;

function write(locale: string, name: string, frontmatter: string, body = "Body text here.") {
  const dir = path.join(root, locale, "blog");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, name), `---\n${frontmatter}\n---\n\n${body}\n`);
}

const fm = (title: string, date: string, extra = "") =>
  `title: "${title}"\ndescription: "A sufficiently long description for validation."\ndate: ${date}\n${extra}`;

beforeAll(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "content-test-"));
  write("en", "older.mdx", fm("Older", "2025-01-01", 'tags: ["SEO"]'));
  write("en", "newer.mdx", fm("Newer", "2026-02-01", 'tags: ["SEO", "Web Performance"]'));
  write("en", "draft.mdx", fm("Draft", "2026-03-01", "draft: true"));
  write("en", "notes.txt", "ignored");
  write("en", "markdown.md", fm("Plain markdown", "2025-06-01"));
});

afterAll(() => fs.rmSync(root, { recursive: true, force: true }));

describe("loadCollection (fixtures)", () => {
  it("sorts newest first and skips drafts and non-markdown files", () => {
    const posts = getPosts("en", root);
    expect(posts.map((p) => p.slug)).toEqual(["newer", "markdown", "older"]);
  });

  it("includes drafts on request", () => {
    const posts = loadCollection({
      collection: "blog",
      locale: "en",
      schema: postSchema,
      root,
      includeDrafts: true,
    });
    expect(posts.map((p) => p.slug)).toContain("draft");
  });

  it("applies schema defaults", () => {
    const post = getPost("en", "markdown", root);
    expect(post?.data.tags).toEqual([]);
    expect(post?.data.author).toBe("Saizul Amin");
    expect(post?.data.draft).toBe(false);
  });

  it("normalises YAML dates to YYYY-MM-DD strings", () => {
    expect(getPost("en", "older", root)?.data.date).toBe("2025-01-01");
  });

  it("computes reading time and strips frontmatter from the body", () => {
    const post = getPost("en", "older", root);
    expect(post?.readingMinutes).toBe(1);
    expect(post?.body).toBe("Body text here.");
  });

  it("returns an empty list for missing locales or collections", () => {
    expect(getPosts("bn", root)).toEqual([]);
    expect(getCaseStudies("en", root)).toEqual([]);
  });

  it("finds posts by tag slug", () => {
    expect(getPostsByTag("en", "web-performance", root).map((p) => p.slug)).toEqual(["newer"]);
    expect(getPostsByTag("en", "seo", root)).toHaveLength(2);
  });

  it("throws a helpful error for invalid frontmatter", () => {
    write("en", "broken.mdx", 'title: "x"\ndate: not-a-date');
    expect(() => getPosts("en", root)).toThrow(/broken\.mdx/);
    fs.rmSync(path.join(root, "en", "blog", "broken.mdx"));
  });

  it("returns undefined for unknown slugs", () => {
    expect(getPost("en", "nope", root)).toBeUndefined();
  });
});

describe("bundled content", () => {
  it("loads every English and Bangla post with valid frontmatter", () => {
    expect(getPosts("en").length).toBeGreaterThanOrEqual(4);
    expect(getPosts("bn").length).toBeGreaterThanOrEqual(2);
  });

  it("gives Bangla posts an ASCII ogTitle for social images", () => {
    for (const post of getPosts("bn")) {
      expect(post.data.ogTitle).toMatch(/^[\x20-\x7e]+$/);
    }
  });

  it("has case studies with existing cover images", () => {
    for (const locale of ["en", "bn"] as const) {
      for (const study of getCaseStudies(locale)) {
        expect(fs.existsSync(path.join(process.cwd(), "public", study.data.cover))).toBe(true);
      }
    }
    expect(getCaseStudy("en", "local-retail-seo-migration")?.data.featured).toBe(true);
  });

  it("builds an availability map for hreflang", () => {
    const map = buildAvailability();
    expect(map["/blog/technical-seo-checklist"]).toEqual(["en", "bn"]);
    expect(map["/blog/core-web-vitals-without-guesswork"]).toEqual(["en"]);
  });
});
