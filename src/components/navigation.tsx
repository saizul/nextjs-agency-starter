"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState, type KeyboardEvent } from "react";
import { CloseIcon, MenuIcon } from "./icons";
import { cx } from "./ui";

export interface NavItem {
  href: string;
  label: string;
}

function isActive(pathname: string, href: string, homeHref: string) {
  if (href === homeHref) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navigation({
  items,
  homeHref,
  labels,
}: {
  items: NavItem[];
  homeHref: string;
  labels: { primary: string; menu: string; close: string };
}) {
  const pathname = usePathname();
  // Remember which path the menu was opened on: navigating elsewhere closes it automatically.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const buttonRef = useRef<HTMLButtonElement>(null);

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape" && open) {
      setOpenOn(null);
      buttonRef.current?.focus();
    }
  }

  const linkClass = (active: boolean) =>
    cx(
      "rounded-full px-3 py-2 text-sm font-medium hover:bg-bg-soft",
      active ? "text-brand" : "text-fg",
    );

  return (
    <div onKeyDown={onKeyDown} className="flex items-center">
      <nav aria-label={labels.primary} className="hidden md:block">
        <ul className="flex items-center gap-1">
          {items.map((item) => {
            const active = isActive(pathname, item.href, homeHref);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={linkClass(active)}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <button
        ref={buttonRef}
        type="button"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line md:hidden"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? labels.close : labels.menu}
        onClick={() => setOpenOn(open ? null : pathname)}
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </button>

      {open && (
        <nav
          id="mobile-menu"
          aria-label={labels.primary}
          className="absolute inset-x-0 top-full border-b border-line bg-bg shadow-lg md:hidden"
        >
          <ul className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4">
            {items.map((item) => {
              const active = isActive(pathname, item.href, homeHref);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cx(linkClass(active), "block text-base")}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </div>
  );
}
