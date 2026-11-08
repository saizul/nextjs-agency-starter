# Changelog

All notable changes to this project are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- Security headers are now built by `src/lib/security-headers.ts` (with tests) and add a Content-Security-Policy, Strict-Transport-Security and Cross-Origin-Opener-Policy in production builds.

## [1.0.0] - 2026-11-07

### Added

- Next.js App Router starter with TypeScript (strict) and Tailwind CSS, no UI kit.
- Pages: home (hero, services, process, case studies, sample testimonials, pricing, FAQ, CTA), services index and service detail pages, case studies, blog, about and contact.
- English and Bangla routes (`/en`, `/bn`) with typed dictionaries, hreflang alternates and a locale-aware language switcher.
- MDX content collections with zod-validated frontmatter for blog posts and case studies, reading time, tags and pagination.
- SEO: Metadata API helper, canonical URLs, generated Open Graph images per blog post (`next/og`), JSON-LD builders (Organization, WebSite, BreadcrumbList, Article, FAQPage, Service), `sitemap.ts`, `robots.ts` and per-locale RSS feeds.
- Contact form server action with zod validation, honeypot, in-memory rate limiting and an HMAC-signed webhook (for example n8n).
- Dark and light theme without a flash of the wrong theme, skip link, accessible mobile menu and visible focus styles.
- Vitest unit tests, Playwright smoke tests, ESLint, Prettier and a GitHub Actions workflow for Node 20 and 22.
