import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CaseCard } from "@/components/cards";
import { Container, Section, SectionHeading } from "@/components/ui";
import { getDictionary } from "@/i18n/dictionaries";
import { localizePath } from "@/i18n/utils";
import { getCaseStudies } from "@/lib/content";
import { buildMetadata } from "@/lib/metadata";
import { resolveLocale, type LocaleParams } from "@/lib/page";

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);
  return buildMetadata({
    locale,
    path: "/case-studies",
    title: dict.caseStudies.title,
    description: dict.caseStudies.metaDescription,
  });
}

export default async function CaseStudiesPage({ params }: LocaleParams) {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);
  const studies = getCaseStudies(locale);
  return (
    <Section>
      <Container>
        <Breadcrumbs
          label={dict.nav.breadcrumb}
          items={[
            { name: dict.nav.home, path: localizePath(locale, "/") },
            { name: dict.caseStudies.title, path: localizePath(locale, "/case-studies") },
          ]}
        />
        <SectionHeading level={1} title={dict.caseStudies.title} intro={dict.caseStudies.intro} />
        {studies.length === 0 ? (
          <p className="text-muted">{dict.caseStudies.empty}</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {studies.map((study) => (
              <CaseCard key={study.slug} locale={locale} study={study} dict={dict} />
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}
