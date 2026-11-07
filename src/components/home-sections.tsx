import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { localizePath } from "@/i18n/utils";
import type { CaseStudy } from "@/lib/content";
import { CaseCard, ServiceCard } from "./cards";
import { HeroIllustration } from "./hero-illustration";
import { CheckIcon } from "./icons";
import { ButtonLink, Badge, Card, Container, Section, SectionHeading, cx } from "./ui";

export function Hero({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const { hero } = dict.home;
  return (
    <Section className="overflow-hidden pt-12 sm:pt-20" aria-labelledby="hero-title">
      <Container className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <p className="mb-3 text-sm font-semibold tracking-wide text-brand uppercase">
            {hero.eyebrow}
          </p>
          <h1
            id="hero-title"
            className="text-4xl font-bold tracking-tight text-balance sm:text-5xl"
          >
            {hero.title}
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted">{hero.subtitle}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href={localizePath(locale, "/contact")} arrow>
              {hero.primaryCta}
            </ButtonLink>
            <ButtonLink href={localizePath(locale, "/case-studies")} variant="secondary">
              {hero.secondaryCta}
            </ButtonLink>
          </div>
          <dl className="mt-10 grid max-w-md grid-cols-3 gap-6">
            {hero.stats.map((stat) => (
              <div key={stat.label}>
                <dt className="sr-only">{stat.label}</dt>
                <dd className="text-2xl font-bold">{stat.value}</dd>
                <p className="mt-1 text-xs text-muted" aria-hidden="true">
                  {stat.label}
                </p>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-xs text-muted">{hero.statsNote}</p>
        </div>
        <HeroIllustration className="mx-auto w-full max-w-lg" />
      </Container>
    </Section>
  );
}

export function ServicesSection({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <Section tone="soft" aria-labelledby="services-title">
      <Container>
        <SectionHeading
          id="services-title"
          title={dict.home.services.title}
          intro={dict.home.services.intro}
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
  );
}

export function ProcessSection({ dict }: { dict: Dictionary }) {
  const { process } = dict.home;
  return (
    <Section aria-labelledby="process-title">
      <Container>
        <SectionHeading id="process-title" title={process.title} intro={process.intro} />
        <ol className="grid gap-6 md:grid-cols-4">
          {process.steps.map((step, index) => (
            <li key={step.title} className="relative rounded-2xl border border-line p-6">
              <span
                aria-hidden="true"
                className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-solid text-sm font-bold text-white"
              >
                {index + 1}
              </span>
              <h3 className="text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}

export function CasesSection({
  locale,
  dict,
  studies,
}: {
  locale: Locale;
  dict: Dictionary;
  studies: CaseStudy[];
}) {
  return (
    <Section tone="soft" aria-labelledby="cases-title">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            id="cases-title"
            title={dict.home.cases.title}
            intro={dict.home.cases.intro}
          />
          <ButtonLink
            href={localizePath(locale, "/case-studies")}
            variant="secondary"
            className="mb-10"
          >
            {dict.common.viewAll}
          </ButtonLink>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {studies.map((study) => (
            <CaseCard key={study.slug} locale={locale} study={study} dict={dict} />
          ))}
        </div>
      </Container>
    </Section>
  );
}

export function TestimonialsSection({ dict }: { dict: Dictionary }) {
  const t = dict.home.testimonials;
  return (
    <Section aria-labelledby="testimonials-title">
      <Container>
        <SectionHeading id="testimonials-title" title={t.title} intro={t.intro} />
        <p className="-mt-6 mb-8">
          <Badge>{t.sampleNote}</Badge>
        </p>
        <div className="grid gap-6 md:grid-cols-3">
          {t.items.map((item) => (
            <Card key={item.name} className="flex h-full flex-col">
              <figure className="flex h-full flex-col">
                <blockquote className="flex-1 text-lg">{item.quote}</blockquote>
                <figcaption className="mt-6">
                  <span className="block font-semibold">{item.name}</span>
                  <span className="text-sm text-muted">{item.role}</span>
                </figcaption>
              </figure>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}

export function PricingSection({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const p = dict.home.pricing;
  return (
    <Section tone="soft" aria-labelledby="pricing-title">
      <Container>
        <SectionHeading id="pricing-title" title={p.title} intro={p.intro} />
        <div className="grid gap-6 lg:grid-cols-3">
          {p.plans.map((plan) => (
            <div
              key={plan.name}
              className={cx(
                "relative flex flex-col rounded-2xl border bg-bg p-8",
                plan.highlight
                  ? "border-brand-solid shadow-lg ring-2 ring-brand-solid"
                  : "border-line shadow-sm",
              )}
            >
              {plan.highlight && (
                <span className="absolute -top-3 start-6 rounded-full bg-brand-solid px-3 py-0.5 text-xs font-semibold text-white">
                  {p.popular}
                </span>
              )}
              <h3 className="text-xl font-semibold">{plan.name}</h3>
              <p className="mt-1 text-muted">{plan.description}</p>
              <p className="mt-6">
                <span className="text-4xl font-bold">{plan.price}</span>{" "}
                <span className="text-muted">{plan.period}</span>
              </p>
              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <CheckIcon className="mt-0.5 shrink-0 text-brand" width={20} height={20} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <ButtonLink
                href={localizePath(locale, "/contact")}
                variant={plan.highlight ? "primary" : "secondary"}
                className="mt-8"
              >
                {plan.cta}
              </ButtonLink>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-muted">{p.note}</p>
      </Container>
    </Section>
  );
}

export function FaqList({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="divide-y divide-line rounded-2xl border border-line">
      {items.map((item) => (
        <details key={item.q} className="group p-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
            {item.q}
            <span
              aria-hidden="true"
              className="text-xl text-brand transition-transform group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <p className="mt-3 text-muted">{item.a}</p>
        </details>
      ))}
    </div>
  );
}

export function FaqSection({ dict }: { dict: Dictionary }) {
  const faq = dict.home.faq;
  return (
    <Section aria-labelledby="faq-title">
      <Container className="max-w-3xl">
        <SectionHeading id="faq-title" title={faq.title} intro={faq.intro} />
        <FaqList items={faq.items} />
      </Container>
    </Section>
  );
}

export function CtaBand({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const cta = dict.home.cta;
  return (
    <Section aria-labelledby="cta-title" className="pt-4">
      <Container>
        <div className="rounded-3xl bg-linear-to-br from-indigo-600 to-cyan-600 px-6 py-14 text-center text-white sm:px-12">
          <h2 id="cta-title" className="text-3xl font-bold text-balance sm:text-4xl">
            {cta.title}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/90">{cta.body}</p>
          <div className="mt-8">
            <ButtonLink
              href={localizePath(locale, "/contact")}
              variant="secondary"
              className="border-white bg-white text-indigo-700 hover:bg-indigo-50"
              arrow
            >
              {cta.button}
            </ButtonLink>
          </div>
        </div>
      </Container>
    </Section>
  );
}
