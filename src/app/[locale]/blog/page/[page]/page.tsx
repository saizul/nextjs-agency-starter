import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { BlogListing, blogMetadata } from "@/components/blog-listing";
import { locales } from "@/i18n/config";
import { localizePath } from "@/i18n/utils";
import { getPosts, POSTS_PER_PAGE } from "@/lib/content";
import { parsePageParam, totalPagesFor } from "@/lib/pagination";
import { resolveLocale } from "@/lib/page";

type Props = { params: Promise<{ locale: string; page: string }> };

export function generateStaticParams() {
  // Page 1 lives at /blog, so only pages 2+ are generated here.
  return locales.flatMap((locale) => {
    const total = totalPagesFor(getPosts(locale).length, POSTS_PER_PAGE);
    return Array.from({ length: Math.max(0, total - 1) }, (_, i) => ({
      locale,
      page: String(i + 2),
    }));
  });
}

async function load({ params }: Props) {
  const { locale: rawLocale, page: rawPage } = await params;
  const locale = await resolveLocale(Promise.resolve({ locale: rawLocale }));
  const page = parsePageParam(rawPage);
  if (page === null) notFound();
  if (page === 1) redirect(localizePath(locale, "/blog"));
  if (page > totalPagesFor(getPosts(locale).length, POSTS_PER_PAGE)) notFound();
  return { locale, page };
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale, page } = await load(props);
  return blogMetadata(locale, page);
}

export default async function BlogPageN(props: Props) {
  const { locale, page } = await load(props);
  return <BlogListing locale={locale} page={page} />;
}
