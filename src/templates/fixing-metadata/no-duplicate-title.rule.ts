/**
 * Do not emit duplicate title tags in the same file. fixing-metadata rule.
 * Heuristic: file contains more than one <title>.
 */

import path from "path";
import type { RuleContext, RuleResult } from "../../types.js";
import { walkByExtension, readFileLines } from "../../scan-util.js";

export const name = "Do not emit duplicate title (one per page)";

const TITLE_TAG = /<title\s*[^>]*>/i;
const PAGE_EXTENSIONS = [".html", ".htm", ".tsx", ".jsx", ".vue"];

export default async function check(context: RuleContext): Promise<RuleResult> {
  const violations: { file: string; line?: number; message?: string }[] = [];
  const repoPath = context.repoPath;

  for await (const filePath of walkByExtension(repoPath, PAGE_EXTENSIONS)) {
    const lines = await readFileLines(filePath);
    const relativePath = path.relative(repoPath, filePath);
    const titleLines: number[] = [];
    for (let i = 0; i < lines.length; i++) {
      if (TITLE_TAG.test(lines[i])) titleLines.push(i + 1);
    }
    if (titleLines.length > 1) {
      for (const ln of titleLines) {
        violations.push({ file: relativePath, line: ln, message: "duplicate title" });
      }
    }
  }

  return {
    pass: violations.length === 0,
    message: name,
    violations: violations.length > 0 ? violations : undefined,
  };
}
