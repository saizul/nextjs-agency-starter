import { ImageResponse } from "next/og";
import { locales } from "@/i18n/config";
import { getPost, getPosts } from "@/lib/content";
import { resolveLocale } from "@/lib/page";
import { siteConfig } from "@/lib/site";

export const alt = "Blog post cover";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return locales.flatMap((locale) => getPosts(locale).map((post) => ({ locale, slug: post.slug })));
}

export default async function Image({ params }: Props) {
  const { locale: rawLocale, slug } = await params;
  const locale = await resolveLocale(Promise.resolve({ locale: rawLocale }));
  const post = getPost(locale, slug);
  // next/og ships a Latin-only font, so non-Latin posts supply an `ogTitle` in frontmatter.
  const title =
    post?.data.ogTitle ?? (locale === "en" ? post?.data.title : undefined) ?? siteConfig.name;
  const tags = (post?.data.tags ?? []).filter((t) => /^[\x20-\x7e]+$/.test(t)).slice(0, 3);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        color: "#ffffff",
        background: "linear-gradient(135deg, #4338ca 0%, #0891b2 100%)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", fontSize: 32, fontWeight: 700 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: "#ffffff",
            marginRight: 16,
            display: "flex",
          }}
        />
        {siteConfig.name}
      </div>
      <div
        style={{
          display: "flex",
          fontSize: title.length > 70 ? 56 : 68,
          fontWeight: 800,
          lineHeight: 1.12,
          letterSpacing: -1,
        }}
      >
        {title}
      </div>
      <div style={{ display: "flex", fontSize: 28, opacity: 0.9 }}>
        {tags.map((tag) => (
          <div
            key={tag}
            style={{
              display: "flex",
              marginRight: 16,
              padding: "6px 18px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.2)",
            }}
          >
            {tag}
          </div>
        ))}
      </div>
    </div>,
    size,
  );
}
