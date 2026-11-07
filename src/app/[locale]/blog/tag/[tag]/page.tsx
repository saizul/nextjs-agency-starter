import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { PostCard } from "@/components/cards";
import { Container, Section, SectionHeading } from "@/components/ui";
import { locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { interpolate, localizePath } from "@/i18n/utils";
import { getPosts, getPostsByTag } from "@/lib/content";
import { buildMetadata } from "@/lib/metadata";
import { resolveLocale } from "@/lib/page";
import { collectTags } from "@/lib/tags";

type Props = { params: Promise<{ locale: string; tag: string }> };

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    collectTags(getPosts(locale).map((p) => p.data.tags)).map((t) => ({ locale, tag: t.slug })),
  );
}

async function load({ params }: Props) {
  const { locale: rawLocale, tag: rawTag } = await params;
  const locale = await resolveLocale(Promise.resolve({ locale: rawLocale }));
  const tag = decodeURIComponent(rawTag);
  const posts = getPostsByTag(locale, tag);
  if (posts.length === 0) notFound();
  const label = collectTags(posts.map((p) => p.data.tags)).find((t) => t.slug === tag)?.tag ?? tag;
  return { locale, tag, label, posts, dict: getDictionary(locale) };
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale, tag, label, dict } = await load(props);
  return buildMetadata({
    locale,
    path: `/blog/tag/${tag}`,
    title: interpolate(dict.blog.tagTitle, { tag: label }),
    description: interpolate(dict.blog.tagDescription, { tag: label }),
    availableLocales: [locale],
  });
}

export default async function TagPage(props: Props) {
  const { locale, tag, label, posts, dict } = await load(props);
  return (
    <Section>
      <Container>
        <Breadcrumbs
          label={dict.nav.breadcrumb}
          items={[
            { name: dict.nav.home, path: localizePath(locale, "/") },
            { name: dict.blog.title, path: localizePath(locale, "/blog") },
            { name: label, path: localizePath(locale, `/blog/tag/${tag}`) },
          ]}
        />
        <SectionHeading level={1} title={interpolate(dict.blog.tagTitle, { tag: label })} />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.slug} locale={locale} post={post} dict={dict} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
