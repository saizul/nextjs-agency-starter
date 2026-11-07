import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { formatDate, interpolate, localizePath } from "@/i18n/utils";
import type { CaseStudy, Post } from "@/lib/content";
import { slugifyTag } from "@/lib/tags";
import { ServiceIcon } from "./icons";
import { Badge, Card } from "./ui";

export function ServiceCard({
  locale,
  service,
  learnMore,
}: {
  locale: Locale;
  service: Dictionary["services"]["items"][number];
  learnMore: string;
}) {
  return (
    <Card className="flex h-full flex-col">
      <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-soft text-brand">
        <ServiceIcon name={service.icon} />
      </span>
      <h3 className="text-xl font-semibold">{service.name}</h3>
      <p className="mt-2 flex-1 text-muted">{service.summary}</p>
      <Link
        href={localizePath(locale, `/services/${service.slug}`)}
        className="mt-5 font-semibold text-brand underline-offset-4 hover:underline"
      >
        {learnMore}
        <span className="sr-only">: {service.name}</span>
      </Link>
    </Card>
  );
}

export function CaseCard({
  locale,
  study,
  dict,
}: {
  locale: Locale;
  study: CaseStudy;
  dict: Dictionary;
}) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-bg shadow-sm">
      <Image
        src={study.data.cover}
        alt=""
        width={640}
        height={360}
        unoptimized
        className="aspect-video w-full object-cover"
      />
      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap gap-2">
          <Badge>{study.data.industry}</Badge>
          <Badge>{dict.common.sampleBadge}</Badge>
        </div>
        <h3 className="mt-3 text-xl font-semibold">
          <Link
            href={localizePath(locale, `/case-studies/${study.slug}`)}
            className="after:absolute after:inset-0 hover:underline"
          >
            {study.data.title}
          </Link>
        </h3>
        <p className="mt-2 flex-1 text-muted">{study.data.summary}</p>
      </div>
    </article>
  );
}

export function PostCard({ locale, post, dict }: { locale: Locale; post: Post; dict: Dictionary }) {
  return (
    <article className="relative flex h-full flex-col rounded-2xl border border-line bg-bg p-6 shadow-sm">
      <p className="text-sm text-muted">
        <time dateTime={post.data.date}>{formatDate(locale, post.data.date)}</time>
        {" · "}
        {interpolate(dict.common.minRead, { min: post.readingMinutes })}
      </p>
      <h2 className="mt-2 text-xl font-semibold">
        <Link href={localizePath(locale, `/blog/${post.slug}`)} className="hover:underline">
          {post.data.title}
        </Link>
      </h2>
      <p className="mt-2 flex-1 text-muted">{post.data.description}</p>
      <ul className="mt-4 flex flex-wrap gap-2" aria-label={dict.common.tags}>
        {post.data.tags.map((tag) => (
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
    </article>
  );
}
