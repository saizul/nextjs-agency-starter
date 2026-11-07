import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ServiceCard } from "@/components/cards";
import { CtaBand } from "@/components/home-sections";
import { Container, Section, SectionHeading } from "@/components/ui";
import { getDictionary } from "@/i18n/dictionaries";
import { localizePath } from "@/i18n/utils";
import { buildMetadata } from "@/lib/metadata";
import { resolveLocale, type LocaleParams } from "@/lib/page";

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);
  return buildMetadata({
    locale,
    path: "/services",
    title: dict.services.title,
    description: dict.services.metaDescription,
  });
}

export default async function ServicesPage({ params }: LocaleParams) {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);
  return (
    <>
      <Section>
        <Container>
          <Breadcrumbs
            label={dict.nav.breadcrumb}
            items={[
              { name: dict.nav.home, path: localizePath(locale, "/") },
              { name: dict.services.title, path: localizePath(locale, "/services") },
            ]}
          />
          <SectionHeading level={1} title={dict.services.title} intro={dict.services.intro} />
          <div className="grid gap-6 sm:grid-cols-2">
            {dict.services.items.map((service) => (
              <ServiceCard
                key={service.slug}
                locale={locale}
                service={service}
                learnMore={dict.common.learnMore}
              />
            ))}
          </div>
        </Container>
      </Section>
      <CtaBand locale={locale} dict={dict} />
    </>
  );
}
