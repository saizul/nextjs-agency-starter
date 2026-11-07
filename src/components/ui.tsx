import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { ArrowIcon } from "./icons";

export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

export function Container({ className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cx("mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8", className)} {...props} />
  );
}

export function Section({
  className,
  tone = "default",
  ...props
}: ComponentProps<"section"> & { tone?: "default" | "soft" }) {
  return (
    <section
      className={cx("py-16 sm:py-20", tone === "soft" && "bg-bg-soft", className)}
      {...props}
    />
  );
}

export function SectionHeading({
  id,
  eyebrow,
  title,
  intro,
  level = 2,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  intro?: string;
  level?: 1 | 2;
}) {
  const Tag = level === 1 ? "h1" : "h2";
  return (
    <div className="mb-10 max-w-2xl">
      {eyebrow && (
        <p className="mb-2 text-sm font-semibold tracking-wide text-brand uppercase">{eyebrow}</p>
      )}
      <Tag
        id={id}
        className={cx(
          "font-bold tracking-tight text-balance",
          level === 1 ? "text-4xl sm:text-5xl" : "text-3xl sm:text-4xl",
        )}
      >
        {title}
      </Tag>
      {intro && <p className="mt-4 text-lg text-muted">{intro}</p>}
    </div>
  );
}

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors";
const buttonVariants = {
  primary: "bg-brand-solid text-white hover:bg-indigo-700",
  secondary: "border border-line bg-bg text-fg hover:bg-bg-soft",
} as const;

export function ButtonLink({
  href,
  variant = "primary",
  arrow = false,
  children,
  className,
}: {
  href: string;
  variant?: keyof typeof buttonVariants;
  arrow?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={cx(buttonBase, buttonVariants[variant], className)}>
      {children}
      {arrow && <ArrowIcon width={16} height={16} className="rtl:rotate-180" />}
    </Link>
  );
}

export function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cx("rounded-2xl border border-line bg-bg p-6 shadow-sm", className)}
      {...props}
    />
  );
}

export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-semibold text-brand">
      {children}
    </span>
  );
}
