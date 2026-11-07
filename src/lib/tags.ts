export function slugifyTag(tag: string): string {
  return tag
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\p{M}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

export interface TagCount {
  tag: string;
  slug: string;
  count: number;
}

/** Count tags across items. Sorted by count (desc) then name. */
export function collectTags(lists: readonly (readonly string[])[]): TagCount[] {
  const map = new Map<string, TagCount>();
  for (const tags of lists) {
    const seen = new Set<string>();
    for (const tag of tags) {
      const slug = slugifyTag(tag);
      if (!slug || seen.has(slug)) continue;
      seen.add(slug);
      const existing = map.get(slug);
      if (existing) existing.count += 1;
      else map.set(slug, { tag, slug, count: 1 });
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.slug.localeCompare(b.slug));
}

export function hasTag(tags: readonly string[], slug: string): boolean {
  return tags.some((t) => slugifyTag(t) === slug);
}
