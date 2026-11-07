"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { localeNames, locales, type Locale } from "@/i18n/config";
import { resolveSwitchPath, type Availability } from "@/i18n/switch";
import { splitLocale } from "@/i18n/utils";
import { GlobeIcon } from "./icons";

export function LocaleSwitcher({
  current,
  label,
  availability,
}: {
  current: Locale;
  label: string;
  availability: Availability;
}) {
  const pathname = usePathname();
  const { path } = splitLocale(pathname);
  const others = locales.filter((l) => l !== current);

  return (
    <div className="flex items-center gap-1" role="group" aria-label={label}>
      <GlobeIcon width={18} height={18} className="text-muted" />
      {others.map((locale) => (
        <Link
          key={locale}
          href={resolveSwitchPath(path, locale, availability)}
          hrefLang={locale}
          lang={locale}
          className="rounded-full px-2.5 py-1.5 text-sm font-medium text-fg hover:bg-bg-soft"
        >
          {localeNames[locale]}
        </Link>
      ))}
    </div>
  );
}
