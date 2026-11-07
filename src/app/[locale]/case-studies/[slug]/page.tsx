import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CtaBand } from "@/components/home-sections";
import { Mdx } from "@/components/mdx";
import { Badge, Container, Section } from "@/components/ui";
import { locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { localizePath } from "@/i18n/utils";
import { buildAvailability } from "@/lib/availability";
import { getCaseStudies, getCaseStudy } from "@/lib/content";
import { buildMetadata } from "@/lib/metadata";
import { resolveLocale } from "@/lib/page";

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    getCaseStudies(locale).map((study) => ({ locale, slug: study.slug })),
  );
}

async function load({ params }: Props) {
  const { locale: rawLocale, slug } = await params;
  const locale = await resolveLocale(Promise.resolve({ locale: rawLocale }));
  const study = getCaseStudy(locale, slug);
  if (!study) notFound();
  return { locale, study, dict: getDictionary(locale) };
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale, study } = await load(props);
  const path = `/case-studies/${study.slug}`;
  return buildMetadata({
    locale,
    path,
    title: study.data.title,
    description: study.data.summary,
    availableLocales: buildAvailability()[path],
  });
}

export default async function CaseStudyPage(props: Props) {
  const { locale, study, dict } = await load(props);
  const { data } = study;

  return (
    <>
      <Section>
        <Container>
          <Breadcrumbs
            label={dict.nav.breadcrumb}
            items={[
              { name: dict.nav.home, path: localizePath(locale, "/") },
              { name: dict.caseStudies.title, path: localizePath(locale, "/case-studies") },
              { name: data.title, path: localizePath(locale, `/case-studies/${study.slug}`) },
            ]}
          />
          <div className="flex flex-wrap gap-2">
            <Badge>{data.industry}</Badge>
            <Badge>{dict.common.sampleBadge}</Badge>
          </div>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            {data.title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">{data.summary}</p>

          <Image
            src={data.cover}
            alt=""
            width={640}
            height={360}
            unoptimized
            priority
            className="mt-10 aspect-video w-full max-w-4xl rounded-2xl object-cover"
          />

          <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_320px]">
            <div>
              <Mdx source={study.body} />
              <p className="mt-10 text-sm text-muted">{dict.caseStudies.sampleNote}</p>
            </div>
            <aside className="h-fit space-y-6 rounded-2xl border border-line bg-bg-soft p-6">
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-muted">{dict.common.client}</dt>
                  <dd className="font-semibold">{data.client}</dd>
                </div>
                {data.duration && (
                  <div>
                    <dt className="text-muted">{dict.common.duration}</dt>
                    <dd className="font-semibold">{data.duration}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-muted">{dict.nav.services}</dt>
                  <dd className="font-semibold">{data.services.join(", ")}</dd>
                </div>
              </dl>
              {data.results.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold">{dict.common.results}</h2>
                  <dl className="mt-3 space-y-3">
                    {data.results.map((result) => (
                      <div key={result.label}>
                        <dd className="text-2xl font-bold text-brand">{result.value}</dd>
                        <dt className="text-sm text-muted">{result.label}</dt>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </aside>
          </div>
          <p className="mt-10">
            <Link
              href={localizePath(locale, "/case-studies")}
              className="font-semibold text-brand underline underline-offset-4"
            >
              {dict.caseStudies.backToAll}
            </Link>
          </p>
        </Container>
      </Section>
      <CtaBand locale={locale} dict={dict} />
    </>
  );
}
