import { locales, type Locale } from "@/i18n/config";
import type { Availability } from "@/i18n/switch";
import { getCaseStudies, getPosts } from "./content";

/** Which locales have each blog post / case study (used by hreflang and the language switcher). */
export function buildAvailability(root?: string): Availability {
  const map: Availability = {};
  const add = (path: string, locale: Locale) => {
    (map[path] ??= []).push(locale);
  };
  for (const locale of locales) {
    for (const post of getPosts(locale, root)) add(`/blog/${post.slug}`, locale);
    for (const study of getCaseStudies(locale, root)) add(`/case-studies/${study.slug}`, locale);
  }
  return map;
}
