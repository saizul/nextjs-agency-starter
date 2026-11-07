import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { z } from "zod";
import type { Locale } from "@/i18n/config";
import { caseStudySchema, postSchema } from "./content-schemas";
import { readingTime } from "./reading-time";
import { hasTag } from "./tags";

export const CONTENT_ROOT = path.join(/* turbopackIgnore: true */ process.cwd(), "content");
export const POSTS_PER_PAGE = 3;

const EXTENSIONS = new Set([".mdx", ".md"]);

export interface Entry<T> {
  slug: string;
  locale: Locale;
  data: T;
  /** Raw MDX body without frontmatter. */
  body: string;
  /** Estimated minutes to read. */
  readingMinutes: number;
}

export interface LoadOptions<S extends z.ZodType> {
  collection: string;
  locale: Locale;
  schema: S;
  root?: string;
  includeDrafts?: boolean;
}

/**
 * Load, validate and sort a content collection from `<root>/<locale>/<collection>/*.mdx`.
 * Throws a descriptive error when frontmatter does not match the schema.
 */
export function loadCollection<S extends z.ZodType<{ date: string; draft?: boolean }>>({
  collection,
  locale,
  schema,
  root = CONTENT_ROOT,
  includeDrafts = false,
}: LoadOptions<S>): Entry<z.output<S>>[] {
  const dir = path.join(/* turbopackIgnore: true */ root, locale, collection);
  if (!fs.existsSync(/* turbopackIgnore: true */ dir)) return [];

  const entries: Entry<z.output<S>>[] = [];
  for (const file of fs.readdirSync(/* turbopackIgnore: true */ dir)) {
    const ext = path.extname(file);
    if (!EXTENSIONS.has(ext)) continue;
    const slug = path.basename(file, ext);
    const raw = fs.readFileSync(/* turbopackIgnore: true */ path.join(dir, file), "utf8");
    const { data, content } = matter(raw);
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      const issues = parsed.error.issues
        .map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`)
        .join("; ");
      throw new Error(`Invalid frontmatter in ${locale}/${collection}/${file}: ${issues}`);
    }
    const value = parsed.data as z.output<S> & { draft?: boolean };
    if (value.draft && !includeDrafts) continue;
    entries.push({
      slug,
      locale,
      data: value,
      body: content.trim(),
      readingMinutes: readingTime(content),
    });
  }

  return entries.sort(
    (a, b) => b.data.date.localeCompare(a.data.date) || a.slug.localeCompare(b.slug),
  );
}

export const getPosts = (locale: Locale, root?: string) =>
  loadCollection({ collection: "blog", locale, schema: postSchema, root });

export const getPost = (locale: Locale, slug: string, root?: string) =>
  getPosts(locale, root).find((post) => post.slug === slug);

export const getPostsByTag = (locale: Locale, tagSlug: string, root?: string) =>
  getPosts(locale, root).filter((post) => hasTag(post.data.tags, tagSlug));

export const getCaseStudies = (locale: Locale, root?: string) =>
  loadCollection({ collection: "case-studies", locale, schema: caseStudySchema, root });

export const getCaseStudy = (locale: Locale, slug: string, root?: string) =>
  getCaseStudies(locale, root).find((entry) => entry.slug === slug);

export type Post = ReturnType<typeof getPosts>[number];
export type CaseStudy = ReturnType<typeof getCaseStudies>[number];
