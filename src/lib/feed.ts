export interface FeedItem {
  title: string;
  description: string;
  url: string;
  /** `YYYY-MM-DD` */
  date: string;
  tags?: string[];
}

export interface FeedInput {
  title: string;
  description: string;
  siteUrl: string;
  feedUrl: string;
  language: string;
  items: FeedItem[];
}

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function buildRss(feed: FeedInput): string {
  const lastBuild = feed.items[0] ? new Date(`${feed.items[0].date}T00:00:00Z`) : new Date(0);
  const items = feed.items
    .map((item) => {
      const categories = (item.tags ?? [])
        .map((tag) => `      <category>${escapeXml(tag)}</category>`)
        .join("\n");
      return [
        "    <item>",
        `      <title>${escapeXml(item.title)}</title>`,
        `      <link>${escapeXml(item.url)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(item.url)}</guid>`,
        `      <pubDate>${new Date(`${item.date}T00:00:00Z`).toUTCString()}</pubDate>`,
        `      <description>${escapeXml(item.description)}</description>`,
        categories,
        "    </item>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(feed.title)}</title>
    <link>${escapeXml(feed.siteUrl)}</link>
    <description>${escapeXml(feed.description)}</description>
    <language>${escapeXml(feed.language)}</language>
    <lastBuildDate>${lastBuild.toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(feed.feedUrl)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
}
