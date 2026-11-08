export type HeaderEntry = { key: string; value: string };

export type SecurityHeaderOptions = {
  /** True when running `next dev`. Strict CSP and HSTS are skipped because HMR needs eval and websockets. */
  dev?: boolean;
};

/**
 * Builds the Content-Security-Policy value.
 *
 * Next.js and the JSON-LD component emit inline scripts, so `script-src` allows
 * `'unsafe-inline'`. The remaining directives still block plugins, base-tag hijacking,
 * cross-origin form posts and framing by other sites.
 */
export function buildContentSecurityPolicy(): string {
  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": ["'self'", "'unsafe-inline'"],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "blob:"],
    "font-src": ["'self'", "data:"],
    "connect-src": ["'self'"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'self'"],
  };
  return Object.entries(directives)
    .map(([name, values]) => `${name} ${values.join(" ")}`)
    .join("; ");
}

/** Response headers applied to every route when the site runs on a Node runtime. */
export function buildSecurityHeaders({ dev = false }: SecurityHeaderOptions = {}): HeaderEntry[] {
  const headers: HeaderEntry[] = [
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "SAMEORIGIN" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  ];
  if (!dev) {
    headers.push(
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
      { key: "Content-Security-Policy", value: buildContentSecurityPolicy() },
    );
  }
  return headers;
}
