# Next.js Agency Starter

An SEO-first, bilingual (English and Bangla) website starter for agencies and freelancers. Built with the Next.js App Router, TypeScript (strict) and Tailwind CSS. No UI kit, no CMS lock-in: content lives in MDX files and typed dictionaries.

The sample brand is **Acme Digital**. All copy, case studies and testimonials are original placeholders, clearly marked as samples. Replace them with your own.

## Features

- **Pages**: home (hero, services, process, case studies, sample testimonials, pricing, FAQ, CTA), services index and dynamic service pages, case studies, blog, about and contact.
- **Content collections**: blog posts and case studies as MDX with zod-validated frontmatter, reading time, tags, pagination and tag archives.
- **Internationalisation**: `/en` and `/bn` routes, typed dictionary files, hreflang alternates with `x-default`, a language switcher that falls back gracefully when a post is not translated, and a proxy that redirects `/` by `Accept-Language` or the `NEXT_LOCALE` cookie. Inter for English and Hind Siliguri for Bangla, loaded with `next/font`.
- **SEO**: Metadata API per page, canonical URLs, Open Graph images generated with `next/og` for every blog post, JSON-LD (Organization, WebSite, BreadcrumbList, Article, FAQPage, Service), `sitemap.ts` with alternates, `robots.ts` and a per-locale RSS feed.
- **Contact form**: server action with zod validation, a honeypot field, in-memory rate limiting and delivery to a configurable webhook (for example n8n) signed with HMAC-SHA256. Errors are announced with `role="alert"`, linked to fields with `aria-describedby` and focus moves to the summary.
- **Accessibility and performance**: skip link, accessible mobile menu, visible focus styles, reduced-motion support, dark and light theme with no flash, static generation, `next/image` for local SVG assets and CSS/SVG illustrations only.
- **Quality**: ESLint (flat config), Prettier, 100+ Vitest unit tests, Playwright smoke tests and GitHub Actions CI on Node 20 and 22.

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open <http://localhost:3000>. You are redirected to `/en` or `/bn` based on your browser language.

| Script              | What it does                                       |
| ------------------- | -------------------------------------------------- |
| `npm run dev`       | Start the development server                       |
| `npm run build`     | Create the production build                        |
| `npm start`         | Serve the production build                         |
| `npm run lint`      | ESLint                                             |
| `npm run typecheck` | TypeScript in strict mode                          |
| `npm test`          | Vitest unit tests                                  |
| `npm run test:e2e`  | Playwright smoke tests (run `npm run build` first) |
| `npm run format`    | Prettier                                           |

## Project structure

```
content/
  en/ blog/*.mdx  case-studies/*.mdx      # English content
  bn/ blog/*.mdx  case-studies/*.mdx      # Bangla content
public/                                    # logo, favicon and SVG illustrations
e2e/                                       # Playwright smoke tests
src/
  app/
    [locale]/                              # all localized routes
      blog/ case-studies/ services/ about/ contact/
      layout.tsx                           # <html lang>, fonts, theme script, header and footer
      opengraph-image.tsx                  # default share image
    sitemap.ts  robots.ts
  components/                              # UI building blocks (server components by default)
  dictionaries/en.json  bn.json            # every user-facing string
  i18n/                                    # locale config, dictionaries, path and hreflang helpers
  lib/                                     # content loader, JSON-LD, RSS, HMAC, rate limit, contact logic
  proxy.ts                                 # locale redirect
```

## Configuration

Copy `.env.example` to `.env.local`.

| Variable                    | Purpose                                                            |
| --------------------------- | ------------------------------------------------------------------ |
| `NEXT_PUBLIC_SITE_URL`      | Public origin used for canonical URLs, sitemap, RSS and Open Graph |
| `CONTACT_WEBHOOK_URL`       | Where contact submissions are POSTed as JSON                       |
| `CONTACT_WEBHOOK_SECRET`    | Shared secret for the HMAC signature                               |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Address shown in the footer and contact page                       |

Without `CONTACT_WEBHOOK_URL`, submissions are logged to the server console in development and the form reports "not configured" in production.

### Webhook signature

Each request carries two headers:

