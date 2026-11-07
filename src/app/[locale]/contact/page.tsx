import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ContactForm } from "@/components/contact-form";
import { Container, Section, SectionHeading } from "@/components/ui";
import { getDictionary } from "@/i18n/dictionaries";
import { localizePath } from "@/i18n/utils";
import { buildMetadata } from "@/lib/metadata";
import { resolveLocale, type LocaleParams } from "@/lib/page";
import { siteConfig } from "@/lib/site";

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);
  return buildMetadata({
    locale,
    path: "/contact",
    title: dict.contact.title,
    description: dict.contact.metaDescription,
  });
}

export default async function ContactPage({ params }: LocaleParams) {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);
  return (
    <Section>
      <Container>
        <Breadcrumbs
          label={dict.nav.breadcrumb}
          items={[
            { name: dict.nav.home, path: localizePath(locale, "/") },
            { name: dict.contact.title, path: localizePath(locale, "/contact") },
          ]}
        />
        <div className="grid gap-12 lg:grid-cols-[1fr_320px]">
          <div>
            <SectionHeading level={1} title={dict.contact.title} intro={dict.contact.intro} />
            <ContactForm locale={locale} dict={dict} />
          </div>
          <aside className="h-fit rounded-2xl border border-line bg-bg-soft p-6">
            <p className="text-sm text-muted">{dict.contact.emailLabel}</p>
            <p className="mt-1 font-semibold">
              <a
                className="text-brand underline underline-offset-4"
                href={`mailto:${siteConfig.email}`}
              >
                {siteConfig.email}
              </a>
            </p>
            <p className="mt-4 text-sm text-muted">{dict.contact.responseNote}</p>
          </aside>
        </div>
      </Container>
    </Section>
  );
}
