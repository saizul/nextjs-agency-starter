import { z } from "zod";

/** Accepts `2026-01-31` or a YAML date (parsed to Date) and normalises to `YYYY-MM-DD`. */
export const isoDate = z.preprocess(
  (value) => (value instanceof Date ? value.toISOString().slice(0, 10) : value),
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use the format YYYY-MM-DD"),
);

export const postSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(20).max(300),
  date: isoDate,
  updated: isoDate.optional(),
  tags: z.array(z.string().min(1)).default([]),
  author: z.string().default("Saizul Amin"),
  draft: z.boolean().default(false),
  /** Latin-only title for the generated Open Graph image (useful for non-Latin posts). */
  ogTitle: z.string().optional(),
});
export type PostFrontmatter = z.infer<typeof postSchema>;

export const caseStudySchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(20).max(300),
  date: isoDate,
  client: z.string().min(1),
  industry: z.string().min(1),
  services: z.array(z.string()).default([]),
  duration: z.string().optional(),
  cover: z.string().startsWith("/"),
  results: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
  featured: z.boolean().default(false),
  draft: z.boolean().default(false),
});
export type CaseStudyFrontmatter = z.infer<typeof caseStudySchema>;
