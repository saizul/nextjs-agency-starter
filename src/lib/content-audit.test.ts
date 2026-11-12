import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { auditContent, extractLinks, type AuditIssue } from "./content-audit";

let dir: string;
let contentRoot: string;
let publicDir: string;

const DESC = "A description that is comfortably inside the recommended search snippet range.";

function post(locale: string, slug: string, fm: Record<string, unknown>, body = "Body text.") {
  const folder = path.join(contentRoot, locale, "blog");
  fs.mkdirSync(folder, { recursive: true });
  const yaml = Object.entries({ title: "A title", description: DESC, date: "2026-01-01", ...fm })
    .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
    .join("\n");
  fs.writeFileSync(path.join(folder, `${slug}.mdx`), `---\n${yaml}\n---\n\n${body}\n`);
}

function caseStudy(locale: string, slug: string, cover: string) {
  const folder = path.join(contentRoot, locale, "case-studies");
  fs.mkdirSync(folder, { recursive: true });
  fs.writeFileSync(
    path.join(folder, `${slug}.mdx`),
    `---\ntitle: "Case ${slug}"\nsummary: "${DESC}"\ndate: "2026-01-01"\nclient: "C"\nindustry: "I"\ncover: "${cover}"\n---\n\nBody\n`,
  );
}

const run = (today = "2026-06-01") =>
  auditContent({
    contentRoot,
    publicDir,
    serviceSlugs: ["technical-seo"],
    today,
    locales: ["en", "bn"],
  });
const find = (issues: AuditIssue[], text: string | RegExp) =>
  issues.filter((i) =>
    typeof text === "string" ? i.message.includes(text) : text.test(i.message),
  );

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), "content-audit-"));
  contentRoot = path.join(dir, "content");
  publicDir = path.join(dir, "public");
  fs.mkdirSync(path.join(publicDir, "images"), { recursive: true });
  fs.writeFileSync(path.join(publicDir, "images", "ok.svg"), "<svg/>");
});
afterEach(() => fs.rmSync(dir, { recursive: true, force: true }));

describe("extractLinks", () => {
  it("finds markdown links, images and href/src, but skips code", () => {
    const body = [
      '[a](/en/blog/x) ![img](/images/a.png) [t](/en/about "title")',
      '<a href="/en/contact">c</a> <img src="/images/b.svg" />',
      "`[no](/en/code)`",
      "```\n[no](/en/fenced)\n```",
    ].join("\n");
    expect(extractLinks(body)).toEqual([
      { href: "/en/blog/x", image: false },
      { href: "/images/a.png", image: true },
      { href: "/en/about", image: false },
      { href: "/en/contact", image: false },
      { href: "/images/b.svg", image: true },
    ]);
  });
});

