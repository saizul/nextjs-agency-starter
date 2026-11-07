import Link from "next/link";
import { interpolate } from "@/i18n/utils";

export function Pagination({
  page,
  totalPages,
  hrefFor,
  labels,
}: {
  page: number;
  totalPages: number;
  hrefFor: (page: number) => string;
  labels: { nav: string; newer: string; older: string; pageOf: string };
}) {
  if (totalPages <= 1) return null;
  const linkClass =
    "rounded-full border border-line px-4 py-2 text-sm font-medium hover:bg-bg-soft";
  return (
    <nav aria-label={labels.nav} className="mt-12 flex items-center justify-between gap-4">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} rel="prev" className={linkClass}>
          {labels.newer}
        </Link>
      ) : (
        <span />
      )}
      <p className="text-sm text-muted" aria-current="page">
        {interpolate(labels.pageOf, { page, total: totalPages })}
      </p>
      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} rel="next" className={linkClass}>
          {labels.older}
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
