import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { interpolate, localizePath } from "@/i18n/utils";
import { siteConfig } from "@/lib/site";
import { Container } from "./ui";

export function SiteFooter({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const links = [
    { href: "/services", label: dict.nav.services },
    { href: "/case-studies", label: dict.nav.caseStudies },
    { href: "/blog", label: dict.nav.blog },
  ];
  const company = [
    { href: "/about", label: dict.nav.about },
    { href: "/contact", label: dict.nav.contact },
  ];

  return (
    <footer className="border-t border-line bg-bg-soft py-12">
      <Container>
        <div className="grid gap-10 md:grid-cols-[2fr_1fr_1fr]">
          <div>
            <p className="text-lg font-bold">{dict.meta.siteName}</p>
            <p className="mt-3 max-w-sm text-muted">{dict.footer.blurb}</p>
            <p className="mt-3">
              <a
                className="font-medium text-brand underline underline-offset-4"
                href={`mailto:${siteConfig.email}`}
              >
                {siteConfig.email}
              </a>
            </p>
          </div>
          <nav aria-label={`${dict.nav.footerNav}: ${dict.footer.explore}`}>
            <p className="font-semibold">{dict.footer.explore}</p>
            <ul className="mt-3 space-y-2">
              {links.map((l) => (
                <li key={l.href}>
                  <Link className="text-muted hover:text-fg" href={localizePath(locale, l.href)}>
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  className="text-muted hover:text-fg"
                  href={localizePath(locale, "/blog/rss.xml")}
                >
                  {dict.blog.rss}
                </a>
              </li>
            </ul>
          </nav>
          <nav aria-label={`${dict.nav.footerNav}: ${dict.footer.company}`}>
            <p className="font-semibold">{dict.footer.company}</p>
            <ul className="mt-3 space-y-2">
              {company.map((l) => (
                <li key={l.href}>
                  <Link className="text-muted hover:text-fg" href={localizePath(locale, l.href)}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-line pt-6 text-sm text-muted sm:flex-row sm:justify-between">
          <p>{interpolate(dict.footer.copyright, { year: new Date().getFullYear() })}</p>
          <p>
            {interpolate(dict.footer.builtWith, { author: siteConfig.author })}{" "}
            <a className="underline underline-offset-4" href={siteConfig.authorUrl}>
              saizul.com
            </a>
          </p>
        </div>
      </Container>
    </footer>
  );
}
