import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { z } from "zod";
import { locales, type Locale } from "@/i18n/config";
import { POSTS_PER_PAGE } from "./content";
import { caseStudySchema, postSchema } from "./content-schemas";
import { slugifyTag } from "./tags";

/**
 * Editorial checks that the build cannot catch: broken internal links and images,
 * SEO lengths, date mistakes, duplicate titles, tag spelling drift and missing
 * translations. `loadCollection` stops at the first invalid file; this reports every
 * problem in every file at once. Used by `npm run content:check` and in CI.
 */

export type Severity = "error" | "warning";
export interface AuditIssue {
  severity: Severity;
  file: string;
  message: string;
}

export interface AuditOptions {
  /** Folder with `<locale>/<collection>/*.mdx`. */
  contentRoot: string;
  /** Folder served at `/` (for image and cover checks). */
  publicDir: string;
  /** Slugs that exist under `/services/<slug>`. */
  serviceSlugs: readonly string[];
  /** Reference date `YYYY-MM-DD` for "dated in the future" checks. */
  today?: string;
  locales?: readonly Locale[];
}

/** Search-result friendly limits (characters). */
export const SEO_LIMITS = { titleMax: 60, descriptionMin: 50, descriptionMax: 160 } as const;

const COLLECTIONS = {
  blog: postSchema,
  "case-studies": caseStudySchema,
} as const;
type Collection = keyof typeof COLLECTIONS;

interface Doc {
  file: string;
  locale: Locale;
  collection: Collection;
  slug: string;
  data: Record<string, unknown>;
  body: string;
}

const STATIC_PAGES = new Set([
  "",
  "about",
  "contact",
  "services",
  "blog",
  "case-studies",
  "blog/rss.xml",
]);

