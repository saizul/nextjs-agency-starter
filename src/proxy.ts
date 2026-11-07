import { NextResponse, type NextRequest } from "next/server";
import { isLocale } from "@/i18n/config";
import { negotiateLocale, splitLocale } from "@/i18n/utils";

/**
 * Redirects locale-less URLs (`/`, `/blog`) to the visitor's language (`/en`, `/bn/blog`).
 * A NEXT_LOCALE cookie, when present, wins over the Accept-Language header.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (splitLocale(pathname).locale) return NextResponse.next();

  const cookie = request.cookies.get("NEXT_LOCALE")?.value;
  const locale = isLocale(cookie)
    ? cookie
    : negotiateLocale(request.headers.get("accept-language"));

  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;
  url.search = search;
  return NextResponse.redirect(url);
}

export const config = {
  // Skip Next.js internals and anything with a file extension (sitemap.xml, robots.txt, images).
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
