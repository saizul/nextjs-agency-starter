import { describe, expect, it } from "vitest";
import { paginate, parsePageParam, totalPagesFor } from "./pagination";

const items = Array.from({ length: 7 }, (_, i) => i + 1);

describe("pagination", () => {
  it("computes total pages with a minimum of one", () => {
    expect(totalPagesFor(0, 3)).toBe(1);
    expect(totalPagesFor(7, 3)).toBe(3);
    expect(totalPagesFor(6, 3)).toBe(2);
  });

  it("slices the requested page", () => {
    const page = paginate(items, 2, 3);
    expect(page.items).toEqual([4, 5, 6]);
    expect(page.hasPrev).toBe(true);
    expect(page.hasNext).toBe(true);
  });

  it("returns a short final page", () => {
    const page = paginate(items, 3, 3);
    expect(page.items).toEqual([7]);
    expect(page.hasNext).toBe(false);
  });

  it("clamps out-of-range pages", () => {
    expect(paginate(items, 99, 3).page).toBe(3);
    expect(paginate(items, 0, 3).page).toBe(1);
    expect(paginate(items, Number.NaN, 3).page).toBe(1);
  });

  it("handles empty lists", () => {
    const page = paginate([], 1, 3);
    expect(page.items).toEqual([]);
    expect(page.totalPages).toBe(1);
    expect(page.hasNext).toBe(false);
  });

  it("guards against a zero page size", () => {
    expect(paginate(items, 1, 0).items).toEqual([1]);
  });

  it("parses page params strictly", () => {
    expect(parsePageParam("2")).toBe(2);
    expect(parsePageParam("0")).toBeNull();
    expect(parsePageParam("02")).toBeNull();
    expect(parsePageParam("abc")).toBeNull();
    expect(parsePageParam("-1")).toBeNull();
    expect(parsePageParam(undefined)).toBeNull();
  });
});
