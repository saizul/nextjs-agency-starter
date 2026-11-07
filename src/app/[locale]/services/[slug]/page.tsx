import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ServiceCard } from "@/components/cards";
import { CtaBand, FaqList } from "@/components/home-sections";
import { CheckIcon, ServiceIcon } from "@/components/icons";
import { JsonLd } from "@/components/json-ld";
import { ButtonLink, Container, Section } from "@/components/ui";
import { locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { localizePath } from "@/i18n/utils";
import { faqJsonLd, serviceJsonLd } from "@/lib/jsonld";
import { buildMetadata } from "@/lib/metadata";
import { resolveLocale } from "@/lib/page";
import { absoluteUrl, siteConfig } from "@/lib/site";

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    getDictionary(locale).services.items.map((service) => ({ locale, slug: service.slug })),
  );
}

async function load({ params }: Props) {
  const { locale: rawLocale, slug } = await params;
  const locale = await resolveLocale(Promise.resolve({ locale: rawLocale }));
  const dict = getDictionary(locale);
  const service = dict.services.items.find((item) => item.slug === slug);
  if (!service) notFound();
  return { locale, dict, service };
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale, service } = await load(props);
  return buildMetadata({
    locale,
    path: `/services/${service.slug}`,
    title: service.name,
    description: service.summary,
  });
}

export default async function ServicePage(props: Props) {
  const { locale, dict, service } = await load(props);
  const path = `/services/${service.slug}`;
  const others = dict.services.items.filter((item) => item.slug !== service.slug);

  return (
    <>
      <Section>
        <Container>
          <Breadcrumbs
            label={dict.nav.breadcrumb}
            items={[
              { name: dict.nav.home, path: localizePath(locale, "/") },
              { name: dict.services.title, path: localizePath(locale, "/services") },
              { name: service.name, path: localizePath(locale, path) },
            ]}
          />
          <div className="grid gap-12 lg:grid-cols-[2fr_1fr]">
            <div>
              <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                <ServiceIcon name={service.icon} width={28} height={28} />
              </span>
              <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl">
                {service.name}
              </h1>
              <p className="mt-5 max-w-2xl text-lg text-muted">{service.description}</p>
              <div className="mt-8">
                <ButtonLink href={localizePath(locale, "/contact")} arrow>
                  {dict.common.startProject}
                </ButtonLink>
              </div>

              <h2 className="mt-14 text-2xl font-bold">{dict.common.faq}</h2>
              <div className="mt-6">
                <FaqList items={service.faq} />
              </div>
            </div>
            <aside
              className="h-fit rounded-2xl border border-line bg-bg-soft p-6"
              aria-labelledby="deliverables-title"
            >
              <h2 id="deliverables-title" className="text-lg font-semibold">
                {dict.common.deliverables}
              </h2>
              <ul className="mt-4 space-y-3">
                {service.deliverables.map((item) => (
                  <li key={item} className="flex gap-2">
                    <CheckIcon className="mt-0.5 shrink-0 text-brand" width={20} height={20} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </Container>
      </Section>

      <Section tone="soft" aria-labelledby="related-title">
        <Container>
          <h2 id="related-title" className="mb-6 text-2xl font-bold">
            {dict.common.related}
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {others.map((item) => (
              <ServiceCard
                key={item.slug}
                locale={locale}
                service={item}
                learnMore={dict.common.learnMore}
              />
            ))}
          </div>
          <p className="mt-6">
            <Link
              href={localizePath(locale, "/services")}
              className="font-semibold text-brand underline underline-offset-4"
            >
              {dict.services.title}
            </Link>
          </p>
        </Container>
      </Section>
      <CtaBand locale={locale} dict={dict} />

      <JsonLd
        data={[
          serviceJsonLd({
            name: service.name,
            description: service.description,
            url: absoluteUrl(localizePath(locale, path)),
            provider: { name: siteConfig.name, url: absoluteUrl("/") },
            serviceType: service.name,
          }),
          faqJsonLd(service.faq),
        ]}
      />
    </>
  );
}
