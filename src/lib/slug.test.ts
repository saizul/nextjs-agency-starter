import { describe, expect, it } from "vitest";
import { slugifyHeading } from "./slug";

describe("slugifyHeading", () => {
  it("creates anchor ids", () => {
    expect(slugifyHeading("Crawling and indexing")).toBe("crawling-and-indexing");
    expect(slugifyHeading("What to do next?")).toBe("what-to-do-next");
  });
  it("keeps Bangla text", () => {
    expect(slugifyHeading("ক্রলিং ও ইনডেক্সিং")).toBe("ক্রলিং-ও-ইনডেক্সিং");
  });
});
