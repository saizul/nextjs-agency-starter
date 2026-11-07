import { ImageResponse } from "next/og";
import { locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

export const alt = "Acme Digital";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// The default share image. It uses the English copy because next/og ships a Latin-only font.
export default async function Image() {
  const dict = getDictionary("en");
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: 80,
        color: "#ffffff",
        background: "linear-gradient(135deg, #4338ca 0%, #0891b2 100%)",
      }}
    >
      <div style={{ display: "flex", fontSize: 88, fontWeight: 800 }}>{dict.meta.siteName}</div>
      <div style={{ display: "flex", fontSize: 44, marginTop: 16, opacity: 0.92 }}>
        {dict.meta.tagline}
      </div>
    </div>,
    size,
  );
}
