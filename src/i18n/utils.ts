import { defaultLocale, isLocale, locales, type Locale } from "./config";

/** Normalise a path to start with "/" and have no trailing slash (except root). */
export function normalizePath(path: string): string {
  const withSlash = path.startsWith("/") ? path : `/${path}`;
  const clean = withSlash.replace(/\/{2,}/g, "/");
  return clean.length > 1 ? clean.replace(/\/$/, "") : clean;
}

/** Build a locale-prefixed path. `localizePath("bn", "/blog")` -> `/bn/blog`. */
export function localizePath(locale: Locale, path = "/"): string {
  const normalized = normalizePath(path);
  return normalized === "/" ? `/${locale}` : `/${locale}${normalized}`;
}

/** Split a pathname into its locale (if any) and the remaining path. */
export function splitLocale(pathname: string): { locale: Locale | null; path: string } {
  const normalized = normalizePath(pathname);
  const [, first = "", ...rest] = normalized.split("/");
  if (isLocale(first)) {
    return { locale: first, path: rest.length ? `/${rest.join("/")}` : "/" };
  }
  return { locale: null, path: normalized };
}

/**
 * Pick the best supported locale from an Accept-Language header.
 * Honors q-values and region subtags ("bn-BD" -> "bn").
 */
export function negotiateLocale(acceptLanguage: string | null | undefined): Locale {
  if (!acceptLanguage) return defaultLocale;
  const ranked = acceptLanguage
    .split(",")
    .map((part, index) => {
      const [tag = "", ...params] = part.trim().split(";");
      const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
      const quality = q ? Number.parseFloat(q.slice(2)) : 1;
      return { tag: tag.toLowerCase(), quality: Number.isNaN(quality) ? 0 : quality, index };
    })
    .filter((entry) => entry.tag && entry.quality > 0)
    .sort((a, b) => b.quality - a.quality || a.index - b.index);

  for (const { tag } of ranked) {
    const base = tag.split("-")[0];
    if (isLocale(base)) return base;
  }
  return defaultLocale;
}

export interface AlternateLinks {
  canonical: string;
  languages: Record<string, string>;
}

/**
 * Canonical + hreflang alternates for a locale-agnostic path.
 * Includes `x-default` pointing at the default locale.
 */
export function buildAlternates(
  siteUrl: string,
  locale: Locale,
  path: string,
  availableLocales: readonly Locale[] = locales,
): AlternateLinks {
  const base = siteUrl.replace(/\/$/, "");
  const languages: Record<string, string> = {};
  for (const l of availableLocales) {
    languages[l] = `${base}${localizePath(l, path)}`;
  }
  const fallback = availableLocales.includes(defaultLocale) ? defaultLocale : availableLocales[0];
  if (fallback) languages["x-default"] = `${base}${localizePath(fallback, path)}`;
  return { canonical: `${base}${localizePath(locale, path)}`, languages };
}

export function formatDate(locale: Locale, isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  return new Intl.DateTimeFormat(locale === "bn" ? "bn-BD" : "en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/** Replace `{name}` placeholders in a dictionary string. */
export function interpolate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}
