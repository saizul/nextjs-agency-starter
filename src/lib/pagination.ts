export interface Page<T> {
  items: T[];
  page: number;
  totalPages: number;
  totalItems: number;
  hasPrev: boolean;
  hasNext: boolean;
}

export function totalPagesFor(totalItems: number, perPage: number): number {
  return Math.max(1, Math.ceil(totalItems / Math.max(1, perPage)));
}

/** Slice a list into a 1-based page. Out-of-range pages are clamped. */
export function paginate<T>(items: readonly T[], page: number, perPage: number): Page<T> {
  const size = Math.max(1, Math.floor(perPage));
  const totalPages = totalPagesFor(items.length, size);
  const current = Math.min(Math.max(1, Math.floor(page) || 1), totalPages);
  const start = (current - 1) * size;
  return {
    items: items.slice(start, start + size),
    page: current,
    totalPages,
    totalItems: items.length,
    hasPrev: current > 1,
    hasNext: current < totalPages,
  };
}

/** Parse a route param into a valid positive integer, or null. */
export function parsePageParam(value: string | undefined): number | null {
  if (!value || !/^[1-9]\d*$/.test(value)) return null;
  return Number.parseInt(value, 10);
}
