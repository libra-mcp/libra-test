/**
 * Prefer one JSON-LD block per page. At most one script type="application/ld+json" per file (heuristic). fixing-metadata rule.
 */

import path from "path";
import type { RuleContext, RuleResult } from "../../types.js";
import { walkByExtension, readFileLines } from "../../scan-util.js";

export const name = "Do not emit duplicate JSON-LD (prefer one per page)";

const JSON_LD = /<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>|type\s*=\s*["']application\/ld\+json["']/gi;

const PAGE_EXTENSIONS = [".html", ".htm", ".tsx", ".jsx", ".vue"];

export default async function check(context: RuleContext): Promise<RuleResult> {
  const violations: { file: string; line?: number; message?: string }[] = [];
  for await (const filePath of walkByExtension(context.repoPath, PAGE_EXTENSIONS)) {
    const lines = await readFileLines(filePath);
    const relativePath = path.relative(context.repoPath, filePath);
    if (relativePath.startsWith("src/templates/")) continue;
    let count = 0;
    for (let i = 0; i < lines.length; i++) {
      const matches = lines[i].match(JSON_LD);
      if (matches) count += matches.length;
    }
    if (count > 1) {
      violations.push({ file: relativePath, message: "duplicate JSON-LD script (prefer one per page)" });
    }
  }
  return {
    pass: violations.length === 0,
    message: name,
    violations: violations.length ? violations : undefined,
  };
}