- `X-Timestamp`: Unix time in seconds
- `X-Signature`: `sha256=<hex>`, the HMAC-SHA256 of `"<timestamp>.<raw body>"` using your secret

Verify it in the receiver (the repository exports `verifySignature` from `src/lib/hmac.ts`) and reject requests older than a few minutes. In n8n, use a Code node after the Webhook node to recompute the HMAC and compare it in constant time.

The payload looks like:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "company": "",
  "budget": "2k-5k",
  "message": "...",
  "locale": "en",
  "submittedAt": "2026-11-07T09:30:00.000Z",
  "source": "nextjs-agency-starter"
}
```

> The rate limiter is in memory, so it resets on restart and is per instance. For several instances or serverless functions, swap `createRateLimiter` for a shared store such as Redis.

## Adding content

### Blog post

Create `content/en/blog/my-post.mdx` (and optionally `content/bn/blog/my-post.mdx` with the same slug):

```mdx
---
title: "My post title"
description: "A summary between 20 and 300 characters."
date: "2026-11-07"
tags: ["SEO", "Performance"]
# optional: updated, author, draft: true, ogTitle (Latin title for the share image)
---

Write in Markdown or MDX. Use `##` headings; they get anchor ids.
```

Reading time, tag pages, pagination, the RSS feed, the sitemap entry and the Open Graph image are all generated automatically. Set `draft: true` to hide a post. Page size is `POSTS_PER_PAGE` in `src/lib/content.ts`.

Posts that exist in only one language are handled: hreflang lists only the available languages and the language switcher links to the blog index for the missing one.

### Case study

Create `content/en/case-studies/my-project.mdx` with `title`, `summary`, `date`, `client`, `industry`, `services`, `duration`, `cover` (a path under `public/`, SVG or PNG), `results` and optional `featured`. Invalid frontmatter fails the build with the file name and the field that is wrong.

### Services, pricing, FAQ and other copy

These live in `src/dictionaries/en.json` and `bn.json`. To add a service, append an item to `services.items` in both files (same `slug`). A unit test fails if the files get out of sync.

### Adding a language

1. Add the code to `locales` in `src/i18n/config.ts` (plus `localeNames` and `ogLocales`).
2. Create `src/dictionaries/<code>.json` and register it in `src/i18n/dictionaries.ts`.
3. Add `content/<code>/...` and, for a non-Latin script, a font in `src/app/[locale]/layout.tsx`.

## Deployment

### Vercel

Import the repository, set the environment variables above and deploy. No extra configuration is needed.

### Any Node host

```bash
npm ci
npm run build
npm start        # listens on PORT (default 3000)
```

Put it behind a reverse proxy such as Nginx or Caddy, and set `NEXT_PUBLIC_SITE_URL` to the public origin **before** building, because it is inlined into canonical URLs and the sitemap.

### Static export

```bash
STATIC_EXPORT=true npm run build   # outputs ./out
```

Static export has no server, so the contact server action and the locale-redirect proxy are unavailable. Point the form at an external endpoint and add a redirect from `/` to `/en` on your host (for example a `_redirects` file on Netlify or Cloudflare Pages). The default Open Graph images are also generated at build time and are included.

## Lighthouse and performance tips

- Test the production build (`npm run build && npm start`), not the dev server, in a private window without extensions.
- Pages are statically generated, so most of the score comes from keeping client JavaScript small. Only the navigation, theme toggle, language switcher and contact form are client components.
- Use `next/image` with explicit `width` and `height` for raster images to avoid layout shift. Prefer SVG for illustrations. If you add large PNG or JPEG files, remove `unoptimized` so Next.js can resize them.
- Keep to one or two font families and a few weights. Bangla loads only on `/bn` pages.
- Check that `NEXT_PUBLIC_SITE_URL` is correct, otherwise the SEO audit will flag canonical and hreflang mismatches.
- Validate structured data with the Rich Results Test and the sitemap in Search Console after you deploy.

## Testing

```bash
npm test                  # unit tests for content loading, reading time, i18n helpers,
                          # HMAC signing, JSON-LD, RSS, rate limiting and the contact flow
npx playwright install chromium
npm run build && npm run test:e2e
```

## License

[MIT](LICENSE) © 2026 [Saizul Amin](https://saizul.com)
