import { serializeJsonLd } from "@/lib/jsonld";

export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      // Serialised by our own builders; "<" is escaped so the script tag cannot be closed early.
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
