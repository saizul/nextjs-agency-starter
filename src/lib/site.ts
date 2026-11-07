export const siteConfig = {
  name: "Acme Digital",
  author: "Saizul Amin",
  authorUrl: "https://saizul.com",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@example.com",
  socials: [] as string[],
};

export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}

export function absoluteUrl(path = "/", siteUrl = getSiteUrl()): string {
  const base = siteUrl.replace(/\/+$/, "");
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
