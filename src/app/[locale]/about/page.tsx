import type { Metadata } from "next";
import Image from "next/image";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CtaBand } from "@/components/home-sections";
import { Card, Container, Section, SectionHeading } from "@/components/ui";
import { getDictionary } from "@/i18n/dictionaries";
import { interpolate, localizePath } from "@/i18n/utils";
import { buildMetadata } from "@/lib/metadata";
import { resolveLocale, type LocaleParams } from "@/lib/page";
import { siteConfig } from "@/lib/site";

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);
  return buildMetadata({
    locale,
    path: "/about",
    title: dict.about.title,
    description: dict.about.metaDescription,
  });
}

export default async function AboutPage({ params }: LocaleParams) {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);
  const { about } = dict;
  return (
    <>
      <Section>
        <Container>
          <Breadcrumbs
            label={dict.nav.breadcrumb}
            items={[
              { name: dict.nav.home, path: localizePath(locale, "/") },
              { name: about.title, path: localizePath(locale, "/about") },
            ]}
          />
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <SectionHeading level={1} title={about.title} intro={about.intro} />
              <div className="space-y-4 text-lg">
                {about.story.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              <p className="mt-6 text-sm text-muted">
                {interpolate(about.templateBy, { author: siteConfig.author })}
              </p>
            </div>
            <Image
              src="/images/about.svg"
              alt=""
              width={480}
              height={360}
              unoptimized
              className="mx-auto w-full max-w-md rounded-3xl"
            />
          </div>
        </Container>
      </Section>
      <Section tone="soft" aria-labelledby="values-title">
        <Container>
          <h2 id="values-title" className="mb-8 text-3xl font-bold">
            {about.valuesTitle}
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {about.values.map((value) => (
              <Card key={value.title}>
                <h3 className="text-lg font-semibold">{value.title}</h3>
                <p className="mt-2 text-muted">{value.body}</p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>
      <CtaBand locale={locale} dict={dict} />
    </>
  );
}
