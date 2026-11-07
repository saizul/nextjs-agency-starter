import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";

export type LocaleParams = { params: Promise<{ locale: string }> };

/** Resolve the `[locale]` param or render the 404 page. */
export async function resolveLocale(params: Promise<{ locale: string }>): Promise<Locale> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return locale;
}
