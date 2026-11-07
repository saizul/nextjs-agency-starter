import { describe, expect, it } from "vitest";
import { buildRss, escapeXml } from "./feed";

const feed = {
  title: "Blog & News",
  description: "Desc",
  siteUrl: "https://x.test/en/blog",
  feedUrl: "https://x.test/en/blog/rss.xml",
  language: "en",
  items: [
    {
      title: "A <b>post</b>",
      description: "Tom & Jerry",
      url: "https://x.test/en/blog/a",
      date: "2026-09-12",
      tags: ["SEO"],
    },
  ],
};

describe("rss feed", () => {
  it("escapes XML special characters", () => {
    expect(escapeXml(`<a href="x">'&'</a>`)).toBe(
      "&lt;a href=&quot;x&quot;&gt;&apos;&amp;&apos;&lt;/a&gt;",
    );
  });

  it("produces a valid-looking RSS 2.0 document", () => {
    const xml = buildRss(feed);
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('<rss version="2.0"');
    expect(xml).toContain("<title>Blog &amp; News</title>");
    expect(xml).toContain("<title>A &lt;b&gt;post&lt;/b&gt;</title>");
    expect(xml).toContain("<category>SEO</category>");
  });

  it("formats pubDate in RFC 822 style", () => {
    expect(buildRss(feed)).toContain("<pubDate>Sat, 12 Sep 2026 00:00:00 GMT</pubDate>");
  });

  it("includes a self link and handles empty feeds", () => {
    const xml = buildRss({ ...feed, items: [] });
    expect(xml).toContain('rel="self"');
    expect(xml).not.toContain("<item>");
  });
});