describe("auditContent", () => {
  it("accepts a clean, translated site", () => {
    post("en", "hello", {}, "See [contact](/en/contact) and [SEO](/en/services/technical-seo).");
    post("bn", "hello", { title: "হ্যালো", ogTitle: "Hello" });
    expect(run()).toEqual([]);
  });

  it("reports every frontmatter error instead of stopping at the first", () => {
    post("en", "a", { title: "", description: "short" });
    post("en", "b", { date: "01/02/2026" });
    const errors = run().filter((i) => i.severity === "error");
    expect(errors.map((e) => e.file)).toEqual(["en/blog/a.mdx", "en/blog/a.mdx", "en/blog/b.mdx"]);
    expect(errors[2]?.message).toContain("YYYY-MM-DD");
  });

  it("finds broken internal links, missing locales and relative links", () => {
    post(
      "en",
      "linker",
      {},
      [
        "[ok](/en/blog/other) [ok2](/en/blog/tag/seo) [ok3](/en/blog/page/1#top) [rss](/en/blog/rss.xml)",
        "[gone](/en/blog/missing) [svc](/en/services/nope) [cs](/en/case-studies/nope) [page](/en/blog/page/9)",
        "[bare](/blog/other) [rel](other) [ext](https://example.com) [mail](mailto:a@b.c) [hash](#x)",
      ].join("\n"),
    );
    post("en", "other", { tags: ["SEO"] });
    post("bn", "linker", { title: "Linker" });
    post("bn", "other", { title: "Other" });
    const issues = run();
    expect(find(issues, "broken internal link").map((i) => i.message)).toEqual([
      "broken internal link /en/blog/missing",
      "broken internal link /en/services/nope",
      "broken internal link /en/case-studies/nope",
      "broken internal link /en/blog/page/9",
    ]);
    expect(find(issues, "no locale prefix")).toHaveLength(1);
    expect(find(issues, 'relative link "other"')).toHaveLength(1);
  });

  it("drafts are not valid link targets", () => {
    post("en", "a", {}, "[d](/en/blog/secret)");
    post("en", "secret", { draft: true });
    post("bn", "a", { title: "A" });
    expect(find(run(), "broken internal link /en/blog/secret")).toHaveLength(1);
  });

  it("checks images and case-study covers against public/", () => {
    post("en", "pics", {}, "![ok](/images/ok.svg) ![bad](/images/nope.png) [pdf](/files/x.pdf)");
    post("bn", "pics", { title: "Pics" });
    caseStudy("en", "good", "/images/ok.svg");
    caseStudy("en", "bad", "/images/missing.svg");
    caseStudy("bn", "good", "/images/ok.svg");
    caseStudy("bn", "bad", "/images/ok.svg");
    const errors = run()
      .filter((i) => i.severity === "error")
      .map((i) => `${i.file}: ${i.message}`);
    expect(errors).toEqual([
      "en/blog/pics.mdx: image /images/nope.png does not exist in public/",
      "en/blog/pics.mdx: file /files/x.pdf does not exist in public/",
      "en/case-studies/bad.mdx: cover /images/missing.svg does not exist in public/",
    ]);
  });

  it("warns about SEO lengths, future dates and dates out of order", () => {
    post("en", "long", { title: "T".repeat(61), description: "D".repeat(170), date: "2026-07-01" });
    post("en", "order", { date: "2026-03-01", updated: "2026-02-01" });
    post("bn", "long", { title: "Long" });
    post("bn", "order", { title: "Order" });
    const issues = run();
    expect(find(issues, "title is 61 characters")).toHaveLength(1);
    expect(find(issues, "description is 170 characters")).toHaveLength(1);
    expect(find(issues, "in the future")).toHaveLength(1);
    expect(find(issues, "is before date")[0]?.severity).toBe("error");
  });

  it("flags bad slugs, duplicate titles, tag drift, missing ogTitle and translations", () => {
    post("en", "My_Post", { title: "Same" });
    post("en", "second", { title: "same", tags: ["Web Performance"] });
    post("en", "third", { title: "Third", tags: ["web performance"] });
    post("bn", "bangla-only", { title: "বাংলা শিরোনাম" });
    const issues = run();
    expect(find(issues, "not a clean URL slug")).toHaveLength(1);
    expect(find(issues, "same title as en/blog/My_Post.mdx")).toHaveLength(1);
    expect(find(issues, /tag \/en\/blog\/tag\/web-performance is spelled/)).toHaveLength(1);
    expect(find(issues, "without ogTitle")).toHaveLength(1);
    expect(find(issues, "no bn translation").map((i) => i.file)).toEqual(
      expect.arrayContaining(["en/blog/second", "en/blog/third"]),
    );
    expect(find(issues, "no en translation").map((i) => i.file)).toEqual(["bn/blog/bangla-only"]);
  });

  it("lists errors before warnings", () => {
    post("en", "x", { title: "T".repeat(70) }, "[gone](/en/blog/none)");
    const issues = run();
    expect(issues[0]?.severity).toBe("error");
    expect(issues.at(-1)?.severity).toBe("warning");
  });
});

describe("repository content", () => {
  it("has no errors", () => {
    const issues = auditContent({
      contentRoot: path.join(process.cwd(), "content"),
      publicDir: path.join(process.cwd(), "public"),
      serviceSlugs: ["technical-seo", "web-development", "workflow-automation", "content-strategy"],
    });
    expect(issues.filter((i) => i.severity === "error")).toEqual([]);
  });
});
