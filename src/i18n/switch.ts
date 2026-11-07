import type { Locale } from "./config";
import { localizePath } from "./utils";

/** Map of locale-agnostic detail paths (e.g. `/blog/my-post`) to the locales that have them. */
export type Availability = Record<string, Locale[]>;

function parentOf(path: string): string {
  const parts = path.split("/").filter(Boolean);
  return parts.length <= 1 ? "/" : `/${parts[0]}`;
}

/**
 * Where should the language switcher send the visitor?
 * Same page when it exists in the target language, otherwise the section index.
 */
export function resolveSwitchPath(
  path: string,
  target: Locale,
  availability: Availability,
): string {
  const known = availability[path];
  if (known) {
    return localizePath(target, known.includes(target) ? path : parentOf(path));
  }
  // Paginated and tag listings differ between languages.
  if (/^\/blog\/(page|tag)\//.test(path)) return localizePath(target, "/blog");
  return localizePath(target, path);
}
