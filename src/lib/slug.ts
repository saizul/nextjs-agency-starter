/** Plain-text slug for heading anchors. Keeps Bangla letters. */
export function slugifyHeading(text: string): string {
  return text
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\p{M}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}
