import { describe, expect, it } from "vitest";
import { countWords, readingTime, stripMarkdown } from "./reading-time";

const words = (n: number) => Array.from({ length: n }, (_, i) => `word${i}`).join(" ");

describe("reading time", () => {
  it("returns at least one minute for tiny or empty text", () => {
    expect(readingTime("")).toBe(1);
    expect(readingTime("hello")).toBe(1);
  });

  it("rounds up to the next minute at 200 wpm", () => {
    expect(readingTime(words(200))).toBe(1);
    expect(readingTime(words(201))).toBe(2);
    expect(readingTime(words(1000))).toBe(5);
  });

  it("supports a custom reading speed", () => {
    expect(readingTime(words(300), 100)).toBe(3);
  });

  it("ignores fenced and inline code", () => {
    const text = `Hello world\n\n\`\`\`ts\n${words(500)}\n\`\`\`\n\nUse \`${words(50)}\` here`;
    expect(countWords(text)).toBe(4);
  });

  it("keeps link text but drops URLs and images", () => {
    expect(
      countWords("[read the guide](https://example.com/very/long/url) ![alt text](/img.png)"),
    ).toBe(3);
  });

  it("strips html and jsx tags", () => {
    expect(stripMarkdown("<Callout tone='info'>Hi</Callout>")).not.toContain("Callout");
  });

  it("counts Bangla words", () => {
    expect(countWords("আমরা দ্রুত ওয়েবসাইট তৈরি করি")).toBe(5);
  });

  it("counts hyphenated and apostrophe words once", () => {
    expect(countWords("well-known don't")).toBe(2);
  });
});
