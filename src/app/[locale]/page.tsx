import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import {
  CasesSection,
  CtaBand,
  FaqSection,
  Hero,
  PricingSection,
  ProcessSection,
  ServicesSection,
  TestimonialsSection,
} from "@/components/home-sections";
import { getDictionary } from "@/i18n/dictionaries";
import { getCaseStudies } from "@/lib/content";
import { faqJsonLd } from "@/lib/jsonld";
import { buildMetadata } from "@/lib/metadata";
import { resolveLocale, type LocaleParams } from "@/lib/page";

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);
  return {
    ...buildMetadata({
      locale,
      path: "/",
      title: `${dict.meta.siteName}: ${dict.meta.tagline}`,
      description: dict.meta.description,
    }),
    title: { absolute: `${dict.meta.siteName}: ${dict.meta.tagline}` },
  };
}

export default async function HomePage({ params }: LocaleParams) {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);
  const studies = getCaseStudies(locale).slice(0, 3);

  return (
    <>
      <Hero locale={locale} dict={dict} />
      <ServicesSection locale={locale} dict={dict} />
      <ProcessSection dict={dict} />
      <CasesSection locale={locale} dict={dict} studies={studies} />
      <TestimonialsSection dict={dict} />
      <PricingSection locale={locale} dict={dict} />
      <FaqSection dict={dict} />
      <CtaBand locale={locale} dict={dict} />
      <JsonLd data={faqJsonLd(dict.home.faq.items)} />
    </>
  );
}
