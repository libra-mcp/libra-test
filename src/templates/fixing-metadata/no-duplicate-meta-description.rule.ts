/**
 * At most one meta name="description" per file (heuristic).
 */

import path from "path";
import type { RuleContext, RuleResult } from "../../types.js";
import { walkByExtension, readFileLines } from "../../scan-util.js";

export const name = "Do not emit duplicate meta description";

const META_DESC = /<meta[^>]*name\s*=\s*["']description["'][^>]*>/gi;

export default async function check(context: RuleContext): Promise<RuleResult> {
  const violations: { file: string; line?: number; message?: string }[] = [];
  const exts = [".html", ".htm", ".tsx", ".jsx", ".vue"];
  for await (const filePath of walkByExtension(context.repoPath, exts)) {
    const lines = await readFileLines(filePath);
    const relativePath = path.relative(context.repoPath, filePath);
    if (relativePath.startsWith("src/templates/")) continue;
    let count = 0;
    for (let i = 0; i < lines.length; i++) {
      const matches = lines[i].match(META_DESC);
      if (matches) count += matches.length;
    }
    if (count > 1) {
      violations.push({ file: relativePath, message: "duplicate meta description" });
    }
  }
  return {
    pass: violations.length === 0,
    message: name,
    violations: violations.length ? violations : undefined,
  };
}
