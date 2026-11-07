import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CtaBand } from "@/components/home-sections";
import { JsonLd } from "@/components/json-ld";
import { Mdx } from "@/components/mdx";
import { Container, Section } from "@/components/ui";
import { locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { formatDate, interpolate, localizePath } from "@/i18n/utils";
import { buildAvailability } from "@/lib/availability";
import { getPost, getPosts } from "@/lib/content";
import { articleJsonLd } from "@/lib/jsonld";
import { buildMetadata } from "@/lib/metadata";
import { resolveLocale } from "@/lib/page";
import { absoluteUrl, siteConfig } from "@/lib/site";
import { slugifyTag } from "@/lib/tags";

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return locales.flatMap((locale) => getPosts(locale).map((post) => ({ locale, slug: post.slug })));
}

async function load({ params }: Props) {
  const { locale: rawLocale, slug } = await params;
  const locale = await resolveLocale(Promise.resolve({ locale: rawLocale }));
  const post = getPost(locale, slug);
  if (!post) notFound();
  return { locale, post, dict: getDictionary(locale) };
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale, post } = await load(props);
  const path = `/blog/${post.slug}`;
  return buildMetadata({
    locale,
    path,
    title: post.data.title,
    description: post.data.description,
    type: "article",
    publishedTime: post.data.date,
    modifiedTime: post.data.updated,
    tags: post.data.tags,
    availableLocales: buildAvailability()[path],
  });
}

export default async function BlogPostPage(props: Props) {
  const { locale, post, dict } = await load(props);
  const { data } = post;
  const path = localizePath(locale, `/blog/${post.slug}`);

  return (
    <>
      <Section>
        <Container>
          <Breadcrumbs
            label={dict.nav.breadcrumb}
            items={[
              { name: dict.nav.home, path: localizePath(locale, "/") },
              { name: dict.blog.title, path: localizePath(locale, "/blog") },
              { name: data.title, path },
            ]}
          />
          <article>
            <header className="max-w-3xl">
              <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl">
                {data.title}
              </h1>
              <p className="mt-4 text-lg text-muted">{data.description}</p>
              <p className="mt-4 text-sm text-muted">
                {interpolate(dict.blog.by, { author: data.author })} {" · "}
                <time dateTime={data.date}>{formatDate(locale, data.date)}</time>
                {" · "}
                {interpolate(dict.common.minRead, { min: post.readingMinutes })}
              </p>
              <ul className="mt-4 flex flex-wrap gap-2" aria-label={dict.common.tags}>
                {data.tags.map((tag) => (
                  <li key={tag}>
                    <Link
                      href={localizePath(locale, `/blog/tag/${slugifyTag(tag)}`)}
                      className="rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-semibold text-brand hover:underline"
                    >
                      {tag}
                    </Link>
                  </li>
                ))}
              </ul>
            </header>
            <div className="mt-10">
              <Mdx source={post.body} />
            </div>
          </article>
          <p className="mt-12">
            <Link
              href={localizePath(locale, "/blog")}
              className="font-semibold text-brand underline underline-offset-4"
            >
              {dict.blog.allPosts}
            </Link>
          </p>
        </Container>
      </Section>
      <CtaBand locale={locale} dict={dict} />
      <JsonLd
        data={articleJsonLd({
          title: data.title,
          description: data.description,
          url: absoluteUrl(path),
          image: absoluteUrl(`${path}/opengraph-image`),
          datePublished: data.date,
          dateModified: data.updated,
          author: data.author,
          authorUrl: siteConfig.authorUrl,
          publisher: { name: siteConfig.name, logo: absoluteUrl("/logo.svg") },
          inLanguage: locale,
          keywords: data.tags,
        })}
      />
    </>
  );
}
