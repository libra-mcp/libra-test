/**
 * At most one meta name="robots" per file. fixing-metadata rule.
 */

import path from "path";
import type { RuleContext, RuleResult } from "../../types.js";
import { walkByExtension, readFileLines } from "../../scan-util.js";

export const name = "Do not emit duplicate robots meta";

const META_ROBOTS = /<meta[^>]*name\s*=\s*["']robots["'][^>]*>/gi;

const PAGE_EXTENSIONS = [".html", ".htm", ".tsx", ".jsx", ".vue"];

export default async function check(context: RuleContext): Promise<RuleResult> {
  const violations: { file: string; line?: number; message?: string }[] = [];
  for await (const filePath of walkByExtension(context.repoPath, PAGE_EXTENSIONS)) {
    const lines = await readFileLines(filePath);
    const relativePath = path.relative(context.repoPath, filePath);
    if (relativePath.startsWith("src/templates/")) continue;
    let count = 0;
    for (let i = 0; i < lines.length; i++) {
      const matches = lines[i].match(META_ROBOTS);
      if (matches) count += matches.length;
    }
    if (count > 1) {
      violations.push({ file: relativePath, message: "duplicate meta robots" });
    }
  }
  return {
    pass: violations.length === 0,
    message: name,
    violations: violations.length ? violations : undefined,
  };
}
