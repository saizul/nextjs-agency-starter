/**
 * Editorial audit of content/ (broken links and images, SEO lengths, dates, duplicate
 * titles, tag spelling, translations). Usage:
 *   npm run content:check            # exit 1 on errors
 *   npm run content:check -- --strict   # exit 1 on warnings too
 *   npm run content:check -- --json     # machine-readable output
 */
import path from "node:path";
import en from "../src/dictionaries/en.json";
import { auditContent } from "../src/lib/content-audit";

const root = process.cwd();
const args = new Set(process.argv.slice(2));
const unknown = [...args].filter((a) => !["--strict", "--json"].includes(a));
if (unknown.length) {
  console.error(
    `unknown option(s): ${unknown.join(", ")}\nUsage: content:check [--strict] [--json]`,
  );
  process.exit(2);
}

const issues = auditContent({
  contentRoot: path.join(root, "content"),
  publicDir: path.join(root, "public"),
  serviceSlugs: en.services.items.map((item) => item.slug),
});
const errors = issues.filter((i) => i.severity === "error").length;
const warnings = issues.length - errors;

if (args.has("--json")) {
  console.log(JSON.stringify({ errors, warnings, issues }, null, 2));
} else {
  for (const i of issues)
    console.log(`${i.severity === "error" ? "error" : "warn "}  ${i.file}: ${i.message}`);
  console.log(`\ncontent check: ${errors} error(s), ${warnings} warning(s)`);
}
process.exit(errors || (args.has("--strict") && warnings) ? 1 : 0);
