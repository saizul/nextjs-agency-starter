import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Availability } from "@/i18n/switch";
import { localizePath } from "@/i18n/utils";
import { LocaleSwitcher } from "./locale-switcher";
import { Navigation } from "./navigation";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader({
  locale,
  dict,
  availability,
}: {
  locale: Locale;
  dict: Dictionary;
  availability: Availability;
}) {
  const homeHref = localizePath(locale, "/");
  const items = [
    { href: localizePath(locale, "/services"), label: dict.nav.services },
    { href: localizePath(locale, "/case-studies"), label: dict.nav.caseStudies },
    { href: localizePath(locale, "/blog"), label: dict.nav.blog },
    { href: localizePath(locale, "/about"), label: dict.nav.about },
    { href: localizePath(locale, "/contact"), label: dict.nav.contact },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur">
      <div className="relative mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href={homeHref} className="flex items-center gap-2 text-lg font-bold">
          <Image src="/logo.svg" alt="" width={32} height={32} unoptimized priority />
          <span>{dict.meta.siteName}</span>
        </Link>
        <div className="flex items-center gap-2">
          <Navigation
            items={items}
            homeHref={homeHref}
            labels={{ primary: dict.nav.primary, menu: dict.nav.menu, close: dict.nav.closeMenu }}
          />
          <LocaleSwitcher
            current={locale}
            label={dict.nav.switchLanguage}
            availability={availability}
          />
          <ThemeToggle label={dict.nav.toggleTheme} />
        </div>
      </div>
    </header>
  );
}
