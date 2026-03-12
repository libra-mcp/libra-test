/**
 * At most one link rel="canonical" and at most one meta property="og:url" per file. fixing-metadata rule.
 */

import path from "path";
import type { RuleContext, RuleResult } from "../../types.js";
import { walkByExtension, readFileLines } from "../../scan-util.js";

export const name = "Do not emit duplicate canonical";

const LINK_CANONICAL = /<link[^>]*rel\s*=\s*["'](?:[^"']*\s+)?canonical(?:\s+[^"']*)?["'][^>]*>|<link[^>]*href\s*=[^>]*rel\s*=\s*["'](?:[^"']*\s+)?canonical/gi;
const META_OG_URL = /<meta[^>]*property\s*=\s*["']og:url["'][^>]*>|<meta[^>]*content\s*=[^>]*property\s*=\s*["']og:url["']/gi;

const PAGE_EXTENSIONS = [".html", ".htm", ".tsx", ".jsx", ".vue"];

function countMatches(lines: string[], regex: RegExp): number {
  let count = 0;
  for (let i = 0; i < lines.length; i++) {
    const matches = lines[i].match(regex);
    if (matches) count += matches.length;
  }
  return count;
}

export default async function check(context: RuleContext): Promise<RuleResult> {
  const violations: { file: string; line?: number; message?: string }[] = [];
  for await (const filePath of walkByExtension(context.repoPath, PAGE_EXTENSIONS)) {
    const lines = await readFileLines(filePath);
    const relativePath = path.relative(context.repoPath, filePath);
    if (relativePath.startsWith("src/templates/")) continue;
    const linkCount = countMatches(lines, LINK_CANONICAL);
    const ogUrlCount = countMatches(lines, META_OG_URL);
    if (linkCount > 1) {
      violations.push({ file: relativePath, message: "duplicate link rel=\"canonical\"" });
    }
    if (ogUrlCount > 1) {
      violations.push({ file: relativePath, message: "duplicate meta property=\"og:url\"" });
    }
  }
  return {
    pass: violations.length === 0,
    message: name,
    violations: violations.length ? violations : undefined,
  };
}
