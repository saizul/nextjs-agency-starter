import type { Metadata } from "next";
import { ogLocales, locales, type Locale } from "@/i18n/config";
import { buildAlternates } from "@/i18n/utils";
import { getSiteUrl, siteConfig } from "./site";

export interface PageMetaInput {
  locale: Locale;
  /** Locale-agnostic path, e.g. `/blog/my-post`. */
  path: string;
  title: string;
  description: string;
  type?: "website" | "article";
  availableLocales?: readonly Locale[];
  noindex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
  /** Extra alternate link types such as the RSS feed. */
  feeds?: Record<string, string>;
}

export function buildMetadata(input: PageMetaInput): Metadata {
  const siteUrl = getSiteUrl();
  const available = input.availableLocales ?? locales;
  const alternates = buildAlternates(siteUrl, input.locale, input.path, available);
  const others = available.filter((l) => l !== input.locale).map((l) => ogLocales[l]);

  return {
    title: input.title,
    description: input.description,
    alternates: {
      canonical: alternates.canonical,
      languages: alternates.languages,
      ...(input.feeds && { types: input.feeds }),
    },
    robots: input.noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      title: input.title,
      description: input.description,
      url: alternates.canonical,
      siteName: siteConfig.name,
      locale: ogLocales[input.locale],
      alternateLocale: others,
      type: input.type ?? "website",
      ...(input.type === "article" && {
        publishedTime: input.publishedTime,
        modifiedTime: input.modifiedTime ?? input.publishedTime,
        authors: [siteConfig.author],
        tags: input.tags,
      }),
    },
    twitter: { card: "summary_large_image", title: input.title, description: input.description },
  };
}
