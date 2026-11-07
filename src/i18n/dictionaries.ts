import en from "@/dictionaries/en.json";
import bn from "@/dictionaries/bn.json";
import type { Locale } from "./config";

export type Dictionary = typeof en;

// Typing `bn` as Dictionary makes the compiler fail if a key is missing.
const dictionaries: Record<Locale, Dictionary> = { en, bn };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

/** Recursively list the dotted key paths of an object (used by tests). */
export function flattenKeys(value: unknown, prefix = ""): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item, i) => flattenKeys(item, `${prefix}[${i}]`));
  }
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, child]) =>
      flattenKeys(child, prefix ? `${prefix}.${key}` : key),
    );
  }
  return [prefix];
}
