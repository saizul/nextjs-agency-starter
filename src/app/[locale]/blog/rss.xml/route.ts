import { locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { localizePath } from "@/i18n/utils";
import { getPosts } from "@/lib/content";
import { buildRss } from "@/lib/feed";
import { absoluteUrl } from "@/lib/site";
import { isLocale } from "@/i18n/config";

export const dynamic = "force-static";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return new Response("Not found", { status: 404 });
  const dict = getDictionary(locale);
  const xml = buildRss({
    title: `${dict.meta.siteName} ${dict.blog.title}`,
    description: dict.blog.metaDescription,
    siteUrl: absoluteUrl(localizePath(locale, "/blog")),
    feedUrl: absoluteUrl(localizePath(locale, "/blog/rss.xml")),
    language: locale,
    items: getPosts(locale).map((post) => ({
      title: post.data.title,
      description: post.data.description,
      url: absoluteUrl(localizePath(locale, `/blog/${post.slug}`)),
      date: post.data.date,
      tags: post.data.tags,
    })),
  });
  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