/** Internal link targets in Markdown/MDX: `[text](/path)`, `![alt](/img)` and `href="/path"`. */
export function extractLinks(body: string): { href: string; image: boolean }[] {
  const out: { href: string; image: boolean }[] = [];
  // Ignore fenced and inline code so examples are not treated as links.
  const text = body.replace(/```[\s\S]*?```/g, "").replace(/`[^`\n]*`/g, "");
  for (const m of text.matchAll(/(!?)\[[^\]]*\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g)) {
    out.push({ href: m[2] ?? "", image: m[1] === "!" });
  }
  for (const m of text.matchAll(/\b(href|src)=["']([^"']+)["']/g)) {
    out.push({ href: m[2] ?? "", image: m[1] === "src" });
  }
  return out;
}

const isExternal = (href: string) => /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(href);

function readDocs(root: string, locs: readonly Locale[]): Doc[] {
  const docs: Doc[] = [];
  for (const locale of locs) {
    for (const collection of Object.keys(COLLECTIONS) as Collection[]) {
      const dir = path.join(root, locale, collection);
      if (!fs.existsSync(dir)) continue;
      for (const name of fs.readdirSync(dir).sort()) {
        const ext = path.extname(name);
        if (ext !== ".mdx" && ext !== ".md") continue;
        const raw = fs.readFileSync(path.join(dir, name), "utf8");
        const { data, content } = matter(raw);
        docs.push({
          file: `${locale}/${collection}/${name}`,
          locale,
          collection,
          slug: path.basename(name, ext),
          data,
          body: content,
        });
      }
    }
  }
  return docs;
}

export function auditContent(opts: AuditOptions): AuditIssue[] {
  const locs = opts.locales ?? locales;
  const today = opts.today ?? new Date().toISOString().slice(0, 10);
  const issues: AuditIssue[] = [];
  const add = (severity: Severity, file: string, message: string) =>
    issues.push({ severity, file, message });

  const docs = readDocs(opts.contentRoot, locs);
  const valid: (Doc & { parsed: Record<string, unknown> })[] = [];

  for (const doc of docs) {
    const schema = COLLECTIONS[doc.collection] as z.ZodType<Record<string, unknown>>;
    const parsed = schema.safeParse(doc.data);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        add("error", doc.file, `frontmatter ${issue.path.join(".") || "(root)"}: ${issue.message}`);
      }
      continue;
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(doc.slug)) {
      add(
        "error",
        doc.file,
        `file name "${doc.slug}" is not a clean URL slug (lowercase letters, digits, hyphens)`,
      );
    }
    valid.push({ ...doc, parsed: parsed.data });
  }

  const published = valid.filter((d) => !d.parsed.draft);
  const slugsBy = (locale: Locale, collection: Collection) =>
    new Set(
      published
        .filter((d) => d.locale === locale && d.collection === collection)
        .map((d) => d.slug),
    );
  const tagSlugs = (locale: Locale) =>
    new Set(
      published
        .filter((d) => d.locale === locale && d.collection === "blog")
        .flatMap((d) => (d.parsed.tags as string[]).map(slugifyTag)),
    );
  const pageCount = (locale: Locale) =>
    Math.max(1, Math.ceil(slugsBy(locale, "blog").size / POSTS_PER_PAGE));

  const routeExists = (pathname: string): boolean | "no-locale" => {
    const parts = pathname.replace(/\/+$/, "").split("/").filter(Boolean);
    const [first, ...rest] = parts;
    if (!first || !(locs as readonly string[]).includes(first)) return "no-locale";
    const locale = first as Locale;
    const tail = rest.join("/");
    if (STATIC_PAGES.has(tail)) return true;
    const [section, a, b] = rest;
    if (section === "blog" && a === "tag" && b) return tagSlugs(locale).has(decodeURIComponent(b));
    if (section === "blog" && a === "page" && b && /^\d+$/.test(b))
      return Number(b) >= 1 && Number(b) <= pageCount(locale);
    if (rest.length === 2 && a) {
      if (section === "blog") return slugsBy(locale, "blog").has(a);
      if (section === "case-studies") return slugsBy(locale, "case-studies").has(a);
      if (section === "services") return opts.serviceSlugs.includes(a);
    }
    return false;
  };

  for (const doc of valid) {
    const d = doc.parsed;
    const title = String(d.title);
    const description = String(doc.collection === "blog" ? d.description : d.summary);
    const label = doc.collection === "blog" ? "description" : "summary";

    if ([...title].length > SEO_LIMITS.titleMax) {
      add(
        "warning",
        doc.file,
        `title is ${[...title].length} characters; search results cut off around ${SEO_LIMITS.titleMax}`,
      );
    }
    const dl = [...description].length;
    if (dl < SEO_LIMITS.descriptionMin || dl > SEO_LIMITS.descriptionMax) {
      add(
        "warning",
        doc.file,
        `${label} is ${dl} characters; aim for ${SEO_LIMITS.descriptionMin}-${SEO_LIMITS.descriptionMax}`,
      );
    }

    const date = String(d.date);
    if (d.updated && String(d.updated) < date)
      add("error", doc.file, `updated (${String(d.updated)}) is before date (${date})`);
    if (!d.draft && date > today)
      add(
        "warning",
        doc.file,
        `dated ${date}, in the future, but not a draft; it is published immediately`,
      );

    if (
      doc.collection === "blog" &&
      doc.locale !== "en" &&
      !d.ogTitle &&
      /[^\x20-\x7e]/.test(title)
    ) {
      add(
        "warning",
        doc.file,
        "non-Latin title without ogTitle; the share image falls back to the site name",
      );
    }
    if (doc.collection === "case-studies") {
      const cover = String(d.cover);
      if (!fs.existsSync(path.join(opts.publicDir, cover)))
        add("error", doc.file, `cover ${cover} does not exist in public/`);
    }

    for (const { href, image } of extractLinks(doc.body)) {
      if (!href || isExternal(href)) continue;
      const clean = href.split(/[?#]/)[0] ?? "";
      if (!clean.startsWith("/")) {
        add(
          "warning",
          doc.file,
          `relative link "${href}"; use an absolute path such as /${doc.locale}/blog/...`,
        );
        continue;
      }
      if (image || /\.(svg|png|jpe?g|webp|gif|avif|pdf)$/i.test(clean)) {
        if (!fs.existsSync(path.join(opts.publicDir, decodeURIComponent(clean)))) {
          add("error", doc.file, `${image ? "image" : "file"} ${clean} does not exist in public/`);
        }
        continue;
      }
      const exists = routeExists(clean);
      if (exists === "no-locale")
        add("warning", doc.file, `link ${href} has no locale prefix; it relies on a redirect`);
      else if (!exists) add("error", doc.file, `broken internal link ${href}`);
    }
  }

  // Duplicates and tag drift within each locale.
  for (const locale of locs) {
    for (const collection of Object.keys(COLLECTIONS) as Collection[]) {
      const group = published.filter((d) => d.locale === locale && d.collection === collection);
      const seen = new Map<string, string>();
      for (const doc of group) {
        const key = String(doc.parsed.title).trim().toLowerCase();
        const prev = seen.get(key);
        if (prev) add("warning", doc.file, `same title as ${prev}`);
        else seen.set(key, doc.file);
      }
    }
    const spellings = new Map<string, Set<string>>();
    for (const doc of published.filter((d) => d.locale === locale && d.collection === "blog")) {
      for (const tag of doc.parsed.tags as string[]) {
        const slug = slugifyTag(tag);
        if (!spellings.has(slug)) spellings.set(slug, new Set());
        spellings.get(slug)?.add(tag);
      }
    }
    for (const [slug, names] of spellings) {
      if (names.size > 1) {
        add(
          "warning",
          `${locale}/blog`,
          `tag /${locale}/blog/tag/${slug} is spelled ${[...names].map((n) => `"${n}"`).join(", ")}; pick one`,
        );
      }
    }
  }

  // Translation coverage (informational: single-language posts are supported).
  for (const collection of Object.keys(COLLECTIONS) as Collection[]) {
    const bySlug = new Map<string, Locale[]>();
    for (const doc of published.filter((d) => d.collection === collection)) {
      bySlug.set(doc.slug, [...(bySlug.get(doc.slug) ?? []), doc.locale]);
    }
    for (const [slug, have] of bySlug) {
      const missing = locs.filter((l) => !have.includes(l));
      if (missing.length)
        add("warning", `${have[0]}/${collection}/${slug}`, `no ${missing.join(", ")} translation`);
    }
  }

  return issues.sort((a, b) =>
    a.severity === b.severity ? a.file.localeCompare(b.file) : a.severity === "error" ? -1 : 1,
  );
}
