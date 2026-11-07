const WORDS_PER_MINUTE = 200;

/** Remove markdown/MDX syntax so only readable words are counted. */
export function stripMarkdown(source: string): string {
  return source
    .replace(/^---[\s\S]*?---\s*/m, " ") // frontmatter, if any slipped through
    .replace(/```[\s\S]*?```/g, " ") // fenced code
    .replace(/`[^`]*`/g, " ") // inline code
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ") // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // links keep their text
    .replace(/<[^>]+>/g, " ") // html / jsx tags
    .replace(/^[#>\-*+\d.\s]+(?=\S)/gm, " ") // heading, quote and list markers
    .replace(/[*_~|]/g, " ");
}

export function countWords(text: string): number {
  const words = stripMarkdown(text).match(/[\p{L}\p{N}\p{M}]+(?:['’-][\p{L}\p{N}\p{M}]+)*/gu);
  return words ? words.length : 0;
}

/** Whole minutes to read, never less than 1. */
export function readingTime(text: string, wordsPerMinute = WORDS_PER_MINUTE): number {
  const words = countWords(text);
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}
