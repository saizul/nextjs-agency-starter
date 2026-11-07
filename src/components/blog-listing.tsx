import type { Metadata } from "next";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { interpolate, localizePath } from "@/i18n/utils";
import { getPosts, POSTS_PER_PAGE } from "@/lib/content";
import { buildMetadata } from "@/lib/metadata";
import { paginate } from "@/lib/pagination";
import { absoluteUrl } from "@/lib/site";
import { collectTags } from "@/lib/tags";
import { Breadcrumbs } from "./breadcrumbs";
import { PostCard } from "./cards";
import { Pagination } from "./pagination";
import { Container, Section, SectionHeading } from "./ui";

const blogPagePath = (page: number) => (page <= 1 ? "/blog" : `/blog/page/${page}`);

export function blogMetadata(locale: Locale, page: number): Metadata {
  const dict = getDictionary(locale);
  const title =
    page > 1
      ? `${dict.blog.title}: ${interpolate(dict.common.pageOf, { page, total: paginate(getPosts(locale), page, POSTS_PER_PAGE).totalPages })}`
      : dict.blog.title;
  return buildMetadata({
    locale,
    path: blogPagePath(page),
    title,
    description: dict.blog.metaDescription,
    feeds: { "application/rss+xml": absoluteUrl(localizePath(locale, "/blog/rss.xml")) },
  });
}

export function BlogListing({ locale, page }: { locale: Locale; page: number }) {
  const dict = getDictionary(locale);
  const all = getPosts(locale);
  const current = paginate(all, page, POSTS_PER_PAGE);
  const tags = collectTags(all.map((p) => p.data.tags));

  return (
    <Section>
      <Container>
        <Breadcrumbs
          label={dict.nav.breadcrumb}
          items={[
            { name: dict.nav.home, path: localizePath(locale, "/") },
            { name: dict.blog.title, path: localizePath(locale, blogPagePath(page)) },
          ]}
        />
        <SectionHeading level={1} title={dict.blog.title} intro={dict.blog.intro} />

        {tags.length > 0 && (
          <nav aria-label={dict.blog.browseTags} className="-mt-4 mb-10">
            <ul className="flex flex-wrap gap-2">
              {tags.map((t) => (
                <li key={t.slug}>
                  <Link
                    href={localizePath(locale, `/blog/tag/${t.slug}`)}
                    className="inline-block rounded-full border border-line px-3 py-1 text-sm hover:bg-bg-soft"
                  >
                    {t.tag} <span className="text-muted">({t.count})</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {current.items.length === 0 ? (
          <p className="text-muted">{dict.blog.empty}</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {current.items.map((post) => (
              <PostCard key={post.slug} locale={locale} post={post} dict={dict} />
            ))}
          </div>
        )}

        <Pagination
          page={current.page}
          totalPages={current.totalPages}
          hrefFor={(n) => localizePath(locale, blogPagePath(n))}
          labels={{
            nav: dict.common.pagination,
            newer: dict.common.newer,
            older: dict.common.older,
            pageOf: dict.common.pageOf,
          }}
        />
        <p className="mt-8 text-sm">
          <a
            className="text-brand underline underline-offset-4"
            href={localizePath(locale, "/blog/rss.xml")}
          >
            {dict.blog.rss}
          </a>
        </p>
      </Container>
    </Section>
  );
}
