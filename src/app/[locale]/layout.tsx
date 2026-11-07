import type { Metadata, Viewport } from "next";
import { Hind_Siliguri, Inter } from "next/font/google";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { JsonLd } from "@/components/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ThemeScript } from "@/components/theme-script";
import { isLocale, locales, ogLocales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { localizePath } from "@/i18n/utils";
import { buildAvailability } from "@/lib/availability";
import { organizationJsonLd, websiteJsonLd } from "@/lib/jsonld";
import { absoluteUrl, getSiteUrl, siteConfig } from "@/lib/site";
import "../globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-bangla",
  display: "swap",
});

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1020" },
  ],
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return {
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: `${dict.meta.siteName}: ${dict.meta.tagline}`,
      template: `%s | ${dict.meta.siteName}`,
    },
    description: dict.meta.description,
    applicationName: dict.meta.siteName,
    authors: [{ name: siteConfig.author, url: siteConfig.authorUrl }],
    icons: { icon: "/favicon.svg" },
    openGraph: { siteName: dict.meta.siteName, locale: ogLocales[locale], type: "website" },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const availability = buildAvailability();
  const homeUrl = absoluteUrl(localizePath(locale, "/"));

  return (
    <html
      lang={locale}
      className={locale === "bn" ? hindSiliguri.variable : inter.variable}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-brand-solid focus:px-4 focus:py-2 focus:text-white"
        >
          {dict.nav.skipToContent}
        </a>
        <SiteHeader locale={locale} dict={dict} availability={availability} />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <SiteFooter locale={locale} dict={dict} />
        <JsonLd
          data={[
            organizationJsonLd({
              name: siteConfig.name,
              url: absoluteUrl("/"),
              logo: absoluteUrl("/logo.svg"),
              description: dict.meta.description,
              email: siteConfig.email,
              sameAs: siteConfig.socials,
            }),
            websiteJsonLd({
              name: siteConfig.name,
              url: homeUrl,
              inLanguage: locale,
              description: dict.meta.description,
            }),
          ]}
        />
      </body>
    </html>
  );
}
