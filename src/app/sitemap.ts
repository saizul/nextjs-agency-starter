import type { MetadataRoute } from "next";
import { getDictionary } from "@/i18n/dictionaries";
import { locales } from "@/i18n/config";
import { buildAlternates } from "@/i18n/utils";
import { buildAvailability } from "@/lib/availability";
import { getCaseStudies, getPosts } from "@/lib/content";
import { getSiteUrl } from "@/lib/site";
import { collectTags } from "@/lib/tags";

const STATIC_PATHS = ["/", "/services", "/case-studies", "/blog", "/about", "/contact"];

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const availability = buildAvailability();
  const entries: MetadataRoute.Sitemap = [];

  const add = (
    path: string,
    availableLocales: readonly (typeof locales)[number][],
    lastModified?: string,
  ) => {
    for (const locale of availableLocales) {
      const { canonical, languages } = buildAlternates(siteUrl, locale, path, availableLocales);
      entries.push({
        url: canonical,
        lastModified,
        alternates: { languages },
      });
    }
  };

  for (const path of STATIC_PATHS) add(path, locales);

  for (const service of getDictionary("en").services.items) {
    add(`/services/${service.slug}`, locales);
  }

  for (const [path, available] of Object.entries(availability)) {
    const [, collection, slug] = path.split("/");
    const locale = available[0];
    if (!locale || !slug) continue;
    const date =
      collection === "blog"
        ? getPosts(locale).find((p) => p.slug === slug)?.data
        : getCaseStudies(locale).find((c) => c.slug === slug)?.data;
    const lastModified = date && "updated" in date && date.updated ? date.updated : date?.date;
    add(path, available, lastModified);
  }

  for (const locale of locales) {
    for (const { slug } of collectTags(getPosts(locale).map((p) => p.data.tags))) {
      add(`/blog/tag/${slug}`, [locale]);
    }
  }

  return entries;
}
