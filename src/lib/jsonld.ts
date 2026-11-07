import { absoluteUrl } from "./site";

type JsonLd = Record<string, unknown>;

export interface BreadcrumbItem {
  name: string;
  /** Path (e.g. `/en/blog`) or absolute URL. */
  path: string;
}

const withContext = (data: JsonLd): JsonLd => ({ "@context": "https://schema.org", ...data });

const toUrl = (value: string, siteUrl?: string) =>
  /^https?:\/\//.test(value) ? value : absoluteUrl(value, siteUrl);

export function organizationJsonLd(input: {
  name: string;
  url: string;
  logo: string;
  description?: string;
  email?: string;
  sameAs?: string[];
}): JsonLd {
  return withContext({
    "@type": "Organization",
    name: input.name,
    url: input.url,
    logo: input.logo,
    ...(input.description && { description: input.description }),
    ...(input.email && { email: input.email }),
    ...(input.sameAs?.length && { sameAs: input.sameAs }),
  });
}

export function websiteJsonLd(input: {
  name: string;
  url: string;
  inLanguage: string;
  description?: string;
}): JsonLd {
  return withContext({
    "@type": "WebSite",
    name: input.name,
    url: input.url,
    inLanguage: input.inLanguage,
    ...(input.description && { description: input.description }),
  });
}

export function breadcrumbJsonLd(items: BreadcrumbItem[], siteUrl?: string): JsonLd {
  return withContext({
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: toUrl(item.path, siteUrl),
    })),
  });
}

export function articleJsonLd(input: {
  title: string;
  description: string;
  url: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  author: string;
  authorUrl?: string;
  publisher: { name: string; logo: string };
  inLanguage: string;
  keywords?: string[];
}): JsonLd {
  return withContext({
    "@type": "Article",
    headline: input.title,
    description: input.description,
    mainEntityOfPage: { "@type": "WebPage", "@id": input.url },
    image: [input.image],
    datePublished: input.datePublished,
    dateModified: input.dateModified ?? input.datePublished,
    inLanguage: input.inLanguage,
    author: {
      "@type": "Person",
      name: input.author,
      ...(input.authorUrl && { url: input.authorUrl }),
    },
    publisher: {
      "@type": "Organization",
      name: input.publisher.name,
      logo: { "@type": "ImageObject", url: input.publisher.logo },
    },
    ...(input.keywords?.length && { keywords: input.keywords.join(", ") }),
  });
}

export function faqJsonLd(items: { q: string; a: string }[]): JsonLd {
  return withContext({
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  });
}

export function serviceJsonLd(input: {
  name: string;
  description: string;
  url: string;
  provider: { name: string; url: string };
  serviceType?: string;
  areaServed?: string;
}): JsonLd {
  return withContext({
    "@type": "Service",
    name: input.name,
    description: input.description,
    url: input.url,
    ...(input.serviceType && { serviceType: input.serviceType }),
    ...(input.areaServed && { areaServed: input.areaServed }),
    provider: { "@type": "Organization", name: input.provider.name, url: input.provider.url },
  });
}

/** Serialise for an inline <script>; escapes characters that could close the tag. */
export function serializeJsonLd(data: JsonLd | JsonLd[]): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(new RegExp(String.fromCharCode(0x2028), "g"), "\\u2028")
    .replace(new RegExp(String.fromCharCode(0x2029), "g"), "\\u2029");
}
